-- Website customer accounts, booking ownership, dummy payment gateway and invoice GSTIN.
-- Safe to re-run (MariaDB 10.3+ / MySQL 8.0.29+ for ADD COLUMN IF NOT EXISTS).
USE admin_gym_management;

CREATE TABLE IF NOT EXISTS customers (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(100) NOT NULL,
  email               VARCHAR(150) UNIQUE NOT NULL,
  phone               VARCHAR(20),
  password            VARCHAR(255) NOT NULL,
  gender              ENUM('male','female','other'),
  dob                 DATE,
  address             VARCHAR(255),
  city                VARCHAR(80),
  reset_token_hash    CHAR(64),
  reset_expires       DATETIME,
  last_login_at       DATETIME,
  created_at          DATETIME DEFAULT NOW(),
  updated_at          DATETIME DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_customers_reset (reset_token_hash)
);

-- Which account made the booking, and which gateway took the payment ('razorpay' | 'dummy')
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_id INT NULL AFTER public_id;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS gateway VARCHAR(20) NOT NULL DEFAULT 'razorpay' AFTER status;
ALTER TABLE bookings ADD INDEX IF NOT EXISTS idx_bookings_customer (customer_id);

-- Printed on tax invoices
ALTER TABLE gym_settings ADD COLUMN IF NOT EXISTS gstin VARCHAR(20) AFTER address;
