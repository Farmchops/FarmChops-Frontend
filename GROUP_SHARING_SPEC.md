# Group Sharing - Backend API Specification

**Feature:** Group Buying (Group Sharing)
**Version:** 1.0
**Date:** 2025-11-15

---

## Overview

Group Sharing allows multiple customers to pool together to buy products in bulk at discounted prices. Each participant gets a **fixed quantity** at a **fixed price** (predetermined by admin).

### Key Features

- ✅ **Fixed Shares:** Admin sets quantity and price per slot (not customer-chosen)
- ✅ **No Time Limit:** Groups stay open until all slots filled
- ✅ **Pay-on-Join:** Customers pay immediately when joining
- ✅ **Auto-Confirm:** Group auto-confirms when all slots filled
- ✅ **Individual Orders:** Group splits into separate orders

---

## Data Models

### 1. Product (Add to existing model)

```typescript
interface Product {
  // ... existing fields

  groupBuyingEnabled: boolean;
  groupConfig?: {
    totalSlots: number;         // e.g., 10 people
    quantityPerSlot: number;    // e.g., 10kg per person
    pricePerSlot: number;       // e.g., ₦4,500 per person
    maxActiveGroups: number;    // e.g., 5 concurrent groups
  };
}
```

**Example:**
```json
{
  "name": "Premium Rice - 50kg",
  "groupBuyingEnabled": true,
  "groupConfig": {
    "totalSlots": 10,
    "quantityPerSlot": 10,
    "pricePerSlot": 4500,
    "maxActiveGroups": 5
  }
}
```

---

### 2. GroupOrder (New Collection)

```typescript
interface GroupOrder {
  _id: ObjectId;
  groupId: string;              // "GRP-ABC123"

  product: {
    _id: ObjectId;
    name: string;
    images: string[];
  };

  totalSlots: number;           // 10
  quantityPerSlot: number;      // 10kg
  pricePerSlot: number;         // ₦4,500

  participants: GroupParticipant[];
  filledSlots: number;          // 0-10

  status: 'active' | 'confirmed' | 'cancelled';

  createdAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancelledReason?: string;
}
```

---

### 3. GroupParticipant (Nested)

```typescript
interface GroupParticipant {
  id: string;
  userId: ObjectId;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  quantity: number;             // = quantityPerSlot
  amount: number;               // = pricePerSlot

  paymentStatus: 'paid';
  paymentReference: string;
  paidAt: Date;

  deliveryInfo: {
    address: string;
    city: string;
    state: string;
    phoneNumber: string;
  };
  deliveryFee: number;

  orderId?: ObjectId;           // Set when group confirms
  joinedAt: Date;
}
```

---

## API Endpoints

### Customer Endpoints

#### 1. Get Active Groups
```http
GET /api/group-orders/active
```

**Response:**
```json
{
  "groups": [
    {
      "groupId": "GRP-ABC123",
      "product": {
        "name": "Premium Rice",
        "images": ["..."]
      },
      "totalSlots": 10,
      "filledSlots": 7,
      "quantityPerSlot": 10,
      "pricePerSlot": 4500,
      "status": "active"
    }
  ]
}
```

---

#### 2. Join Group
```http
POST /api/group-orders/:groupId/join
Authorization: Bearer <token>
```

**Request:**
```json
{
  "deliveryInfo": {
    "address": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "phoneNumber": "08012345678"
  },
  "paymentReference": "PAY-XYZ-123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Joined successfully",
  "filledSlots": 8,
  "totalSlots": 10
}
```

**Response (Group Full - Auto-Confirmed):**
```json
{
  "success": true,
  "message": "Group full! Order created",
  "order": {
    "orderNumber": "ORD-123456",
    "orderStatus": "ready_for_processing"
  }
}
```

---

#### 3. Leave Group
```http
POST /api/group-orders/:groupId/leave
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "refund": {
    "amount": 6000,
    "status": "processing"
  }
}
```

---

#### 4. My Groups
```http
GET /api/users/me/group-orders
Authorization: Bearer <token>
```

**Response:**
```json
{
  "groups": [
    {
      "groupId": "GRP-ABC123",
      "product": { "name": "..." },
      "filledSlots": 7,
      "totalSlots": 10,
      "status": "active",
      "myParticipation": {
        "amount": 4500,
        "quantity": 10,
        "paymentStatus": "paid",
        "orderId": null
      }
    }
  ]
}
```

