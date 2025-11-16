# Role-Based Access Control (RBAC) Testing Checklist for FarmChops Frontend

This document provides a comprehensive testing checklist to verify role-based access control for order workflow management.

---

## Test Environment Setup

### Prerequisites
1. Backend API running with authentication enabled
2. Test users created for each role:
   - Super Admin
   - Operations Officer
   - Logistics
   - Customer Support
   - Rider (with assigned orders)
   - Finance
3. Sample orders in various statuses

### Test Data Requirements
- Orders in each status: `pending`, `ready_for_processing`, `processing`, `packed`, `ready_for_dispatch`, `awaiting_pickup`, `en_route`, `delivered`, `completed`, `cancelled`, `failed_delivery`
- At least 3 orders per status
- Multiple riders with assigned orders

---

## 1. Login & Authentication Tests

### Test 1.1: Role Assignment Verification
**Objective:** Verify each user is assigned the correct role

| User Type | Expected Role (adminRole) | How to Verify |
|-----------|---------------------------|---------------|
| Super Admin | `super_admin` | Check admin dropdown shows "Super Admin" |
| Operations Officer | `operations_officer` | Check admin dropdown shows "Operations Officer" |
| Logistics | `logistics` | Check admin dropdown shows "Logistics" |
| Customer Support | `customer_support` | Check admin dropdown shows "Customer Support" |
| Rider | `rider` | Should have access to Rider Dashboard |
| Finance | `finance` | Check admin dropdown shows "Finance" |

**Steps:**
1. Login as each role
2. Navigate to admin dashboard
3. Check user profile/role display in header
4. Verify correct role is displayed

**Expected Result:** ✅ Each user sees their correct role displayed

---

## 2. Order List Visibility Tests

### Test 2.1: Operations Officer - Order List
**Role:** `operations_officer` → Maps to `operations`

**Test Steps:**
1. Login as Operations Officer
2. Navigate to Orders page (`/admin/orders`)
3. Verify visible status tabs
4. Verify visible stage cards

**Expected Results:**

✅ **Should See:**
- Status tabs: "All orders", "Pending", "Ready for Processing", "Processing"
- Stage cards: 3 cards total
  - Pending (operations)
  - Ready for Processing (operations)
  - Processing (processing)
- Owner role filter: DISABLED (locked to their role)
- Orders with statuses: `pending`, `ready_for_processing`, `processing`

❌ **Should NOT See:**
- Status tabs for: packed, ready_for_dispatch, awaiting_pickup, en_route, delivered, completed, cancelled, failed_delivery
- Stage cards for other statuses
- Orders from other stages

---

### Test 2.2: Logistics - Order List
**Role:** `logistics` → Maps to `logistics`

**Test Steps:**
1. Login as Logistics user
2. Navigate to Orders page
3. Verify visible status tabs
4. Verify visible stage cards

**Expected Results:**

✅ **Should See:**
- Status tabs: "All orders", "Ready for Dispatch", "Awaiting Pickup", "Failed Delivery"
- Stage cards: 3 cards total
  - Ready for Dispatch (logistics)
  - Awaiting Pickup (logistics)
  - Failed Delivery (support)
- Owner role filter: DISABLED
- Orders with statuses: `ready_for_dispatch`, `awaiting_pickup`, `failed_delivery`

❌ **Should NOT See:**
- Status tabs for: pending, processing, packed, en_route, delivered, completed, cancelled
- Orders in other statuses

---

### Test 2.3: Customer Support - Order List
**Role:** `customer_support` → Maps to `support`

**Test Steps:**
1. Login as Customer Support user
2. Navigate to Orders page
3. Verify visible status tabs
4. Verify visible stage cards

**Expected Results:**

✅ **Should See:**
- Status tabs: "All orders", "Delivered", "Completed", "Cancelled", "Failed Delivery"
- Stage cards: 4 cards total
  - Delivered (support)
  - Completed (support)
  - Cancelled (support)
  - Failed Delivery (support)
- Owner role filter: DISABLED
- Orders with statuses: `delivered`, `completed`, `cancelled`, `failed_delivery`

