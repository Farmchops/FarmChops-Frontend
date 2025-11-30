# PayLater API Specification

## Overview

PayLater is a credit-based shopping system where approved users can purchase products on credit with automatic salary deduction via IPPIS partnership.

### Key Business Rules
- Users must apply and be approved by admin before using PayLater
- Admin manually verifies user details (BVN, NIN, IPPIS) and sets credit limit
- PayLater prices are **higher** than regular prices (fixed percentage markup, e.g., 10%)
- Users can only have **one active loan at a time** - must repay before shopping again
- Repayment is automatic via IPPIS salary deduction within 1 month
- PayLater has a **separate cart** from regular shopping

---

## Data Models

### PayLaterApplication
```typescript
{
  _id: ObjectId,
  userId: ObjectId,              // Reference to User

  // Personal Info
  email: string,
  firstName: string,
  lastName: string,
  gender: "male" | "female",
  phoneNumber: string,

  // Verification Details
  bvn: string,                   // Bank Verification Number
  nin: string,                   // National Identification Number

  // Application Status
  status: "pending" | "approved" | "rejected",
  creditLimit: number | null,    // Set by admin on approval (e.g., 250000)

  // Admin Action
  reviewedBy: ObjectId | null,   // Admin who reviewed
  reviewedAt: Date | null,
  rejectionReason: string | null,

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### PayLaterAccount
```typescript
{
  _id: ObjectId,
  userId: ObjectId,              // Reference to User
  applicationId: ObjectId,       // Reference to approved application

  creditLimit: number,           // Total credit limit (e.g., 250000)
  availableCredit: number,       // Remaining credit (creditLimit - activeLoan)

  // Current Loan Status
  hasActiveLoan: boolean,
  activeLoanAmount: number | null,
  activeLoanDueDate: Date | null,
  activeLoanOrderId: ObjectId | null,

  // Account Status
  status: "active" | "suspended" | "closed",

  createdAt: Date,
  updatedAt: Date
}
```

### PayLaterOrder
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  accountId: ObjectId,           // Reference to PayLaterAccount

  // Order Details
  items: [
    {
      productId: ObjectId,
      name: string,
      image: string,
      quantity: number,
      unit: string,
      regularPrice: number,      // Original price
      paylaterPrice: number,     // Price with markup
    }
  ],

  // Pricing
  subtotal: number,              // Sum of paylaterPrice * quantity
  deliveryFee: number,
  totalAmount: number,

  // Delivery
  deliveryAddress: {
    street: string,
    city: string,
    state: string,
    phone: string,
  },

  // Loan Details
  dueDate: Date,                 // 1 month from order date

  // Repayment Status
  repaymentStatus: "pending" | "paid" | "overdue",
  repaidAt: Date | null,
  repaidAmount: number | null,

  // Order Status
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled",

  createdAt: Date,
  updatedAt: Date
}
```

### PayLaterCart (can be stored in session/user document)
```typescript
{
  userId: ObjectId,
  items: [
    {
      productId: ObjectId,
      name: string,
      image: string,
      quantity: number,
      unit: string,
      regularPrice: number,
      paylaterPrice: number,
    }
  ],
  updatedAt: Date
}
```

---

## API Endpoints

### User Endpoints

#### 1. Submit PayLater Application
```
POST /api/paylater/apply
```

**Auth Required:** Yes (User must be logged in)

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "gender": "male",
  "phoneNumber": "+2348012345678",
  "bvn": "12345678901",
  "nin": "12345678901"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "applicationId": "6789...",
    "status": "pending",
    "submittedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400` - Validation error (missing fields, invalid BVN/NIN format)
- `409` - User already has a pending or approved application

---

#### 2. Get PayLater Status
```
GET /api/paylater/status
```

**Auth Required:** Yes

**Response (200 OK) - No Application:**
```json
{
  "success": true,
  "data": {
    "hasApplication": false,
    "status": null,
    "account": null
  }
}
```

**Response (200 OK) - Pending Application:**
```json
{
  "success": true,
  "data": {
    "hasApplication": true,
    "status": "pending",
    "application": {
      "applicationId": "6789...",
      "submittedAt": "2024-01-15T10:30:00Z"
    },
    "account": null
  }
}
```

**Response (200 OK) - Approved with Active Account:**
```json
{
  "success": true,
  "data": {
    "hasApplication": true,
    "status": "approved",
    "account": {
      "creditLimit": 250000,
      "availableCredit": 250000,
      "hasActiveLoan": false,
      "activeLoan": null
    }
  }
}
```

**Response (200 OK) - Has Active Loan:**
```json
{
  "success": true,
  "data": {
    "hasApplication": true,
    "status": "approved",
    "account": {
      "creditLimit": 250000,
      "availableCredit": 0,
      "hasActiveLoan": true,
      "activeLoan": {
        "orderId": "6789...",
        "amount": 150000,
        "dueDate": "2024-02-15T10:30:00Z",
        "repaymentStatus": "pending"
      }
    }
  }
}
```

---

#### 3. Get Products with PayLater Pricing
```
GET /api/paylater/products
```

