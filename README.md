# GymPro Management System

Full-stack Gym Management System.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Redux Toolkit, Socket.io-client
- **Backend**: Node.js (ES8), Express, Socket.io, MySQL2
- **Database**: MySQL 8

## Quick Start

### 1. Database
```bash
mysql -u root -p < backend/sql/schema.sql
```
Default admin: `admin@gympro.in` / `Admin@123`

### 2. Backend
```bash
cd backend
cp .env.example .env      # edit your DB credentials
npm install
npm run dev               # runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # runs on http://localhost:5173
```

## Admin Routes
| Path | Page |
|------|------|
| /admin/login | Login |
| /admin/dashboard | Dashboard |
| /admin/trainers | Trainer List |
| /admin/users | Member List |
| /admin/fees | Fee Records |
| /admin/orders | Orders |
| /admin/birthdays | Birthday List |
| /admin/contacts | Contact Messages |
| /admin/enquiries | Enquiries |
| /admin/banners | Home page banners (add/edit/delete, image upload) |
| /admin/plan-completed | Members whose plan period ended / ends within 7 days |
| /admin/bookings | Online class bookings & payments |
| /admin/classes | Class Master (price, schedule, seats) |
| /admin/gym-details | Gym Details & About Us (update only) |
| /admin/change-password | Change Password |

## Website Routes
| Path | Page |
|------|------|
| / | Home |
| /about | About Us |
| /workouts | Workouts & timetable |
| /book | Book a Class / buy a membership |
| /cart | Cart |
| /checkout | Checkout |
| /payment/:id | Payment (GymPay demo or Razorpay) |
| /payment/:id/status | Payment result & receipt |
| /contact | Contact Form |
| /enquiry | Enquiry Form |
| /login · /register | Customer login / sign-up |
| /forgot-password · /reset-password/:token | Password reset |
| /account | Customer dashboard |
| /account/bookings | My bookings (+ /:bookingNo details, /:bookingNo/invoice) |
| /account/profile | Profile update |
| /account/change-password | Change password |

## Backend Structure
Each module has its own route file, controller and model (SQL lives only in models):

```
backend/src/
  routes/       index.js mounts one file per module: auth, dashboard, trainer, member, fee, order,
                contact, enquiry, gym, class, catalog, booking, customer, membership, banner (*.routes.js)
  controllers/  request handling + validation; crudController.js gives standard create/update/delete
  models/       Model.js base class (whitelisted fields, CRUD, stats) + one model per table
  utils/        http.js (errors, handle wrapper), socket.js, realtime.js, uploads.js, razorpay.js
```

Apply a migration with `npm run sql -- sql/004_banners.sql` (from `backend/`). All migrations are safe to re-run.

## Live Updates (Socket.io)
- **Admins** connect with their token and get private events (new enquiry, contact, paid booking) and a live count of admins and website visitors.
- **Website visitors** connect anonymously and only receive `site:update` with a resource name. The page then re-reads the public API, so
  admin changes to banners, gym details, trainers ("Meet the team"), classes (booking page, timetable) and seat availability appear
  without a page refresh.

## Banners
Run `npm run sql -- sql/004_banners.sql` once (creates the table with 3 starter slides). Images are uploaded from the admin form
(PNG/JPG/WebP, max 3 MB; the file signature is checked) and stored in `backend/uploads/banners`, served at `/uploads/...`.
Button links must be a site path (`/book`, `/#plans`) or an `http(s)://` URL.

## Customer Accounts
Run `backend/sql/003_customer_accounts.sql` (safe to re-run). Checkout requires a customer account, so every booking
appears under **My Account → My Bookings** with a printable GST invoice (set the gym's GSTIN in Admin → Gym Details).

No mail server is configured yet: "Forgot password" prints the reset link in the backend console, and in development
(`NODE_ENV` not `production`) the page also shows it. Hook up an email provider before going live.

## Online Booking & Payments
1. Create the booking tables (safe to re-run):
   `mysql -u root -p admin_gym_management < backend/sql/002_bookings_classes_gym.sql`

**Demo gateway (default for development):** `PAYMENT_MODE=dummy` in `backend/.env` uses the built-in GymPay demo
checkout. No real money moves. Card `4111 1111 1111 1111`, any future expiry/CVV, OTP `123456`; UPI any ID like `test@okaxis`.
Never enable it on a live site. Remove the line (or set `PAYMENT_MODE=razorpay`) to use Razorpay:

2. In the Razorpay Dashboard switch to **Test Mode** → Account & Settings → API Keys → Generate Test Key.
3. Put the keys in `backend/.env` and restart the backend:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
   ```
4. Test payments: UPI `success@razorpay` / `failure@razorpay`, card `4111 1111 1111 1111` (any future expiry, any CVV),
   or pick any bank / wallet and click Success. Current list: https://razorpay.com/docs/payments/payments/test-card-details/

Prices are always recalculated on the server (Class Master prices, plan prices in `backend/src/config/plans.js`, 18% GST),
and a booking is marked paid only after the Razorpay signature and payment amount are verified.
For live mode, switch to live keys and add a Razorpay webhook (`payment.captured`) so payments are confirmed even if the customer closes the browser.