❌ **Should NOT See:**
- Status tabs for: pending, processing, packed, ready_for_dispatch, awaiting_pickup, en_route
- Orders in workflow stages (processing/logistics)

---

### Test 2.4: Rider - Order List
**Role:** `rider` → Maps to `rider`

**Test Steps:**
1. Login as Rider
2. Navigate to Orders page (or Rider Dashboard)
3. Verify visible status tabs
4. Verify visible orders

**Expected Results:**

✅ **Should See:**
- Status tabs: "All orders", "Awaiting Pickup", "En Route", "Failed Delivery"
- Stage cards: 3 cards total
  - Awaiting Pickup (logistics)
  - En Route (rider)
  - Failed Delivery (support)
- **ONLY orders assigned to THIS rider**
- Orders with statuses: `awaiting_pickup`, `en_route`, `failed_delivery`

❌ **Should NOT See:**
- Orders assigned to other riders
- Unassigned orders
- Orders in other statuses: pending, processing, ready_for_dispatch, delivered, completed, cancelled

**Critical Test:** Verify rider CANNOT see orders assigned to another rider even if in `en_route` status

---

### Test 2.5: Super Admin - Order List
**Role:** `super_admin` → Has all permissions (`*`)

**Test Steps:**
1. Login as Super Admin
2. Navigate to Orders page
3. Verify visible status tabs
4. Verify owner role filter

**Expected Results:**

✅ **Should See:**
- ALL status tabs (12 total including "All orders")
- ALL stage cards (11 cards for all statuses)
- Owner role filter: ENABLED
- Can filter by any team: Operations, Processing, Packaging, Logistics, Rider, Support, Customer Support, Supervisors, Finance
- ALL orders regardless of status

❌ **Should NOT Have:**
- Any restrictions on visibility

---

### Test 2.6: Finance - Order List
**Role:** `finance` → Maps to `finance`

**Test Steps:**
1. Login as Finance user
2. Navigate to Orders page
3. Verify visible status tabs
4. Verify visible stage cards

**Expected Results:**

✅ **Should See:**
- ALL status tabs (read-only access for reporting)
- ALL stage cards
- Owner role filter: DISABLED
- ALL orders (read-only)

❌ **Should NOT Have:**
- Any action buttons (see Test 3.6)
- Ability to modify orders

**Note:** Finance has VIEW_ORDERS permission but no workflow action permissions

---

## 3. Available Actions Per Role Tests

### Test 3.1: Operations Officer - Actions
**Role:** `operations_officer` → `operations`

**Test Steps:**
1. Login as Operations Officer
2. Open an order with status `ready_for_processing`
3. Check available action buttons

**Expected Actions:**

✅ **Can Perform:**
- "Mark Processing" (from `ready_for_processing` → `processing`)
- "Cancel Order" (from early stages)

**Test Cases:**
- Open order in `ready_for_processing` → Should see "Mark Processing" button
- Open order in `processing` → Should see "Ready for Dispatch" button (if they have processing permission)
- Open order in `ready_for_dispatch` → Should see NO action buttons

❌ **Cannot Perform:**
- Assign Rider
- Confirm Pickup
- Confirm Delivery
- Close Order

---

### Test 3.2: Logistics - Actions
**Role:** `logistics` → `logistics`

**Test Steps:**
1. Login as Logistics user
2. Open orders in various statuses
3. Verify action buttons

**Expected Actions:**

✅ **Can Perform:**
- "Assign Rider" (from `ready_for_dispatch` → `awaiting_pickup`)
  - Requires: Rider selection, Note
- "Confirm Pickup" (from `awaiting_pickup` → `en_route`)
  - Requires: Note, Proof (optional)
- "Fail Delivery" (from `awaiting_pickup` or `en_route`)
  - Requires: Reason, Note
- "Return to Dispatch" (from `failed_delivery`)
  - Requires: Reason, Note

