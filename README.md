# SaaS Subscription App

A full-stack subscription-based SaaS application built with React, Node.js, Express, MongoDB, and Stripe.

## Project Structure

```
saas-app/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── subscription.controller.js
│   │   │   └── webhook.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js   # JWT verification
│   │   ├── models/
│   │   │   └── User.js             # Mongoose user schema
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── subscription.routes.js
│   │   │   └── webhook.routes.js
│   │   └── server.js               # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx      # Auth state management
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── Premium.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

## Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **MongoDB** (local or Atlas) — [Download](https://www.mongodb.com/try/download/community)
- **Stripe Account** (free) — [Sign Up](https://dashboard.stripe.com/register)
- **Stripe CLI** (for local webhook testing) — [Install Guide](https://stripe.com/docs/stripe-cli)

---

## Step 1: Stripe Dashboard Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) and make sure **Test Mode** is enabled (toggle in the top-right).

2. **Create a Product:**
   - Navigate to **Products** > **Add Product**
   - Name: `Premium Plan`
   - Price: `$9.99`
   - Billing period: `Monthly`
   - Click **Save**

3. **Copy the Price ID:**
   - After saving, click into the product
   - Under the **Pricing** section, copy the **Price ID** (starts with `price_...`)

4. **Get your API Keys:**
   - Go to **Developers** > **API Keys**
   - Copy the **Secret Key** (starts with `sk_test_...`)

---

## Step 2: Backend Setup

```bash
# Navigate to the backend folder
cd saas-app/backend

# Install dependencies
npm install

# Create the .env file from the example
cp .env.example .env
```

Now open the `.env` file and fill in your values:

```env
MONGO_URI=mongodb://localhost:27017/saas-app
JWT_SECRET=any_long_random_secret_string_here
PORT=5000
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
STRIPE_PRICE_ID=price_your_price_id_here
CLIENT_URL=http://localhost:5173
```

> **Note:** Leave `STRIPE_WEBHOOK_SECRET` empty for now. You'll get it in Step 4.

Start the backend server:

```bash
npm run dev
```

You should see:

```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

---

## Step 3: Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to the frontend folder
cd saas-app/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

You should see:

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser.

---

## Step 4: Stripe CLI Webhook Setup (Local Testing)

Stripe needs to send events (like "payment completed") to your backend. In local development, you use the Stripe CLI to forward these events.

**Install Stripe CLI:**

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with scoop)
scoop install stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

**Login and forward webhooks:**

```bash
# Login to your Stripe account
stripe login

# Forward webhook events to your local backend
stripe listen --forward-to localhost:5000/api/webhook
```

After running `stripe listen`, it will print something like:

```
> Ready! Your webhook signing secret is whsec_abc123...
```

**Copy that `whsec_...` value** and paste it into your backend `.env` file as `STRIPE_WEBHOOK_SECRET`.

Then **restart your backend** (`Ctrl+C` and `npm run dev` again).

---

## Step 5: Test the Full Flow

1. Open `http://localhost:5173` in your browser
2. Click **Register** and create a new account
3. You'll be redirected to the **Dashboard** — your plan shows **Free**
4. Click **Subscribe to Premium ($9.99/mo)**
5. On the Stripe Checkout page, use this test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: any future date (e.g., `12/34`)
   - CVC: any 3 digits (e.g., `123`)
   - Name/Zip: anything
6. After payment, you'll be redirected back to the Dashboard
7. Your plan should now show **Premium** (refresh if needed)
8. Visit the **Premium** page — you should see premium content
9. Try **Cancel Subscription** — plan reverts to Free
10. Visit **Premium** page again — you should see "Access Denied"

---

## API Endpoints

### Auth

| Method | Endpoint             | Description         | Auth Required |
| ------ | -------------------- | ------------------- | ------------- |
| POST   | `/api/auth/register` | Create new account  | No            |
| POST   | `/api/auth/login`    | Login               | No            |
| GET    | `/api/auth/me`       | Get current user    | Yes           |

### Subscription

| Method | Endpoint                                    | Description                 | Auth Required |
| ------ | ------------------------------------------- | --------------------------- | ------------- |
| POST   | `/api/subscription/create-checkout-session`  | Create Stripe Checkout URL  | Yes           |
| POST   | `/api/subscription/cancel`                   | Cancel subscription         | Yes           |
| POST   | `/api/subscription/billing-portal`           | Open Stripe Billing Portal  | Yes           |

### Webhook

| Method | Endpoint        | Description                    | Auth Required |
| ------ | --------------- | ------------------------------ | ------------- |
| POST   | `/api/webhook`  | Stripe webhook event receiver  | No (Stripe signature verified) |

---

## Webhook Events Handled

| Event                          | What Happens                                      |
| ------------------------------ | ------------------------------------------------- |
| `checkout.session.completed`   | User's plan is set to `premium`, status `active`  |
| `customer.subscription.deleted`| User's plan is set to `free`, status `inactive`   |
| `invoice.payment_failed`       | User's subscription status set to `past_due`      |

---

## User Schema (MongoDB)

```javascript
{
  name:               String,       // "John Doe"
  email:              String,       // "john@example.com" (unique)
  password:           String,       // bcrypt hashed
  stripeCustomerId:   String,       // "cus_..." from Stripe
  subscriptionId:     String,       // "sub_..." from Stripe
  subscriptionStatus: String,       // "active" | "inactive" | "past_due"
  plan:               String,       // "free" | "premium"
  createdAt:          Date,
  updatedAt:          Date
}
```

---

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Frontend | React, Vite, React Router DOM, Axios, Tailwind CSS |
| Backend  | Node.js, Express.js, ES Modules              |
| Database | MongoDB with Mongoose                         |
| Auth     | JWT + bcrypt                                  |
| Payments | Stripe Checkout + Webhooks + Billing Portal   |

---

## Troubleshooting

**MongoDB won't connect:**
- Make sure MongoDB is running locally (`mongod`) or use a MongoDB Atlas connection string.

**Stripe webhook not working:**
- Make sure `stripe listen` is running in a terminal.
- Make sure `STRIPE_WEBHOOK_SECRET` in `.env` matches what Stripe CLI printed.
- Restart backend after updating `.env`.

**After payment, plan is still "free":**
- Check that the webhook is being received (check Stripe CLI terminal for events).
- Click refresh or reload the Dashboard page.

**CORS errors in browser console:**
- Make sure `CLIENT_URL` in `.env` matches your frontend URL exactly (`http://localhost:5173`).