---

### Admin Endpoints

#### 5. Enable Group Buying
```http
POST /api/admin/products/:productId/group-config
```

**Request:**
```json
{
  "groupBuyingEnabled": true,
  "totalSlots": 10,
  "quantityPerSlot": 10,
  "pricePerSlot": 4500,
  "maxActiveGroups": 5
}
```

---

#### 6. Get All Groups (Admin)
```http
GET /api/admin/group-orders
```

**Response:**
```json
{
  "groups": [ ... ],
  "stats": {
    "totalActiveGroups": 15,
    "totalRevenue": 2450000
  }
}
```

---

#### 7. Cancel Group
```http
POST /api/admin/group-orders/:groupId/cancel
```

**Request:**
```json
{
  "reason": "Product out of stock"
}
```

---

## Workflow Logic

### Join Group Flow

1. **Verify payment** via Paystack
2. **Check if group full** (race condition handling)
3. **Add participant** to group
4. **If full (10/10)** → Auto-confirm:
   - Create 10 individual orders
   - Set status: `ready_for_processing`
   - Link orders to group
5. **If not full** → Wait for more participants

---

### Auto-Confirm Logic

```javascript
if (group.filledSlots === group.totalSlots) {
  // Create individual order for each participant
  for (const participant of group.participants) {
    await Order.create({
      user: participant.userId,
      items: [{
        product: group.product._id,
        quantity: participant.quantity,
        totalPrice: participant.amount
      }],
      totalAmount: participant.amount + participant.deliveryFee,
      orderStatus: 'ready_for_processing',
      groupOrder: {
        isGroupOrder: true,
        groupId: group.groupId
      }
    });
  }

  group.status = 'confirmed';
  await group.save();
}
```

---

### Leave Group Flow

1. **Validate:** Group must be 'active'
2. **Process refund** via Paystack
3. **Remove participant**
4. **Decrease filledSlots** (7 → 6)

---

## Payment Integration

### Join Payment Amount

```javascript
const subtotal = group.pricePerSlot;        // ₦4,500
const deliveryFee = calculateDeliveryFee(); // ₦1,500
const total = subtotal + deliveryFee;       // ₦6,000
```

### Paystack Metadata

```json
{
  "metadata": {
    "type": "group_order",
    "groupId": "GRP-ABC123",
    "productName": "Premium Rice - 10kg"
  }
}
```

---

## Edge Cases

### 1. Race Condition (Two join at once, 1 slot left)

**Solution:** Use database transaction

```javascript
const group = await GroupOrder.findOneAndUpdate(
  {
    _id: groupId,
    status: 'active',
    filledSlots: { $lt: totalSlots }
  },
  {
    $inc: { filledSlots: 1 },
    $push: { participants: participantData }
  },
  { new: true }
);

if (!group) {
  // Refund payment
  throw new Error('Group is full');
}
```

---

### 2. Payment Verified But Group Full

Refund immediately and notify user

---

### 3. Stale Groups (Never Fill)

Optional: Auto-cancel after 60 days

---

## Notifications

### 1. Group Joined
```
"You joined a group buy for Premium Rice!
Progress: 7/10 members
Share: farmchops.com/group/ABC123"
```

### 2. Group Confirmed
```
"Your group is full! 🎉
Order #ORD-123456 is being processed
Track: farmchops.com/orders/123456"
```

### 3. Group Cancelled
```
"Group cancelled. Refund of ₦6,000 processed"
```

---

## Database Indexes

```javascript
GroupOrder.index({ 'product._id': 1, status: 1 });
GroupOrder.index({ groupId: 1 }, { unique: true });
GroupOrder.index({ 'participants.userId': 1 });
```

---

## Testing Checklist

- [ ] Join group with valid payment
- [ ] Reject if group full
- [ ] Reject if already joined
- [ ] Auto-confirm when full
- [ ] Create orders on confirm
- [ ] Leave group successfully
- [ ] Process refunds
- [ ] Handle race conditions
- [ ] Admin cancel group

---

## Questions

1. Use existing Order model?
2. Paystack refund API or manual?
3. Implement 60-day auto-cancel?
4. Email/SMS notifications available?
5. WebSocket for real-time updates?

---

**Contact:** [Your Name/Email]