**Test Cases:**
1. **Assign Rider Test:**
   - Open order in `ready_for_dispatch`
   - Click "Assign Rider"
   - Modal should show:
     - Rider dropdown (populated with active riders)
     - Note field (required)
   - Submit → Order moves to `awaiting_pickup`

2. **Confirm Pickup Test:**
   - Open order in `awaiting_pickup`
   - Click "Confirm Pickup"
   - Modal should show:
     - Note field (required)
     - Proof upload (optional)
   - Submit → Order moves to `en_route`

❌ **Cannot Perform:**
- Mark Processing
- Close Order (reserved for support)

---

### Test 3.3: Customer Support - Actions
**Role:** `customer_support` → `support` / `customer_support`

**Test Steps:**
1. Login as Customer Support
2. Open orders in various statuses
3. Verify action buttons

**Expected Actions:**

✅ **Can Perform:**
- "Close Order" (from `delivered` → `completed`)
  - Requires: Note
- "Fail Delivery" (from `en_route`)
  - Requires: Reason, Note
- "Cancel Order"
  - Requires: Reason, Note
- "Return to Dispatch" (from `failed_delivery`)
  - Requires: Reason, Note

**Test Cases:**
1. **Close Order Test:**
   - Open order in `delivered`
   - Click "Close Order"
   - Modal should show:
     - Note field (required) - "Confirm successful fulfilment details"
   - Submit → Order moves to `completed`

2. **Cancel Order Test:**
   - Open order in any cancellable status
   - Click "Cancel Order"
   - Modal should show:
     - Reason field (required)
     - Note field (required)
   - Submit → Order moves to `cancelled`

❌ **Cannot Perform:**
- Assign Rider
- Mark Processing
- Confirm Pickup
- Confirm Delivery (rider-only)

---

### Test 3.4: Rider - Actions
**Role:** `rider` → `rider`

**Test Steps:**
1. Login as Rider
2. Open an order assigned to THIS rider in `en_route` status
3. Verify action buttons

**Expected Actions:**

✅ **Can Perform:**
- "Confirm Pickup" (from `awaiting_pickup` if assigned)
- "Confirm Delivery" (from `en_route` → `delivered`)
  - Requires: Handover Code (from customer), Proof (optional)

**Test Cases:**
1. **Confirm Delivery Test:**
   - Open assigned order in `en_route`
   - Click "Confirm Delivery"
   - Modal should show:
     - Handover Code field (required) - must match customer's code
     - Proof upload field (optional) - delivery photo
   - Enter CORRECT handover code → Success
   - Enter WRONG handover code → Error message

❌ **Cannot Perform:**
- Assign Rider (to themselves or others)
- Cancel Order
- Mark Processing
- Close Order
- Fail Delivery (escalate to logistics/support)

**Critical Test:** Rider cannot perform actions on orders assigned to other riders

---

### Test 3.5: Super Admin - Actions
**Role:** `super_admin`

**Test Steps:**
1. Login as Super Admin
2. Open any order
3. Verify all action buttons are available

**Expected Actions:**

✅ **Can Perform:**
- ALL workflow actions on ANY order
- All actions listed in Tests 3.1-3.4

❌ **Restrictions:**
- None

---

### Test 3.6: Finance - Actions
**Role:** `finance`

**Test Steps:**
1. Login as Finance user
2. Open any order
3. Verify NO action buttons are visible

**Expected Actions:**

✅ **Can View:**
- Order details
- Payment information
- Order history
- All order statuses

❌ **Cannot Perform:**
- ANY workflow actions
- Should see NO action buttons in order detail modal
- Read-only access only

---

## 4. Edge Cases & Security Tests

### Test 4.1: Permission Boundary Tests

**Test 4.1.1: Non-Super Admin Cannot Access Owner Role Filter**
1. Login as Operations Officer
2. Navigate to Orders page
3. Verify "Owner Role" dropdown is DISABLED
4. Try inspecting element and removing `disabled` attribute
5. Change value → Should have no effect (backend still filters)

**Expected:** ✅ Filter remains locked to user's role

---

