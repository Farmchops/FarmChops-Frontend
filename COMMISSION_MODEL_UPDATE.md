# ⚠️ CRITICAL UPDATE: Commission Model Change

## Summary of Changes

The marketing system commission model has been **changed from a 60-day attribution window to a FIRST ORDER ONLY model**.

---

## Old Model (❌ Removed)
```
Customer signs up with JUDE2025 → Jude gets 10% on ALL orders for 60 days
Customer orders 5 times in 2 months → Jude gets paid 5 times
```

**Problems:**
- Unsustainable for business
- Complex tracking over time
- Higher commission costs

---

## New Model (✅ Implemented)
```
Customer signs up with JUDE2025 → Jude gets 10% on FIRST ORDER ONLY
Customer orders 5 more times → Jude gets NOTHING
```

**Benefits:**
- Simpler to understand and implement
- More sustainable financially
- Encourages quality over quantity
- Monthly commission payouts

---

## Technical Changes Made

### 1. Type Definitions (`src/types/marketing.ts`)
**Removed:**
- `attributionWindowDays` field from `Marketer` interface
- `attributionWindowDays` field from `CreateMarketerPayload`
- `attributionWindowDays` field from `UpdateMarketerPayload`

**Added Comment:**
```typescript
// NOTE: attributionWindowDays REMOVED - Commission is now FIRST ORDER ONLY
```

### 2. Database Schema (Backend Required)

**User Model - New Field:**
```javascript
hasPlacedFirstOrder: {
  type: Boolean,
  default: false
}
```

**Order Model - New Field:**
```javascript
isFirstOrderForUser: Boolean  // Flag for reporting first orders
```

### 3. Commission Calculation Logic

**Old Logic:**
```javascript
if (user.referredBy && daysSinceReferral <= marketer.attributionWindowDays) {
  // Give commission
}
```

**New Logic:**
```javascript
if (user.referredBy && !user.hasPlacedFirstOrder) {
  const commission = Math.floor(subtotal * (marketer.commissionRate / 100));

  order.attributedToMarketer = marketer._id;
  order.marketerCommission = commission;
  order.isFirstOrderForUser = true;

  // Update marketer stats
  await Marketer.findByIdAndUpdate(...);

  // Mark user as having placed first order (no more commissions)
  await User.findByIdAndUpdate(user._id, {
    hasPlacedFirstOrder: true
  });
}
```

### 4. Frontend Components Updated

**CreateMarketerModal:**
- Removed `attributionWindowDays` field from form
- Removed validation for attribution window
- Added informational text: "Commission is calculated on FIRST ORDER ONLY from each referred customer"

**EditMarketerModal:**
- Removed `attributionWindowDays` field from form
- Removed validation for attribution window
- Added blue info box explaining the FIRST ORDER ONLY model

