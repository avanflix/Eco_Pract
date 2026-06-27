# 🔧 Setup & Configuration Guide

## Complete Setup Instructions for EcoPract v2.0

---

## 📋 Prerequisites

Before you start, ensure you have:
- Node.js 16 or higher
- MongoDB (Local or MongoDB Atlas)
- Stripe Account (for payment processing)
- Git (optional, for version control)

---

## Step 1: Clone/Extract Project

```bash
# If you have a ZIP file:
unzip ecopract.zip
cd ecopract

# Or clone from Git:
git clone <repository-url>
cd ecopract
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages:
- Next.js, React, ReactDOM
- Mongoose (MongoDB ODM)
- Stripe (Payment processing)
- Tailwind CSS (Styling)
- UI Components (Radix UI, Lucide)
- Email (Nodemailer)

---

## Step 3: Setup MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/eco-pract?retryWrites=true&w=majority`

### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # macOS (if installed via Homebrew)
   brew services start mongodb-community
   
   # Windows
   mongod
   
   # Linux
   sudo systemctl start mongod
   ```
3. Connection string: `mongodb://localhost:27017/eco-pract`

---

## Step 4: Setup Stripe Account

1. Go to https://stripe.com
2. Create account
3. Go to "Developers" → "API Keys"
4. Copy:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

---

## Step 5: Create Environment File

Create `.env.local` in project root:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/eco-pract?retryWrites=true&w=majority

# Stripe Keys (Get from Stripe Dashboard)
STRIPE_PUBLIC_KEY=pk_test_51IYA1234567890abcdef
STRIPE_SECRET_KEY=sk_test_51IYA1234567890abcdef

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Email Configuration (for nodemailer)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

### Important ⚠️
- **Never** commit `.env.local` to Git
- Add to `.gitignore` (already done)
- Use different keys for production
- Keep secret key secure

---

## Step 6: Seed Database with Pincodes

This loads all US ZIP codes with tax rates and delivery info:

```bash
npx tsx scripts/seed-pincodes.ts
```

Output should show:
```
Connected to MongoDB
✓ 10001 — New York, NY
✓ 10002 — New York, NY
✓ 10003 — New York, NY
... (150+ more entries)
Pincode seeding complete!
```

---

## Step 7: Run Development Server

```bash
npm run dev
```

Output:
```
> ecopract@0.1.0 dev
> next dev

  ▲ Next.js 16.2.6
  - Local:        http://localhost:3000

✓ Ready in 2.5s
```

Open http://localhost:3000 in your browser 🎉

---

## 🧪 Testing the Application

### User Registration
1. Go to http://localhost:3000/signin
2. Click "Sign up"
3. Enter email and password
4. Verify email (check console/logs for OTP)

### Test Products
1. Home page shows all products
2. Click product to see details
3. Select tier (Normal, Bulk 1000, Bulk 5000)
4. Click "Add to Cart"

### Test Checkout Flow

#### Test Stripe Payment
1. Add product to cart
2. Click "Proceed to Checkout"
3. Add delivery address:
   - Use ZIP: 10001 (New York)
   - Fill all required fields
4. Click "Continue to Payment"
5. Select "Credit / Debit Card"
6. Use test card: 4242 4242 4242 4242
7. Any future date, any CVC (e.g., 123)
8. Click "Pay"

#### Test Cash on Delivery
1. Add product to cart
2. Go to checkout
3. Add delivery address
4. Select "Cash on Delivery (COD)"
5. Click "Continue to Payment"
6. Order confirmed! (No payment needed)

#### Test First-Order Discount
1. Create new user account
2. Add product to cart
3. Go to checkout
4. See WELCOME10 offer banner
5. Click "Apply automatically →"
6. Discount applied! (10% off)

#### Test Tax Calculation
1. Use different ZIP codes:
   - 10001 (NY): 8.875% tax
   - 90001 (LA): 10.25% tax
   - 75001 (Dallas): 8.25% tax
2. See tax amount change
3. Total updates accordingly

---

## 🔐 Production Setup

### Before Going Live