**Test 4.1.2: Rider Cannot See Unassigned Orders**
1. Create order in `ready_for_dispatch` (no rider assigned)
2. Login as Rider
3. Navigate to Orders page or Rider Dashboard
4. Verify order is NOT visible
5. Assign order to different rider
6. Refresh page → Order still NOT visible

**Expected:** ✅ Rider sees ONLY their assigned orders

---

**Test 4.1.3: Role Cannot Perform Actions Outside Scope**
1. Login as Operations Officer
2. Use browser DevTools to inspect order in `delivered` status
3. Try to manually trigger "Close Order" action via API
4. Backend should reject with 403 Forbidden

**Expected:** ✅ Backend enforces permission check

---

### Test 4.2: WebSocket Real-Time Updates

**Test 4.2.1: Real-Time Updates Respect Role Filter**
1. Login as Logistics on Device A
2. Login as Super Admin on Device B
3. On Device B, move an order from `processing` → `ready_for_dispatch`
4. Device A should see the order appear in real-time

**Expected:** ✅ Logistics sees new order appear automatically

---

**Test 4.2.2: Orders Disappear When Moved Out of Scope**
1. Login as Logistics
2. View order in `ready_for_dispatch`
3. As Super Admin, move order to `processing`
4. Logistics view should auto-update and remove the order

**Expected:** ✅ Order removed from Logistics view in real-time

---

### Test 4.3: Status Transition Validation

**Test 4.3.1: Invalid Status Transitions Rejected**
1. Login as Logistics
2. Open order in `ready_for_dispatch`
3. Try to assign rider with empty note field
4. Submit → Should show validation error

**Expected:** ✅ Required fields enforced

---

**Test 4.3.2: Handover Code Validation**
1. Create order in `en_route` with handover code
2. Login as Rider (assigned to order)
3. Click "Confirm Delivery"
4. Enter WRONG handover code → Error
5. Enter CORRECT handover code → Success

**Expected:** ✅ Handover code must match

---

## 5. UI/UX Tests

### Test 5.1: Stage Card Count Accuracy
1. Login as Operations Officer
2. Count visible stage cards
3. Verify count matches expected: 3 cards (Pending, Ready for Processing, Processing)

**Expected:** ✅ Correct number of stage cards displayed

---

### Test 5.2: Status Tab Filter Accuracy
1. Login as Customer Support
2. Count status filter tabs
3. Verify tabs shown: "All orders", "Delivered", "Completed", "Cancelled", "Failed Delivery" (5 total)

**Expected:** ✅ Only relevant status tabs shown

---

### Test 5.3: Empty State Display
1. Login as Rider with no assigned orders
2. Navigate to Orders page
3. Verify each stage card shows "No orders in this stage"

**Expected:** ✅ Proper empty state messaging

---

### Test 5.4: Search Functionality
1. Login as Logistics
2. Search for order number from `processing` status (out of scope)
3. Verify NO results shown

**Expected:** ✅ Search respects role filtering

---

## 6. Regression Tests

### Test 6.1: Role Mapping Consistency
Verify the following role mappings work correctly:

| Admin Role | Workflow Role | File |
|------------|---------------|------|
| `operations_officer` | `operations` | orderWorkflow.ts:22 |
| `logistics` | `logistics` | orderWorkflow.ts:23 |
| `customer_support` | `support` | orderWorkflow.ts:24 |
| `rider` | `rider` | orderWorkflow.ts:25 |
| `finance` | `finance` | orderWorkflow.ts:31 |