**MarketerDetailsPage:**
- No changes needed (attribution window wasn't displayed)

### 5. API Endpoints Updated

**Create Marketer (`POST /api/admin/marketers`):**
```json
// OLD Request Body
{
  "firstName": "Jude",
  "commissionRate": 10,
  "attributionWindowDays": 60  // ❌ REMOVED
}

// NEW Request Body
{
  "firstName": "Jude",
  "commissionRate": 10
  // attributionWindowDays field removed
}
```

**Response:**
```json
{
  "marketingCode": "JUDE2025",
  "commissionRate": 10
  // No attributionWindowDays in response
}
```

---

## Migration Guide for Backend

### Step 1: Update User Schema
```javascript
// Add to User model
hasPlacedFirstOrder: {
  type: Boolean,
  default: false,
  index: true  // For faster queries
}
```

### Step 2: Update Order Model
```javascript
// Add to Order model
isFirstOrderForUser: {
  type: Boolean,
  default: false
}
```

### Step 3: Update Marketer Model
```javascript
// REMOVE this field
attributionWindowDays: Number  // ❌ DELETE THIS

// Keep these fields
commissionRate: Number,
totalOrders: Number,
totalCommission: Number,
unpaidCommission: Number
```

### Step 4: Update Commission Logic in Order Creation
```javascript
// In create order endpoint
const user = await User.findById(userId);

if (user.referredBy && !user.hasPlacedFirstOrder) {
  const marketer = await Marketer.findById(user.referredBy);

  if (marketer && marketer.status === 'active') {
    const commission = Math.floor(subtotal * (marketer.commissionRate / 100));

    order.attributedToMarketer = marketer._id;
    order.marketerCommission = commission;
    order.isFirstOrderForUser = true;

    await Marketer.findByIdAndUpdate(marketer._id, {
      $inc: {
        totalOrders: 1,
        totalRevenue: subtotal,
        totalCommission: commission,
        unpaidCommission: commission
      }
    });

    await User.findByIdAndUpdate(user._id, {
      hasPlacedFirstOrder: true
    });
  }
}
```

### Step 5: Data Migration (Existing Marketers)
```javascript
// Remove attributionWindowDays from all existing marketers
await Marketer.updateMany(
  {},
  { $unset: { attributionWindowDays: "" } }
);
```

### Step 6: Initialize User Flags
```javascript
// For existing users who have placed orders
const usersWithOrders = await Order.distinct('user');
await User.updateMany(
  { _id: { $in: usersWithOrders } },
  { hasPlacedFirstOrder: true }
);
```

---

## Testing Checklist

### Scenario 1: New User, First Order
- [ ] User signs up with referral code `JUDE2025`
- [ ] User places first order (₦10,000)
- [ ] Marketer Jude gets ₦1,000 commission (10%)
- [ ] `user.hasPlacedFirstOrder` set to `true`
- [ ] `order.isFirstOrderForUser` set to `true`

### Scenario 2: Existing User, Second Order
- [ ] Same user places second order (₦15,000)
- [ ] Marketer Jude gets ₦0 commission
- [ ] `order.attributedToMarketer` is `null`
- [ ] `order.isFirstOrderForUser` is `false`

### Scenario 3: User Without Referral
- [ ] User signs up without referral code
- [ ] User places first order
- [ ] No marketer gets commission
- [ ] Order processed normally

### Scenario 4: Inactive Marketer
- [ ] User signs up with code from inactive marketer
- [ ] User places first order
- [ ] No commission attributed (marketer status check)

---

## Business Rules

### First-Time Buyer Discount
- **Still applies:** 10% discount (max ₦2,000) on orders ≥₦5,000
- **Separate from commission:** User can get discount AND marketer can get commission
- **One-time use:** Tracked separately via `hasUsedFirstTimeDiscount`

### Coupon System
- **Independent:** Coupons work with or without referrals
- **No stacking:** User gets best discount (first-time OR coupon)
- **Usage limits:** Per user and total limits enforced

### Commission Payment
- **Frequency:** Monthly payouts recommended
- **Tracking:** `unpaidCommission` field tracks amount owed
- **History:** All payments recorded in commission payments collection

---

## Documentation Updated

The following files have been updated to reflect the FIRST ORDER ONLY model:

1. ✅ `BACKEND_API_SPECIFICATION.md`
   - Removed `attributionWindowDays` from all endpoints
   - Updated commission logic examples
   - Updated database schema requirements
   - Updated testing checklist

2. ✅ `MARKETING_SYSTEM_COMPLETION_SUMMARY.md`
   - Updated commission attribution section
   - Updated business logic summary
   - Updated database schema

3. ✅ `src/types/marketing.ts`
   - Removed `attributionWindowDays` fields
   - Added explanatory comments

4. ✅ `src/components/modals/CreateMarketerModal.tsx`
   - Removed attribution window field
   - Added FIRST ORDER ONLY notice

5. ✅ `src/components/modals/EditMarketerModal.tsx`
   - Removed attribution window field
   - Added informational banner

---

## Impact Assessment

### Positive Impacts ✅
- **Simplified tracking:** No time-based calculations needed
- **Cost savings:** Significantly lower commission costs
- **Clearer incentives:** Marketers focus on bringing quality customers
- **Easier reporting:** Simple "first order" flag instead of date ranges
- **Better cash flow:** Predictable commission expenses

### What Stays the Same ✅
- Commission rate (default 10%, configurable per marketer)
- Commission calculation (on subtotal before discount)
- Marketing codes (6-12 characters, unique, case-insensitive)
- Marketer stats (signups, orders, revenue, commission)
- Payment tracking (unpaid commission, payment history)

### No Breaking Changes for Users 🎉
- Users experience is unchanged
- First-time discount still works
- Coupon system unchanged
- Signup with referral code unchanged

---

## Questions & Answers

**Q: What happens to existing marketers?**
A: They continue working with the new model. No action needed except removing the `attributionWindowDays` field from the database.

**Q: What about orders already placed?**
A: Past commissions are honored. The change only affects NEW orders going forward.

**Q: Can we change back to the 60-day model?**
A: Yes, but it requires code changes and database migration. Not recommended.

**Q: How do marketers know about this change?**
A: Admin should communicate the change. The UI now clearly states "FIRST ORDER ONLY".

**Q: Does this affect the signup flow?**
A: No. Users still enter referral codes the same way during signup.

**Q: What if a user's first order is cancelled?**
A: Implementation detail for backend. Recommendation: Only set `hasPlacedFirstOrder = true` when order is successfully completed/delivered.

---

## Support

For questions or issues related to this change:
1. Check `BACKEND_API_SPECIFICATION.md` for detailed API specs
2. Check `MARKETING_SYSTEM_COMPLETION_SUMMARY.md` for full system overview
3. Review this document for migration steps

---

**Date of Change:** December 24, 2025
**Implemented By:** Claude (AI Assistant)
**Approved By:** [Pending User Confirmation]