**Auth Required:** Yes (must have approved PayLater account)

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20
- `category` (optional): Filter by category ID
- `search` (optional): Search by name

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "6789...",
        "name": "Fresh Tomatoes",
        "slug": "fresh-tomatoes",
        "images": ["https://..."],
        "category": {
          "_id": "...",
          "name": "Vegetables"
        },
        "pricing": {
          "regularPrice": 15000,
          "paylaterPrice": 16500,
          "markup": 10,
          "unit": "basket"
        },
        "inventory": {
          "availableStock": 50,
          "unit": "basket"
        },
        "status": "in_stock"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    },
    "paylaterInfo": {
      "markupPercentage": 10,
      "availableCredit": 250000
    }
  }
}
```

**Errors:**
- `403` - User does not have approved PayLater account

---

#### 4. Get PayLater Cart
```
GET /api/paylater/cart
```

**Auth Required:** Yes (must have approved PayLater account)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cart": {
      "items": [
        {
          "productId": "6789...",
          "name": "Fresh Tomatoes",
          "image": "https://...",
          "quantity": 2,
          "unit": "basket",
          "regularPrice": 15000,
          "paylaterPrice": 16500
        }
      ],
      "totalItems": 2,
      "subtotal": 33000,
      "estimatedDelivery": 2500,
      "totalAmount": 35500
    },
    "creditInfo": {
      "availableCredit": 250000,
      "canCheckout": true
    }
  }
}
```

---

#### 5. Add to PayLater Cart
```
POST /api/paylater/cart/add
```

**Auth Required:** Yes (must have approved PayLater account with no active loan)

**Request Body:**
```json
{
  "productId": "6789...",
  "quantity": 1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item added to PayLater cart",
  "data": {
    "cart": {
      "items": [...],
      "totalItems": 3,
      "subtotal": 49500,
      "totalAmount": 52000
    }
  }
}
```

**Errors:**
- `400` - Quantity exceeds available stock
- `403` - User has active loan, cannot add to cart

---

#### 6. Update PayLater Cart Item
```
PUT /api/paylater/cart/update
```

**Auth Required:** Yes

**Request Body:**
```json
{
  "productId": "6789...",
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cart": {...}
  }
}
```

---

#### 7. Remove from PayLater Cart
```
DELETE /api/paylater/cart/remove/:productId
```

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "cart": {...}
  }
}
```

---

#### 8. Clear PayLater Cart
```
DELETE /api/paylater/cart/clear
```

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

#### 9. PayLater Checkout
```
POST /api/paylater/checkout
```

**Auth Required:** Yes (must have approved account, no active loan, cart total <= available credit)

**Request Body:**
```json
{
  "deliveryAddress": {
    "street": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos",
    "phone": "+2348012345678"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "PayLater order placed successfully",
  "data": {
    "order": {
      "orderId": "PL-6789...",
      "totalAmount": 52000,
      "dueDate": "2024-02-15T10:30:00Z",
      "orderStatus": "processing"
    },
    "account": {
      "previousCredit": 250000,
      "amountUsed": 52000,
      "remainingCredit": 0,
      "hasActiveLoan": true
    }
  }
}
```

**Errors:**
- `400` - Cart is empty
- `400` - Cart total exceeds available credit
- `403` - User has active loan

---

#### 10. Get PayLater Order History
```
GET /api/paylater/orders
```

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "PL-6789...",
        "totalAmount": 52000,
        "orderStatus": "delivered",
        "repaymentStatus": "paid",
        "createdAt": "2024-01-15T10:30:00Z",
        "dueDate": "2024-02-15T10:30:00Z",
        "repaidAt": "2024-02-10T10:30:00Z"
      }
    ]
  }
}
```

---

### Admin Endpoints

#### 11. Get All PayLater Applications
```
GET /api/admin/paylater/applications
```

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `status` (optional): "pending" | "approved" | "rejected"
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "_id": "6789...",
        "user": {
          "_id": "...",
          "email": "user@example.com"
        },
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "+2348012345678",
        "bvn": "12345678901",
        "nin": "12345678901",
        "status": "pending",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    },
    "stats": {
      "pending": 15,
      "approved": 25,
      "rejected": 5
    }
  }
}
```

---

#### 12. Get Single Application Details
```
GET /api/admin/paylater/applications/:id
```

**Auth Required:** Yes (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "application": {
      "_id": "6789...",
      "user": {
        "_id": "...",
        "email": "user@example.com",
        "createdAt": "2023-06-01T10:00:00Z"
      },
      "firstName": "John",
      "lastName": "Doe",
      "gender": "male",
      "phoneNumber": "+2348012345678",
      "bvn": "12345678901",
      "nin": "12345678901",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

#### 13. Approve/Reject Application
```
PUT /api/admin/paylater/applications/:id
```

**Auth Required:** Yes (Admin)

**Request Body (Approve):**
```json
{
  "action": "approve",
  "creditLimit": 250000
}
```

**Request Body (Reject):**
```json
{
  "action": "reject",
  "rejectionReason": "BVN verification failed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Application approved successfully",
  "data": {
    "application": {
      "_id": "6789...",
      "status": "approved",
      "creditLimit": 250000,
      "reviewedAt": "2024-01-16T10:30:00Z"
    }
  }
}
```

**Side Effects:**
- On approval: Create PayLaterAccount for user, send approval email
- On rejection: Send rejection email with reason

---

#### 14. Get All PayLater Users (Active Accounts)
```
GET /api/admin/paylater/users
```

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `hasActiveLoan` (optional): "true" | "false"
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "6789...",
        "user": {
          "_id": "...",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "creditLimit": 250000,
        "availableCredit": 0,
        "hasActiveLoan": true,
        "activeLoan": {
          "orderId": "PL-...",
          "amount": 150000,
          "dueDate": "2024-02-15T10:30:00Z",
          "repaymentStatus": "pending",
          "isOverdue": false
        },
        "totalOrders": 3,
        "totalRepaid": 300000
      }
    ],
    "pagination": {...},
    "stats": {
      "totalUsers": 25,
      "usersWithActiveLoan": 10,
      "totalOutstanding": 1500000,
      "overdueLoans": 2
    }
  }
}
```