**Steps:**
1. Check `mapAdminRoleToStageOwnerRole` function in [orderWorkflow.ts:18-35](src/utils/orderWorkflow.ts#L18-L35)
2. Verify all admin roles are mapped
3. Test each role mapping by logging in

---

### Test 6.2: Backend API Filtering
1. Open browser DevTools → Network tab
2. Login as Operations Officer
3. Navigate to Orders page
4. Check API request to `/api/admin/orders`
5. Verify query params include `ownerRole=operations`

**Expected:** ✅ API request includes correct `ownerRole` parameter

---

## 7. Performance Tests

### Test 7.1: Large Dataset Performance
1. Create 500+ orders across all statuses
2. Login as each role
3. Navigate to Orders page
4. Measure page load time

**Expected:** ✅ Page loads within 3 seconds

---

### Test 7.2: WebSocket Connection Stability
1. Login as Logistics
2. Leave page open for 30 minutes
3. Verify "Live updates on" indicator remains green
4. Trigger order update → Should reflect in real-time

**Expected:** ✅ Connection stable, updates still work

---

## Test Summary Checklist

Use this checklist to track overall testing progress:

- [ ] **1. Authentication & Role Assignment**
  - [ ] 1.1 All roles correctly assigned

- [ ] **2. Order List Visibility**
  - [ ] 2.1 Operations Officer sees correct orders
  - [ ] 2.2 Logistics sees correct orders
  - [ ] 2.3 Customer Support sees correct orders
  - [ ] 2.4 Rider sees only assigned orders
  - [ ] 2.5 Super Admin sees all orders
  - [ ] 2.6 Finance sees all orders (read-only)

- [ ] **3. Available Actions**
  - [ ] 3.1 Operations Officer has correct actions
  - [ ] 3.2 Logistics has correct actions
  - [ ] 3.3 Customer Support has correct actions
  - [ ] 3.4 Rider has correct actions
  - [ ] 3.5 Super Admin has all actions
  - [ ] 3.6 Finance has NO actions

- [ ] **4. Edge Cases & Security**
  - [ ] 4.1 Permission boundaries enforced
  - [ ] 4.2 WebSocket updates respect roles
  - [ ] 4.3 Status transitions validated

- [ ] **5. UI/UX**
  - [ ] 5.1 Stage card counts correct
  - [ ] 5.2 Status tab filters correct
  - [ ] 5.3 Empty states display properly
  - [ ] 5.4 Search respects role filtering

- [ ] **6. Regression Tests**
  - [ ] 6.1 Role mappings work
  - [ ] 6.2 Backend API filtering correct

- [ ] **7. Performance**
  - [ ] 7.1 Large dataset performance acceptable
  - [ ] 7.2 WebSocket connection stable

---

## Bug Tracking Template

When a test fails, use this template to document:

```
**Test ID:** [e.g., 2.4 - Rider Order List]
**Severity:** [Critical/High/Medium/Low]
**Role:** [e.g., Rider]

**Steps to Reproduce:**
1. Login as Rider
2. Navigate to Orders page
3. ...

**Expected Result:**
Should see only assigned orders

**Actual Result:**
Saw all orders in awaiting_pickup status

**Screenshots:**
[Attach screenshot]

**Browser/Device:**
Chrome 120.0 / Windows 11

**Related Files:**
- AdminOrders.tsx:824
- orderWorkflow.ts:310
```

---

## Implementation Status

### ✅ Completed
- [x] StageOwnerRole type includes all roles (orders.ts:5)
- [x] Role mapping function created (orderWorkflow.ts:18-35)
- [x] Status visibility function created (orderWorkflow.ts:283-324)
- [x] AdminOrders uses role mapping (AdminOrders.tsx:683)
- [x] Status tabs filtered by role (AdminOrders.tsx:692-699)
- [x] Stage cards filtered by role (AdminOrders.tsx:825-832)
- [x] Action permissions filtered by role (AdminOrders.tsx:802-803)
- [x] Customer support role supported (orderWorkflow.ts:24, 214, 226, 237, 249)

### 🔄 Backend Required
- [ ] Backend `/api/admin/orders` endpoint respects `ownerRole` query parameter
- [ ] Backend `/api/admin/orders/:id/actions` returns only allowed actions for role
- [ ] Backend validates permissions on action execution
- [ ] Rider-specific endpoint filters by assigned orders only

---

## Notes

- **Customer Support Role:** Mapped as both `support` and `customer_support` for compatibility
- **Finance Role:** Read-only access with VIEW_ORDERS permission but no workflow actions
- **Rider Filtering:** Must be enforced by backend - rider should only see orders where `assignedRider.id` matches their user ID

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Maintained By:** Development Team
