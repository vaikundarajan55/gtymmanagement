-- GymPro Management System Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS admin_gym_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE admin_gym_management;

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('superadmin','admin') DEFAULT 'admin',
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
);

-- Trainers
CREATE TABLE IF NOT EXISTS trainers (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  email            VARCHAR(150) UNIQUE,
  phone            VARCHAR(20),
  specialization   VARCHAR(100),
  experience       TINYINT UNSIGNED DEFAULT 0,
  salary           DECIMAL(10,2) DEFAULT 0,
  status           ENUM('active','inactive') DEFAULT 'active',
  joined_date      DATE,
  created_at       DATETIME DEFAULT NOW(),
  updated_at       DATETIME DEFAULT NOW() ON UPDATE NOW()
);

-- Members
CREATE TABLE IF NOT EXISTS members (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150),
  phone       VARCHAR(20) NOT NULL,
  dob         DATE,
  address     TEXT,
  plan        ENUM('Monthly','Quarterly','Half-Yearly','Yearly') DEFAULT 'Monthly',
  trainer_id  INT REFERENCES trainers(id),
  status      ENUM('active','inactive','expired') DEFAULT 'active',
  join_date   DATE DEFAULT (CURDATE()),
  created_at  DATETIME DEFAULT NOW(),
  updated_at  DATETIME DEFAULT NOW() ON UPDATE NOW()
);

-- Fees
CREATE TABLE IF NOT EXISTS fees (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  member_id     INT NOT NULL REFERENCES members(id),
  plan          VARCHAR(50),
  amount        DECIMAL(10,2) NOT NULL,
  paid_date     DATE,
  due_date      DATE,
  status        ENUM('paid','pending','overdue') DEFAULT 'pending',
  payment_mode  ENUM('Cash','UPI','Card','NetBanking') DEFAULT 'Cash',
  receipt_no    VARCHAR(50),
  created_at    DATETIME DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  member_id     INT NOT NULL REFERENCES members(id),
  product_name  VARCHAR(150) NOT NULL,
  quantity      TINYINT UNSIGNED DEFAULT 1,
  amount        DECIMAL(10,2) NOT NULL,
  status        ENUM('pending','processing','delivered','cancelled') DEFAULT 'pending',
  order_date    DATE DEFAULT (CURDATE()),
  created_at    DATETIME DEFAULT NOW()
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150),
  phone      VARCHAR(20),
  subject    VARCHAR(200),
  message    TEXT NOT NULL,
  status     ENUM('unread','read','replied') DEFAULT 'unread',
  created_at DATETIME DEFAULT NOW()
);

-- Enquiries
CREATE TABLE IF NOT EXISTS enquiries (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150),
  phone      VARCHAR(20),
  interest   VARCHAR(100),
  plan       VARCHAR(50),
  message    TEXT,
  source     VARCHAR(50) DEFAULT 'Website',
  status     ENUM('new','contacted','converted','closed') DEFAULT 'new',
  created_at DATETIME DEFAULT NOW()
);

-- ================================================
-- SEED DATA
-- ================================================

-- Default admin (password: Admin@123)
INSERT INTO admins (name, email, password) VALUES
('Super Admin', 'admin@gympro.in', '$2a$12$dNM7tjF6EAyFvHWaAugsJunJiChkMNl63gwo98eEhUejtOrCWCQA2');

-- Trainers
INSERT INTO trainers (name, email, phone, specialization, experience, salary, status, joined_date) VALUES
('Ramesh Kumar',   'ramesh@gympro.in',   '9876543210', 'Weight Training',   8, 35000, 'active', '2020-01-15'),
('Priya Nair',     'priya@gympro.in',    '9876543211', 'Yoga & Zumba',      5, 28000, 'active', '2021-03-10'),
('Vikram Singh',   'vikram@gympro.in',   '9876543212', 'CrossFit',          6, 32000, 'active', '2020-07-22'),
('Anita Sharma',   'anita@gympro.in',    '9876543213', 'Cardio & HIIT',     4, 26000, 'active', '2022-01-05'),
('Suresh Babu',    'suresh@gympro.in',   '9876543214', 'Bodybuilding',      10, 42000, 'active', '2019-06-01');

-- Members
INSERT INTO members (name, email, phone, dob, plan, trainer_id, status, join_date) VALUES
('Arun Patel',     'arun@email.com',    '9000000001', '1995-09-24', 'Monthly',     1, 'active',   '2024-01-10'),
('Meena Reddy',    'meena@email.com',   '9000000002', '1992-03-15', 'Yearly',      2, 'active',   '2024-02-05'),
('Karan Shah',     'karan@email.com',   '9000000003', '1998-07-08', 'Quarterly',   3, 'active',   '2024-03-12'),
('Divya Iyer',     'divya@email.com',   '9000000004', '1990-09-24', 'Monthly',     4, 'active',   '2024-04-01'),
('Rohan Das',      'rohan@email.com',   '9000000005', '1997-12-30', 'Half-Yearly', 1, 'active',   '2024-05-15'),
('Sita Menon',     'sita@email.com',    '9000000006', '1985-06-18', 'Monthly',     2, 'expired',  '2023-12-01'),
('Ajay Gupta',     'ajay@email.com',    '9000000007', '2000-01-22', 'Quarterly',   5, 'active',   '2024-06-10');

-- Fees
INSERT INTO fees (member_id, plan, amount, paid_date, due_date, status, payment_mode) VALUES
(1, 'Monthly',    1200, '2024-09-01', '2024-10-01', 'paid',    'UPI'),
(2, 'Yearly',    10800, '2024-01-01', '2025-01-01', 'paid',    'Card'),
(3, 'Quarterly',  3200, '2024-07-01', '2024-10-01', 'paid',    'Cash'),
(4, 'Monthly',    1200, '2024-09-01', '2024-10-01', 'pending', 'UPI'),
(5, 'Half-Yearly',5500, '2024-05-15', '2024-11-15', 'paid',    'NetBanking'),
(6, 'Monthly',    1200, NULL,         '2024-08-01', 'overdue', 'Cash'),
(7, 'Quarterly',  3200, '2024-06-10', '2024-09-10', 'paid',    'UPI');

-- Orders
INSERT INTO orders (member_id, product_name, quantity, amount, status, order_date) VALUES
(1, 'Whey Protein 1kg',   1, 1800, 'delivered', '2024-09-10'),
(2, 'Resistance Bands',   2,  600, 'delivered', '2024-09-12'),
(3, 'Pre-Workout 300g',   1, 1200, 'processing','2024-09-18'),
(4, 'Gym Gloves',         1,  400, 'pending',   '2024-09-20'),
(5, 'Creatine 250g',      1,  950, 'delivered', '2024-09-15');

-- Contacts
INSERT INTO contacts (name, email, phone, subject, message, status) VALUES
('Ravi Krishnan', 'ravi@email.com', '9111111111', 'Membership Query', 'I would like to know about your membership plans.', 'unread'),
('Lakshmi Devi',  'lak@email.com',  '9222222222', 'Personal Training', 'Looking for 1-on-1 personal training sessions.', 'read');

-- Enquiries
INSERT INTO enquiries (name, email, phone, interest, plan, message, source, status) VALUES
('Nikhil Rao',  'nikhil@email.com', '9333333333', 'Weight Training', 'Monthly',  'Interested in joining your gym.', 'Instagram', 'new'),
('Pooja Singh', 'pooja@email.com',  '9444444444', 'Yoga & Zumba',   'Quarterly','Heard great things about your trainers!', 'Website', 'contacted');
