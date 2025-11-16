# Group Sharing - Frontend/Backend Integration Guide

**Status:** ✅ Ready for Testing
**Date:** 2025-11-15

---

## ✅ Frontend Implementation Complete

All customer-facing features are implemented and ready:

### Pages Built:
1. **Browse Groups** - `/group-sharing` ([GroupSharing.tsx](src/pages/GroupSharing.tsx))
2. **Group Detail & Join** - `/group/:groupId` ([GroupDetail.tsx](src/pages/GroupDetail.tsx))
3. **My Groups Dashboard** - `/profile/groups` ([MyGroups.tsx](src/pages/profile/MyGroups.tsx))

### Features:
- ✅ Grid view of active groups
- ✅ Progress tracking (X/10 filled)
- ✅ Join modal with delivery address form
- ✅ Paystack payment integration
- ✅ Leave group with refund
- ✅ Filter groups by status
- ✅ Responsive design
- ✅ Loading & error states

---

## 🔌 API Endpoint Mapping

### Customer Endpoints (All Implemented)

| Frontend Hook | Backend Endpoint | Method | Auth |
|--------------|------------------|--------|------|
| `useGetActiveGroupsQuery()` | `/api/group-orders/active` | GET | No |
| `useGetGroupByIdQuery(groupId)` | `/api/group-orders/:groupId` | GET | No |
| `useJoinGroupMutation()` | `/api/group-orders/:groupId/join` | POST | ✅ Yes |
| `useLeaveGroupMutation()` | `/api/group-orders/:groupId/leave` | POST | ✅ Yes |
| `useGetMyGroupsQuery()` | `/api/group-orders/user/my-groups` | GET | ✅ Yes |

---

## 🧪 Testing Checklist

### 1. Browse Active Groups
**URL:** `http://localhost:3000/group-sharing`

**Expected API Call:**
```http
GET /api/group-orders/active
```

**Expected Response:**
```json
{
  "groups": [
    {
      "_id": "...",
      "groupId": "GRP-ABC123",
      "product": {
        "_id": "...",
        "name": "Premium Rice - 50kg",
        "images": ["url"],
        "unit": "kg"
      },
      "totalSlots": 10,
      "filledSlots": 7,
      "quantityPerSlot": 10,
      "pricePerSlot": 4500,
      "participants": [...],
      "status": "active",
      "createdAt": "2025-11-15T..."
    }
  ]
}
```

**UI Checks:**
- [ ] Groups display in grid layout
- [ ] Progress bar shows 7/10 filled (70%)
- [ ] Product image and name display
- [ ] Price shows "₦4,500 per person"
- [ ] "3 slots left" badge appears
- [ ] Empty state shows if no groups

---

### 2. View Group Detail
**URL:** `http://localhost:3000/group/GRP-ABC123`

**Expected API Call:**
```http
GET /api/group-orders/GRP-ABC123
```

**UI Checks:**
- [ ] Product image and details display
- [ ] Progress bar shows filled slots
- [ ] Participant avatars display
- [ ] "Join for ₦4,500" button appears
- [ ] Delivery timeline explanation visible
- [ ] Share button works

---

### 3. Join Group Flow
**Steps:**
1. Click "Join for ₦4,500" button
2. Modal opens with delivery form
3. Enter phone and address
4. Click "Pay with Paystack"

**Expected API Call:**
```http
POST /api/group-orders/GRP-ABC123/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "deliveryAddress": "123 Main Street, Ikeja, Lagos",
  "phoneNumber": "08012345678"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment initialized",
  "payment": {
    "authorizationUrl": "https://checkout.paystack.com/abc123",
    "reference": "PAY-XYZ-123"
  }
}
```

**UI Checks:**
- [ ] Modal opens when clicking join
- [ ] Phone and address fields pre-fill from user profile
- [ ] Validation works (requires both fields)
- [ ] Loading spinner shows during API call
- [ ] Redirects to Paystack on success
- [ ] Error alert shows on failure
- [ ] Modal closes on cancel

---

### 4. My Groups Dashboard
**URL:** `http://localhost:3000/profile/groups`

**Expected API Call:**
```http
GET /api/group-orders/user/my-groups
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "groups": [
    {
      "_id": "...",
      "group": {
        "groupId": "GRP-ABC123",
        "product": { "name": "...", "images": [...], "unit": "kg" },
        "totalSlots": 10,
        "filledSlots": 8,
        "status": "active",
        "participants": [...]
      },
      "userId": "...",
      "quantity": 10,
      "amountPaid": 6000,
      "deliveryAddress": "123 Main St...",
      "phoneNumber": "0801...",
      "paymentStatus": "paid",
      "orderId": null,
      "joinedAt": "2025-11-15T..."
    }
  ]
}
```

**UI Checks:**
- [ ] Filter tabs work (All, Active, Confirmed, Cancelled)
- [ ] Groups display with progress bars
- [ ] "Leave Group" button appears for active groups
- [ ] "Track Order" link appears when orderId exists
- [ ] Delivery address displays
- [ ] Join date shows correctly
- [ ] Empty state for no groups

---

### 5. Leave Group Flow
**Steps:**
1. Go to My Groups
2. Click "Leave Group" on active group
3. Confirm dialog

**Expected API Call:**
```http
POST /api/group-orders/GRP-ABC123/leave
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "refund": {
    "amount": 6000,
    "status": "processing",
    "reference": "REF-XYZ"
  }
}
```

**UI Checks:**
- [ ] Confirmation dialog appears
- [ ] Loading state during API call
- [ ] Success alert shows
- [ ] Group removed from list
- [ ] Error alert if failed

---

## 🚨 Common Issues & Solutions

### Issue 1: CORS Error
**Error:** `Access to fetch at 'http://localhost:5000/api/group-orders/active' blocked by CORS policy`

**Solution:** Backend needs to allow frontend origin:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

### Issue 2: 401 Unauthorized on My Groups
**Error:** `GET /api/group-orders/user/my-groups 401`

**Solution:** Ensure user is logged in and token is valid. Check:
1. User is authenticated (`isAuthenticated` in Redux)
2. Token exists in Redux state (`auth.token`)
3. Token is included in Authorization header

---

### Issue 3: Payment URL Not Working
**Error:** `Payment initialization failed`

**Solution:** Backend must return `payment.authorizationUrl`:
```json
{
  "success": true,
  "payment": {
    "authorizationUrl": "https://checkout.paystack.com/..."
  }
}
```

---

### Issue 4: Images Not Loading
**Error:** Product images show broken icon

**Solution:** Ensure backend returns full image URLs:
```json
{
  "product": {
    "images": ["https://your-cdn.com/image.jpg"]
  }
}
```

---

## 🔧 Environment Setup

Ensure `.env` has:
```bash
VITE_API_BASE_URL=http://localhost:5000
```

Or the backend will default to `http://localhost:5000`.

---

## 📞 Next Steps

1. **Test Browse Page:** Visit `/group-sharing` and verify groups load
2. **Test Join Flow:** Try joining a group end-to-end
3. **Test My Groups:** Check `/profile/groups` shows user's groups
4. **Test Leave Flow:** Try leaving a group and verify refund
5. **Report Issues:** Any errors? Check browser console and Network tab

---

## 🎯 Admin Features (Not Yet Built)

These will be implemented after customer features are tested:

- [ ] Enable group buying for products
- [ ] Manage all groups
- [ ] View group participants
- [ ] Cancel groups
- [ ] Stats dashboard

---

**Contact:** Ready for testing! Let me know if you encounter any issues.
