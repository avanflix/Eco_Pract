# EcoPract — MongoDB Integration Guide

## What was integrated

| Feature | Before | After |
|---|---|---|
| Products | Hard-coded `data/products.ts` | Fetched from MongoDB via `/api/products` |
| Auth (login/register) | Fake — just stored email in localStorage | Real — users saved in `users` collection, passwords SHA-256 hashed |
| Orders | Only in localStorage | Saved to MongoDB `orders` collection; fetched per user on login |
| Contact form | Alert only | Saved to MongoDB `contacts` collection |

---

## MongoDB Collections

### `products`
```json
{
  "_id": ObjectId,
  "name": "8 Inch Buffet Plate",
  "slug": "8-inch-buffet-plate",
  "category": "buffet-plates",
  "size": "8 Inch",
  "packSize": 20,
  "image": "/images/products/buffet-plate.jpg",
  "description": "Premium Sal & Palash Buffet Plate",
  "pricing": {
    "normal":   { "pricePerPlate": 6,   "pricePerPack": 120 },
    "bulk1000": { "pricePerPlate": 5.5, "pricePerPack": 110 },
    "bulk5000": { "pricePerPlate": 5,   "pricePerPack": 100 },
    "premium":  { "pricePerPlate": 10,  "pricePerPack": 200 }
  },
  "isActive": true,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### `users`
```json
{
  "_id": ObjectId,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "<sha256-hash>",
  "phone": "+91 9999999999",
  "address": { "line1": "...", "city": "...", "state": "...", "pincode": "..." },
  "isActive": true,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### `orders`
```json
{
  "_id": ObjectId,
  "orderId": "EP-1718000000000",
  "userId": ObjectId,
  "userEmail": "john@example.com",
  "userName": "John Doe",
  "items": [
    {
      "name": "8 Inch Buffet Plate",
      "slug": "8-inch-buffet-plate",
      "image": "/images/...",
      "tier": "bulk1000",
      "pricePerPlate": 5.5,
      "pricePerPack": 110,
      "packSize": 20,
      "quantity": 3
    }
  ],
  "total": 330,
  "status": "Processing",
  "estimatedDelivery": "June 27, 2026",
  "createdAt": ISODate
}
```

### `contacts`
```json
{
  "_id": ObjectId,
  "name": "Jane",
  "email": "jane@example.com",
  "subject": "Bulk inquiry",
  "message": "We need 5000 units...",
  "isRead": false,
  "createdAt": ISODate
}
```

---

## Setup

### 1. Environment variable
Your `.env.local` already has:
```
MONGODB_URI=mongodb+srv://.../?retryWrites=true&w=majority&appName=Cluster0
```

The app connects to the **`eco-pract`** database (set in `src/lib/mongodb.ts`).

### 2. Seed the products
```bash
npm run seed
```
This upserts all products into the `products` collection.  
Run it once after setup, or whenever you want to reset products.

### 3. Start the dev server
```bash
npm run dev
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/products` | All active products |
| GET | `/api/products?category=buffet-plates` | Filter by category |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login existing user |
| GET | `/api/orders?email=...` | Get orders for a user |
| POST | `/api/orders` | Place a new order |
| POST | `/api/contact` | Submit contact form |

---

## File changes summary

```
src/
  models/
    products.ts       ← Updated: full pricing schema
    user.ts           ← NEW: users collection
    order.ts          ← NEW: orders collection
    contact.ts        ← NEW: contacts collection
  lib/
    mongodb.ts        ← Updated: better error handling
    services/
      productService.ts  ← Updated: new schema + toTiers() helper
      userService.ts     ← NEW: register + login
      orderService.ts    ← NEW: create + fetch orders
  app/
    api/
      products/route.ts       ← NEW
      auth/register/route.ts  ← NEW
      auth/login/route.ts     ← NEW
      orders/route.ts         ← NEW
      contact/route.ts        ← NEW
    context/CartContext.tsx   ← Updated: real API calls
    signin/page.tsx           ← Updated: real auth
    contact/page.tsx          ← Updated: real API call
  components/
    home/ProductsSection.tsx  ← Updated: fetches from API
scripts/
  seed.ts             ← NEW: populate products in MongoDB
```