---

#### 15. Get User PayLater Details
```
GET /api/admin/paylater/users/:userId
```

**Auth Required:** Yes (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "account": {
      "_id": "6789...",
      "user": {...},
      "creditLimit": 250000,
      "availableCredit": 0,
      "status": "active"
    },
    "application": {...},
    "orders": [
      {
        "_id": "PL-...",
        "totalAmount": 150000,
        "orderStatus": "delivered",
        "repaymentStatus": "pending",
        "dueDate": "2024-02-15T10:30:00Z",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "stats": {
      "totalOrders": 3,
      "totalBorrowed": 450000,
      "totalRepaid": 300000,
      "currentOutstanding": 150000
    }
  }
}
```

---

#### 16. Update User Credit Limit
```
PUT /api/admin/paylater/users/:userId/credit-limit
```

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "creditLimit": 300000
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Credit limit updated",
  "data": {
    "previousLimit": 250000,
    "newLimit": 300000
  }
}
```

---

#### 17. Mark Loan as Repaid (Manual)
```
PUT /api/admin/paylater/orders/:orderId/repaid
```

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "repaidAmount": 150000,
  "notes": "IPPIS deduction confirmed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Loan marked as repaid",
  "data": {
    "order": {
      "_id": "PL-...",
      "repaymentStatus": "paid",
      "repaidAt": "2024-02-10T10:30:00Z"
    },
    "account": {
      "hasActiveLoan": false,
      "availableCredit": 250000
    }
  }
}
```

**Side Effects:**
- Update PayLaterAccount: hasActiveLoan = false, restore availableCredit
- User can now make new PayLater purchases

---

#### 18. Get PayLater Settings
```
GET /api/admin/paylater/settings
```

**Auth Required:** Yes (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "markupPercentage": 10,
    "defaultRepaymentDays": 30,
    "minCreditLimit": 50000,
    "maxCreditLimit": 500000
  }
}
```

---

#### 19. Update PayLater Settings
```
PUT /api/admin/paylater/settings
```

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "markupPercentage": 12,
  "defaultRepaymentDays": 30
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settings updated"
}
```

---

## Email Notifications

### 1. Application Submitted
**To:** User
**Subject:** "PayLater Application Received"
**Content:** Confirmation that application is under review

### 2. Application Approved
**To:** User
**Subject:** "Your PayLater Application is Approved!"
**Content:** Credit limit, how to start shopping

### 3. Application Rejected
**To:** User
**Subject:** "PayLater Application Update"
**Content:** Rejection reason, option to reapply

### 4. Order Placed
**To:** User
**Subject:** "PayLater Order Confirmed"
**Content:** Order details, amount, due date

### 5. Payment Reminder (7 days before due)
**To:** User
**Subject:** "PayLater Payment Reminder"
**Content:** Amount due, due date

### 6. Payment Overdue
**To:** User
**Subject:** "PayLater Payment Overdue"
**Content:** Overdue amount, request to contact support

---

## Configuration

```javascript
// PayLater configuration (can be stored in DB or env)
const PAYLATER_CONFIG = {
  MARKUP_PERCENTAGE: 10,           // 10% higher prices
  REPAYMENT_DAYS: 30,              // 1 month to repay
  MIN_CREDIT_LIMIT: 50000,         // ₦50,000 minimum
  MAX_CREDIT_LIMIT: 500000,        // ₦500,000 maximum
  DELIVERY_FEE: 2500,              // Standard delivery fee
};
```

---

## Notes for Implementation

1. **Price Calculation:** `paylaterPrice = regularPrice * (1 + MARKUP_PERCENTAGE / 100)`

2. **Due Date Calculation:** `dueDate = orderDate + REPAYMENT_DAYS days`

3. **Credit Check:** Before checkout, verify `cartTotal <= availableCredit`

4. **Loan Check:** Before adding to cart, verify `hasActiveLoan === false`

5. **BVN/NIN Validation:** Store securely, consider encryption at rest

6. **IPPIS Integration:** Future integration point for automatic salary deduction verification
