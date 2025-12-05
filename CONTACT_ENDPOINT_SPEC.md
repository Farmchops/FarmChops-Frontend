# Contact Form Backend Endpoint Specification

## Overview
This document describes the backend API endpoint needed for the contact form functionality.

## Endpoint Details

### URL
```
POST /api/contact
```

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "message": "This is my message..."
}
```

### Request Body Validation
- **email**: Required, valid email format
- **fullName**: Required, string, min 2 characters
- **message**: Required, string, min 10 characters

---

## Response Specifications

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Contact message received successfully"
}
```

### Validation Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Valid email is required",
    "fullName": "Full name is required",
    "message": "Message must be at least 10 characters"
  }
}
```

### Server Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Failed to process contact request"
}
```

---

## Backend Implementation Examples

### Node.js/Express Example

```javascript
// routes/contact.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configure email transporter (example with Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

router.post('/contact', async (req, res) => {
  try {
    const { email, fullName, message } = req.body;

    // Validation
    if (!email || !fullName || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Store in database (optional)
    // await ContactMessage.create({ email, fullName, message });

    // Send email notification to support
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'support@farmchops.com',
      subject: `New Contact Form Submission from ${fullName}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Send confirmation email to user
    const confirmationMail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'We received your message - FarmChops',
      html: `
        <h2>Thank you for contacting FarmChops!</h2>
        <p>Hi ${fullName},</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <br>
        <p>Your message:</p>
        <p>${message}</p>
        <br>
        <p>Best regards,<br>FarmChops Support Team</p>
      `
    };

    await transporter.sendMail(confirmationMail);

    res.status(200).json({
      success: true,
      message: 'Contact message received successfully'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process contact request'
    });
  }
});

module.exports = router;
```

### Database Schema (Optional - MongoDB Example)

```javascript
// models/ContactMessage.js
const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'responded'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
```

---

## Email Service Alternatives

### 1. SendGrid
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'support@farmchops.com',
  from: 'noreply@farmchops.com',
  subject: `New Contact from ${fullName}`,
  html: `...`
};

await sgMail.send(msg);
```

### 2. Mailgun
```javascript
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

const data = {
  from: 'FarmChops <noreply@farmchops.com>',
  to: 'support@farmchops.com',
  subject: `New Contact from ${fullName}`,
  html: `...`
};

await mailgun.messages().send(data);
```

### 3. AWS SES
```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

const params = {
  Source: 'noreply@farmchops.com',
  Destination: {
    ToAddresses: ['support@farmchops.com']
  },
  Message: {
    Subject: {
      Data: `New Contact from ${fullName}`
    },
    Body: {
      Html: {
        Data: `...`
      }
    }
  }
};

await ses.sendEmail(params).promise();
```

---

## Environment Variables Required

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# OR for SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# OR for Mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.com

# Database (if storing messages)
MONGODB_URI=mongodb://localhost:27017/farmchops
```

---

## Security Considerations

1. **Rate Limiting**: Implement rate limiting to prevent spam
```javascript
const rateLimit = require('express-rate-limit');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many contact submissions from this IP'
});

router.post('/contact', contactLimiter, async (req, res) => {
  // ... handler code
});
```

2. **Input Sanitization**: Sanitize user input to prevent XSS attacks
```javascript
const validator = require('validator');

const email = validator.normalizeEmail(req.body.email);
const fullName = validator.escape(req.body.fullName);
const message = validator.escape(req.body.message);
```

3. **CORS Configuration**: Configure CORS properly
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://farmchops.com',
  methods: ['POST'],
  credentials: true
}));
```

---

## Testing the Endpoint

### Using cURL
```bash
curl -X POST https://api.farmchops.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "message": "This is a test message"
  }'
```

### Using Postman
1. Set method to POST
2. URL: `https://api.farmchops.com/api/contact`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "test@example.com",
  "fullName": "Test User",
  "message": "This is a test message"
}
```

---

## Frontend Integration

The frontend is already configured to call this endpoint. The code in `src/pages/Contacts.tsx` will:

1. Collect form data (email, fullName, message)
2. Validate all fields are filled
3. Send POST request to `${VITE_API_BASE_URL}/contact`
4. Show loading state with spinner
5. Display success message on successful submission
6. Display error message on failure
7. Reset form after successful submission

Make sure your `.env` file has:
```env
VITE_API_BASE_URL=https://api.farmchops.com/api
```
