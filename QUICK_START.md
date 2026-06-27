# 🚀 Quick Start Guide - EcoPract v2.0

## Get Started in 5 Minutes

### 1️⃣ Install Dependencies
```bash
cd ecopract
npm install
```

### 2️⃣ Setup Environment
Create `.env.local`:
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/eco-pract?retryWrites=true&w=majority
STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3️⃣ Seed Database
```bash
# Add 150+ US pincodes with tax rates
npx tsx scripts/seed-pincodes.ts
```

### 4️⃣ Run Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser 🎉

---

## 🎯 Key Features Ready to Use

### ✅ Bulk Pricing (1000 & 5000)
- Select quantity tier on product page
- Pricing auto-calculates
- Example: 10 packs × $800 = $8,000 for 1000-pack order

### ✅ Complete Checkout Flow
1. **Address** → Select or add delivery address
2. **Validation** → Check ZIP code availability  
3. **Payment** → Choose Stripe or Cash on Delivery
4. **Review** → Confirm order with tax & total

### ✅ Location Auto-Detection
- Browser asks for permission
- Detects ZIP code from GPS
- Auto-fills city & state

### ✅ State-Based Taxes
- Automatic calculation at checkout
- Different rates per state
- Example: NY 8.875%, CA 8.75%-10.25%

### ✅ First Customer Discount
- New users see: "🎉 First Order Offer!"
- Coupon code: `WELCOME10`
- Discount: 10% off
- Show coupon offer in checkout

### ✅ Cash on Delivery
- Select at payment step
- Pay when package arrives
- Full order tracking

---

## 🧪 Test It Out

### Test Stripe Payment
1. Add any product to cart
2. Go to checkout
3. Click "Continue to Payment"
4. Fill address (ZIP in our database)
5. Select "Credit / Debit Card"
6. Use test card: `4242 4242 4242 4242`
7. Any future date & any CVC
8. Pay!

### Test Cash on Delivery
1. Add any product to cart
2. Go to checkout
3. Add/select address
4. Select "Cash on Delivery (COD)"
5. Click "Continue to Payment"
6. Order placed! (No payment needed)

### Test First Order Discount
1. Create new account
2. Add products to cart
3. Go to checkout
4. See WELCOME10 offer banner
5. Click "Apply automatically →"
6. 10% discount applied! ✨

### Test Pincode Validation
**Valid test ZIPs** (in database):
- 10001 (New York, NY)
- 90001 (Los Angeles, CA)  
- 75001 (Dallas, TX)
- 60601 (Chicago, IL)
- 94102 (San Francisco, CA)

**Invalid test ZIPs** (not deliverable):
- 96801 (Honolulu, HI)
- 99501 (Anchorage, AK)

---

## 📊 What's Working

| Feature | Status | How to Test |
|---------|--------|------------|
| Products Display | ✅ | Home page |
| Add to Cart | ✅ | Click "Add to Cart" |
| Bulk Pricing (1000) | ✅ | Select "Bulk 1000" |
| Bulk Pricing (5000) | ✅ | Select "Bulk 5000" |
| Cart Management | ✅ | /cart page |
| Address Saving | ✅ | Checkout → Add Address |
| Pincode Validation | ✅ | Checkout → Enter ZIP |
| Location Permission | ✅ | Checkout → Allow location |
| Stripe Payment | ✅ | Test card 4242... |
| Cash on Delivery | ✅ | Select COD option |
| Tax Calculation | ✅ | Review order total |
| Coupon Application | ✅ | Enter WELCOME10 |
| First Order Discount | ✅ | New user checkout |
| Order History | ✅ | Profile → Orders |

---

## 🐛 Common Issues & Fixes

### "Can't find pincodes"
```bash
# Run this:
npx tsx scripts/seed-pincodes.ts
```

### "Stripe payment fails"
- ✅ Check API keys in .env.local
- ✅ Verify MongoDB connected
- ✅ Check browser console for errors

### "Location permission not showing"
- ✅ Only shows on HTTPS in production
- ✅ Works fine on localhost
- ✅ Try different browser if stuck

### "Tax showing 0%"
- ✅ Make sure pincode is valid
- ✅ Check pincode in database
- ✅ Run seed script again

### "First order discount not showing"
- ✅ Only for brand new users
- ✅ Must not have placed order before
- ✅ Check user email in database

---

## 📁 Project Structure

```
ecopract/
├── src/
│   ├── app/
│   │   ├── checkout/       ← Updated checkout flow
│   │   ├── cart/           ← Cart management
│   │   ├── api/
│   │   │   ├── orders/     ← Order creation
│   │   │   ├── coupon/     ← Coupon validation
│   │   │   ├── pincode/    ← ZIP validation
│   │   │   └── ...
│   ├── components/
│   │   ├── home/
│   │   │   └── ProductsSection.tsx  ← Updated pricing
│   │   └── ...
│   ├── models/
│   │   ├── pincode.ts      ← ZIP codes & tax
│   │   ├── order.ts        ← Order schema
│   │   ├── user.ts         ← User with addresses
│   │   └── ...
│   └── lib/
│       ├── services/       ← Business logic
│       └── mongodb.ts      ← DB connection
├── scripts/
│   └── seed-pincodes.ts    ← Load ZIP data
├── public/                 ← Images & assets
├── .env.local             ← Your config (create this)
└── package.json
```

---

## 🔑 Environment Variables Needed

```env
# MongoDB (Get from mongodb.com)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eco-pract

# Stripe (Get from stripe.com)
STRIPE_PUBLIC_KEY=pk_test_51IYA...
STRIPE_SECRET_KEY=sk_test_51IYA...

# API Base (for frontend)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Get Stripe keys:
1. Go to stripe.com
2. Create account
3. Go to Developers → API Keys
4. Copy test keys
5. Paste into .env.local

---

## 🚀 Deploy to Production

### Option 1: Vercel (Easiest)
```bash
vercel deploy
```

### Option 2: Railway
```bash
railway deploy
```

### Option 3: Self-Hosted
```bash
npm run build
npm start
```

---

## 📞 Quick Reference

### Coupon Codes Available
- `WELCOME10` - 10% off (first order only)
- `ECOLIFE` - 5% off (all customers)
- `SAVE20` - $20 off (all customers)

### Test Payment Methods
- **Stripe**: Card `4242 4242 4242 4242`
- **COD**: Select "Cash on Delivery" option

### Test Locations (Valid ZIPs)
- 10001 (NYC)
- 90001 (LA)
- 60601 (Chicago)
- 94102 (San Francisco)
- 75001 (Dallas)

---

## ✨ Next Steps

- [ ] Install dependencies
- [ ] Setup .env.local with your keys
- [ ] Run seed script
- [ ] Start dev server (npm run dev)
- [ ] Create test account
- [ ] Add products to cart
- [ ] Test checkout flow
- [ ] Verify Stripe payment
- [ ] Test COD option
- [ ] Apply WELCOME10 coupon

---

## 📚 More Info

- Full guide: See `UPDATES_GUIDE.md`
- API docs: Check `src/app/api/`
- Database: See `src/models/`

Happy coding! 🎉

