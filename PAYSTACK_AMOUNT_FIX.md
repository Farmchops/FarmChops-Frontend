# Paystack Amount Display Fix

## Issue
Paystack is showing ₦99.49 instead of ₦9,949 because the backend is sending amounts in **Naira** instead of **kobo** (the smallest currency unit).

## Root Cause
- Paystack API expects amounts in **kobo** (like cents)
- 1 Naira = 100 kobo
- Backend is sending: `9949` (interpreted as 9949 kobo = ₦99.49)
- Backend should send: `994900` (kobo) to display as ₦9,949

## Solution

### Backend Fix Required

**Location**: Your backend order creation endpoint (likely in `routes/orders.js` or `controllers/orderController.js`)

**Where**: When calling Paystack's `transaction/initialize` API

**Change Needed**:

```javascript
// ❌ WRONG - Current code
const paystackResponse = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
        email: user.email,
        amount: order.totalAmount,  // ← Sending Naira directly
        reference: order.paymentReference,
        callback_url: `${process.env.FRONTEND_URL}/order/success/paystack`
    },
    {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    }
);

// ✅ CORRECT - Fixed code
const paystackResponse = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
        email: user.email,
        amount: Math.round(order.totalAmount * 100),  // ← Convert Naira to kobo
        reference: order.paymentReference,
        callback_url: `${process.env.FRONTEND_URL}/order/success/paystack`
    },
    {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    }
);
```

### Complete Example

```javascript
// Backend: Order creation endpoint with Paystack integration

const createOrder = async (req, res) => {
    try {
        // ... (order creation logic)

        const order = await Order.create({
            user: req.user._id,
            items: req.body.items,
            totalAmount: calculatedTotal,  // In Naira (e.g., 9949)
            deliveryFee: req.body.deliveryFee,
            deliveryInfo: req.body.deliveryInfo,
            paymentMethod: req.body.paymentMethod
        });

        // If Paystack payment
        if (req.body.paymentMethod === 'paystack') {
            const paymentReference = `ORDER-${order._id}-${Date.now()}`;

            // Initialize Paystack payment
            const paystackResponse = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email: req.user.email,
                    // CRITICAL: Multiply by 100 to convert Naira to kobo
                    amount: Math.round(order.totalAmount * 100),  // 9949 → 994900 kobo
                    reference: paymentReference,
                    callback_url: `${process.env.FRONTEND_URL}/order/success/paystack`,
                    metadata: {
                        orderId: order._id.toString(),
                        orderNumber: order.orderNumber
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Save payment reference
            order.paymentReference = paymentReference;
            await order.save();

            return res.status(201).json({
                success: true,
                data: {
                    order,
                    payment: {
                        authorizationUrl: paystackResponse.data.data.authorization_url,
                        reference: paymentReference
                    }
                }
            });
        }

        // ... (other payment methods)

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order'
        });
    }
};
```

## Testing

After applying the fix, test with these amounts:

| Naira Amount | Kobo Amount (×100) | Expected on Paystack |
|--------------|-------------------|---------------------|
| ₦100 | 10,000 | ₦100.00 |
| ₦1,000 | 100,000 | ₦1,000.00 |
| ₦9,949 | 994,900 | ₦9,949.00 |
| ₦50,000 | 5,000,000 | ₦50,000.00 |

## Verification Checklist

- [ ] Backend multiplies amount by 100 before sending to Paystack
- [ ] Test order with ₦9,949 total displays correctly on Paystack
- [ ] Paystack payment page shows ₦9,949 (not ₦99.49)
- [ ] Payment verification still works after fix
- [ ] Order history still displays amounts correctly

## Additional Notes

### Why Use Math.round()?
Prevents floating-point issues: `9949.99 * 100 = 994999` (correct) instead of potential `994999.0000000001`

### Other Payment Gateways
- **Flutterwave**: Also expects kobo (multiply by 100)
- **Interswitch**: Expects kobo (multiply by 100)
- **Stripe** (if used): Expects cents (multiply by 100)

### Database Storage
Keep amounts in **Naira** in your database (easier to read and query). Only convert to kobo when calling payment gateway APIs.

---

## Related Files

### Frontend (No Changes Needed)
- `src/pages/CheckOut.tsx` - Sends order in Naira to backend ✅
- `src/redux/api/orderApi.ts` - API calls ✅
- `src/pages/profile/OrderHistory.tsx` - Displays orders (already divides by 100 for kobo amounts) ✅

### Backend (Fix Required)
- Order creation endpoint (POST `/api/orders/create`) ⚠️ **FIX HERE**
- Paystack payment initialization ⚠️ **FIX HERE**
- Payment verification endpoint (should already handle kobo) ✅

---

**Priority**: HIGH - Affects all Paystack payments
**Impact**: Users see incorrect amounts on payment page
**Risk**: Low - Simple multiplication fix