1. **Update Environment Variables**
   ```env
   MONGODB_URI=<production-mongodb-uri>
   STRIPE_PUBLIC_KEY=pk_live_<your-live-key>
   STRIPE_SECRET_KEY=sk_live_<your-live-key>
   NEXT_PUBLIC_API_URL=https://yourdomain.com
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Test Production Build Locally**
   ```bash
   npm start
   ```

4. **Deploy Options**:
   - **Vercel**: `vercel deploy`
   - **Railway**: `railway deploy`
   - **Self-hosted**: Use `npm start` on server

5. **Post-Deploy Checks**
   - ✅ Seed pincodes on production database
   - ✅ Test Stripe payment (use live card)
   - ✅ Verify email sending
   - ✅ Check all APIs working
   - ✅ Monitor error logs

---

## 🛠️ Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**:
1. Verify connection string in .env.local
2. Check MongoDB is running
3. Test connection: `mongosh <connection-string>`
4. For Atlas: whitelist your IP

### Stripe Key Error
```
Error: Invalid API Key
```
**Solution**:
1. Verify keys in .env.local
2. Check keys are for correct account
3. Use test keys (pk_test_, sk_test_)
4. Restart dev server after updating keys

### Pincode Not Found
```
Warning: ZIP code not in database
```
**Solution**:
1. Run seed script: `npx tsx scripts/seed-pincodes.ts`
2. Check seed script completed
3. Verify database has pincodes collection
4. For custom ZIP: Add manually to database

### Next.js Port Conflict
```
Error: listen EADDRINUSE :::3000
```
**Solution**:
```bash
# Kill process on port 3000
# macOS/Linux:
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port:
npm run dev -- -p 3001
```

### Build Errors
```
error: Cannot find module
```
**Solution**:
1. Delete node_modules: `rm -rf node_modules`
2. Delete lock file: `rm package-lock.json`
3. Reinstall: `npm install`
4. Rebuild: `npm run build`

---

## 📊 Verifying Setup

### Check MongoDB Connection
```bash
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err.message));
"
```

### Check Stripe Keys
Look at your browser's Network tab during payment test. Should see:
- `POST https://api.stripe.com/...` → 200 OK

### Check Pincodes Loaded
Visit database (MongoDB Atlas) and check:
- Database: `eco-pract`
- Collection: `pincodes`
- Should have 150+ documents

---

## 🎯 Environment Variables Reference

```env
# REQUIRED
MONGODB_URI=mongodb+srv://...

# REQUIRED for Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# OPTIONAL (defaults to http://localhost:3000)
NEXT_PUBLIC_API_URL=http://localhost:3000

# OPTIONAL: Email Configuration
# Uncomment to enable email notifications
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM=noreply@ecopract.com

# OPTIONAL: Admin Email
# ADMIN_EMAIL=admin@ecopract.com

# OPTIONAL: Site Configuration
# SITE_NAME=EcoPract
# SITE_URL=http://localhost:3000
```

---

## 📝 Default Credentials for Testing

**Admin Account** (if seeded):
- Email: admin@ecopract.com
- Password: Admin@123

**Test Customer**:
- Email: customer@test.com
- Password: Test@123

---

## 🚀 Quick Commands Reference

```bash
# Development
npm run dev           # Start dev server

# Building
npm run build        # Build for production
npm start            # Run production build

# Database
npx tsx scripts/seed-pincodes.ts    # Seed pincodes
npx tsx scripts/seed.ts              # Seed all data

# Linting
npm run lint         # Run ESLint

# Other
npm install          # Install dependencies
npm update           # Update dependencies
npm outdated         # Check outdated packages
```

---

## 📞 Support Resources

1. **Documentation**
   - UPDATES_GUIDE.md - Feature documentation
   - QUICK_START.md - Quick start guide
   - README.md - Project overview
   - This file - Setup guide

2. **Stripe Help**
   - Dashboard: https://dashboard.stripe.com
   - Docs: https://stripe.com/docs
   - Test Cards: https://stripe.com/docs/testing

3. **MongoDB Help**
   - Atlas: https://cloud.mongodb.com
   - Docs: https://docs.mongodb.com
   - Community: https://www.mongodb.com/community

4. **Next.js Help**
   - Docs: https://nextjs.org/docs
   - GitHub: https://github.com/vercel/next.js
   - Discord: https://discord.gg/bUG7V3z

---

## ✅ Setup Checklist

- [ ] Node.js installed (v16+)
- [ ] MongoDB created (local or Atlas)
- [ ] Stripe account created
- [ ] `.env.local` file created with all keys
- [ ] Dependencies installed (`npm install`)
- [ ] Pincodes seeded (`npx tsx scripts/seed-pincodes.ts`)
- [ ] Dev server runs (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can create user account
- [ ] Can add products to cart
- [ ] Can complete checkout
- [ ] Stripe payment works (with test card)
- [ ] COD option available
- [ ] First-order discount shows
- [ ] Tax calculated correctly

---

## 🎉 You're Ready!

Once all checklist items are complete, your EcoPract store is ready to use!

Next steps:
1. Customize branding
2. Add your products
3. Configure email
4. Setup analytics
5. Deploy to production

---

**Last Updated**: June 26, 2024

