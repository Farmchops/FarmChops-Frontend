# Admin Group Sharing - Complete Flow

## Overview
This document explains how admins create and manage group buying orders for customers.

---

## The Complete Flow

### Step 1: Admin Enables Group Buying for a Product

**Location:** Admin Products Page (`/admin/products`)

1. Admin clicks the **Users icon** button (Group Buying button) on any product row
2. A modal opens showing "Group Buying Configuration"
3. Admin toggles **"Enable Group Buying"** ON
4. Admin configures the group settings:
   - **Total Slots per Group**: How many members needed (e.g., 10 people)
   - **Quantity per Slot**: What each member receives (e.g., 10kg)
   - **Price per Slot**: What each member pays (e.g., ₦4,500)
   - **Max Active Groups**: How many groups can run at once (e.g., 5)
5. Admin clicks **"Save Configuration"**

**What Happens:**
- Product is now marked as "group buying enabled"
- The Users icon button turns GREEN to indicate it's active
- A "**+ Create New Group**" link appears in the modal footer
- Product cards on the customer website show a blue "**GROUP SHARING**" badge

---

### Step 2: Admin Creates a New Group Order

**Two ways to create a group:**

**Option A: From Products Page**
1. Click the green Users icon on an enabled product
2. Click **"+ Create New Group"** in the modal
3. Gets redirected to Create Group page with product pre-selected

**Option B: From Group Orders Page**
1. Go to **Admin > Group Orders** (`/admin/group-orders`)
2. Click **"Create New Group"** button (top right)
3. Select a product from the dropdown (only shows group-enabled products)

**Create Group Page:**
- Shows product preview with image and details
- Displays configuration summary (slots, quantity, price, revenue)
- Click **"Create Group Order"** button
- Backend creates the group with status "active"

**Backend API Call:**
```http
POST /api/admin/group-orders
Body: { productId: "..." }
```

**What the backend should do:**
- Create a new GroupOrder document
- Set status = "active"
- Set filledSlots = 0
- Generate unique groupId (e.g., "GRP-ABC123")
- Use the product's groupConfig settings
- Return the created group

---

### Step 3: Customers Discover the Group

**On Products Page** (`/products`):
- Product card shows blue "**GROUP SHARING**" badge
- Customers know this product has group buying available

**On Group Sharing Page** (`/group-sharing`):
- All active groups are listed
- Shows progress bars, pricing, slots remaining
- Customers can browse and join

---

### Step 4: Customers Join the Group

1. Customer clicks "Join Group" button
2. Fills in delivery address and phone number
3. Pays via Paystack (₦4,500 in our example)
4. Backend adds them to `participants` array
5. Backend increments `filledSlots` by 1

---

### Step 5: Group Auto-Confirms When Full

**When `filledSlots === totalSlots`:**

Backend automatically:
1. Changes status from "active" → "confirmed"
2. Sets `confirmedAt` timestamp
3. Creates individual orders for each participant
4. Sends confirmation emails to all members
5. Removes group from active groups list

---

### Step 6: Admin Monitors Groups

**Admin Dashboard** (`/admin/group-orders`):

**Stats Cards Show:**
- Total groups
- Active groups (waiting for more members)
- Confirmed groups (ready for fulfillment)
- Cancelled groups
- Total revenue

**Groups Table Shows:**
- Group ID
- Product name with image
- Progress (7/10 filled)
- Price per slot
- Current revenue
- Status badge
- Creation date
- "View Details" link

---

### Step 7: Admin Views Group Details

**Group Detail Page** (`/admin/group-orders/GRP-ABC123`):

**Shows:**
- Product information card
- Progress visualization
- Revenue breakdown (current vs potential)
- Timeline of events
- **Participants table** with:
  - Each member's name and email
  - Phone number
  - Delivery address
  - Quantity ordered
  - Amount paid
  - Payment status
  - Join date
  - Link to their individual order (after confirmation)

**Admin Actions:**
- **Cancel Group** (only for active groups)
  - Opens modal asking for cancellation reason
  - Warns about refunding all X participants
  - Processes refunds automatically

---

## Key Features

### ✅ Products Page
- Users icon button on each product
- Green highlight when enabled
- Configuration modal with live summary

### ✅ Create Group Page
- Dropdown of group-enabled products only
- Product preview with images
- Configuration summary
- Revenue calculations
- Warning that group goes live immediately

### ✅ Group Orders List
- "Create New Group" button
- Stats dashboard (5 metrics)
- Search by group ID, product, or participant
- Filter by status
- Sortable table

### ✅ Group Detail Page
- Complete group information
- Participant management
- Cancel functionality with reasons
- Timeline tracking

### ✅ Customer Experience
- Blue "GROUP SHARING" badge on product cards
- Easy discovery on dedicated page
- Progress tracking
- Auto-confirmation when full

---

## Backend Endpoints Needed

### 1. Configure Group Buying
```http
PUT /api/products/:productId/group-config
Body: {
  enabled: true,
  totalSlots: 10,
  quantityPerSlot: 10,
  pricePerSlot: 4500,
  maxActiveGroups: 5
}
```

### 2. Create Group Order (Admin)
```http
POST /api/admin/group-orders
Body: { productId: "..." }

Response: {
  success: true,
  group: {
    _id: "...",
    groupId: "GRP-ABC123",
    product: {...},
    totalSlots: 10,
    filledSlots: 0,
    status: "active",
    ...
  }
}
```

### 3. List All Groups (Admin)
```http
GET /api/admin/group-orders?status=active&search=rice

Response: {
  groups: [...],
  stats: {
    total: 25,
    active: 10,
    confirmed: 12,
    cancelled: 3,
    totalRevenue: 450000
  }
}
```

### 4. Get Group Detail (Admin)
```http
GET /api/admin/group-orders/:groupId

Response: {
  group: {
    ...group data,
    participants: [
      {
        userId: "...",
        user: { firstName, lastName, email },
        quantity: 10,
        amountPaid: 4500,
        deliveryAddress: "...",
        phoneNumber: "...",
        paymentStatus: "paid",
        joinedAt: "...",
        orderId: "..." // null until confirmed
      }
    ]
  }
}
```

### 5. Cancel Group (Admin)
```http
POST /api/admin/group-orders/:groupId/cancel
Body: { reason: "Product unavailable" }

Response: {
  success: true,
  refunds: [
    { userId: "...", amount: 4500, status: "processing" }
  ]
}
```

---

## Important Business Rules

1. **Only admin can create groups** - Customers can only join existing groups
2. **Groups use product's groupConfig** - Can't customize per group
3. **No time limits** - Groups stay active until filled
4. **Auto-confirm when full** - No manual confirmation needed
5. **Can't join full groups** - Frontend prevents this
6. **Only active groups can be cancelled** - Confirmed groups are locked
7. **Full refunds on cancellation** - All participants get money back
8. **Individual orders after confirmation** - Each member gets their own order to track

---

## Files Created

### Admin Pages
1. `src/pages/admin/AdminGroupOrders.tsx` - List all groups
2. `src/pages/admin/AdminGroupDetail.tsx` - Group detail with participants
3. `src/pages/admin/CreateGroupOrder.tsx` - Create new group

### Admin Features
4. `src/pages/admin/AdminProducts.tsx` - Added group config modal

### Customer Features
5. `src/components/Product/ProductCard.tsx` - Added "GROUP SHARING" badge

### Types & API
6. `src/types/product.ts` - Added GroupConfig interface
7. `src/redux/api/productApi.ts` - Added configureGroupBuying mutation

### Routes
8. Updated `src/routers/route.tsx` - Added admin routes
9. Updated `src/pages/admin/adminLayout.tsx` - Added "Group Orders" menu item

---

## Testing Checklist for Backend Engineer

- [ ] Enable group buying for a product via API
- [ ] Verify product returns groupConfig in GET /products
- [ ] Create a group order via admin endpoint
- [ ] Verify group appears in admin list
- [ ] Customer joins the group (increments filledSlots)
- [ ] When group fills, auto-confirm and create orders
- [ ] Admin cancels an active group
- [ ] Verify refunds are processed
- [ ] Check all participants receive emails

---

**Ready for Integration!** 🚀

All frontend features are complete and waiting for backend endpoints.
