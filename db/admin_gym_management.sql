-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 08, 2026 at 02:58 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `admin_gym_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','admin') DEFAULT 'admin',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'admin@gmail.com', '$2b$10$d65c/lNOauw/FIV8MP4Ime/RhcY.SqzjQuG14xlR1Ctc7llLgzfWa', 'admin', '2026-09-25 16:15:47', '2026-09-25 16:26:24');

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `tag` varchar(80) DEFAULT NULL,
  `title` varchar(120) NOT NULL,
  `highlight` varchar(80) DEFAULT NULL,
  `subtitle` varchar(300) DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `button_text` varchar(40) DEFAULT NULL,
  `button_link` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `tag`, `title`, `highlight`, `subtitle`, `image_url`, `button_text`, `button_link`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Chennai\'s modern fitness club', 'Forge your', 'best self', 'State-of-the-art equipment, expert trainers and programs built around your goals.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1920&q=80', 'Book a Class', '/book', 1, 'active', '2026-09-28 16:44:06', '2026-09-28 16:44:06'),
(2, 'Group classes', 'Train together,', 'grow stronger', 'Yoga, HIIT, CrossFit and more: book a seat online in under a minute.', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1920&q=80', 'See the timetable', '/workouts', 2, 'active', '2026-09-28 16:44:06', '2026-09-28 16:44:06'),
(3, 'No joining fee', 'Memberships from', '₹1,200 / month', 'Monthly, quarterly and yearly plans with a free fitness assessment.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80', 'View plans', '/#plans', 3, 'active', '2026-09-28 16:44:06', '2026-09-28 16:44:06');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `booking_no` varchar(20) DEFAULT NULL,
  `public_id` char(32) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','failed','cancelled','refunded') DEFAULT 'pending',
  `gateway` varchar(20) NOT NULL DEFAULT 'razorpay',
  `razorpay_order_id` varchar(50) DEFAULT NULL,
  `razorpay_payment_id` varchar(50) DEFAULT NULL,
  `razorpay_signature` varchar(128) DEFAULT NULL,
  `payment_method` varchar(30) DEFAULT NULL,
  `failure_reason` varchar(255) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_no`, `public_id`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `notes`, `subtotal`, `tax`, `total`, `status`, `gateway`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_method`, `failure_reason`, `paid_at`, `created_at`, `updated_at`) VALUES
(5, 'GP26000005', '6c7cd36c4be22b62f5b3c40ea6c78e26', 2, 'Testt', 'test@gmail.com', '9976733564', 'dfsdfsd', '1200.00', '216.00', '1416.00', 'paid', 'dummy', 'dummy_order_0bc3630e2da5c0a5', 'dummy_pay_419eb3d138b895bc', NULL, 'card', NULL, '2026-09-28 16:16:08', '2026-09-28 16:14:58', '2026-09-28 16:16:08'),
(6, 'GP26000006', '57f0ee2f906392ab95aecedf4a89e41b', 2, 'Testt', 'test@gmail.com', '9976733564', 'dsdfsd', '1200.00', '216.00', '1416.00', 'paid', 'dummy', 'dummy_order_b82d34fc54ee6a2a', 'dummy_pay_8612a34d3db2524a', NULL, 'card', NULL, '2026-09-28 16:19:05', '2026-09-28 16:18:09', '2026-09-28 16:19:05'),
(8, 'GP26000008', '0da42c10f3584b6d6790283a71109f0a', 2, 'Testt', 'test@gmail.com', '9976733564', 'cscsds', '3200.00', '576.00', '3776.00', 'paid', 'dummy', 'dummy_order_e00b2dd04e516276', 'dummy_pay_9bd7bc22eaaef6d7', NULL, 'card', NULL, '2026-09-28 16:31:55', '2026-09-28 16:31:34', '2026-09-28 16:31:55'),
(9, 'GP26000009', '64fe4d03dc24dcf73bc54b6a67ebc3ed', 2, 'Testt', 'test@gmail.com', '9976733564', 'asa', '1200.00', '216.00', '1416.00', 'paid', 'dummy', 'dummy_order_a1537186aa71e9d1', 'dummy_pay_32f6fb7f0cbcfbdd', NULL, 'netbanking', NULL, '2026-09-28 17:32:10', '2026-09-28 17:31:58', '2026-09-28 17:32:10'),
(10, 'GP26000010', '211261eac69ab9e48d0dadb1e3a27e90', 2, 'Testt', 'test@gmail.com', '9976733564', NULL, '1200.00', '216.00', '1416.00', 'paid', 'dummy', 'dummy_order_ee65a9f52d389c4e', 'dummy_pay_e5961b2af492fc03', NULL, 'netbanking', NULL, '2026-09-29 11:03:00', '2026-09-29 11:02:47', '2026-09-29 11:03:00'),
(11, 'GP26000011', 'cf1144b77290d0a21d9567056f1f6085', 2, 'Testt', 'test@gmail.com', '9976733564', NULL, '1200.00', '216.00', '1416.00', 'paid', 'dummy', 'dummy_order_786a6e749829ada1', 'dummy_pay_bdb0da85f104dbf8', NULL, 'netbanking', NULL, '2026-09-29 13:33:36', '2026-09-29 13:33:20', '2026-09-29 13:33:36');

-- --------------------------------------------------------

--
-- Table structure for table `booking_items`
--

CREATE TABLE `booking_items` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `item_type` enum('class','plan') NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `plan` varchar(30) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `session_date` date DEFAULT NULL,
  `time_slot` varchar(20) DEFAULT NULL,
  `qty` smallint(5) UNSIGNED NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `booking_items`
--

INSERT INTO `booking_items` (`id`, `booking_id`, `item_type`, `class_id`, `plan`, `title`, `session_date`, `time_slot`, `qty`, `unit_price`, `amount`) VALUES
(10, 5, 'plan', NULL, 'Monthly', 'Monthly Membership', NULL, NULL, 1, '1200.00', '1200.00'),
(11, 6, 'plan', NULL, 'Monthly', 'Monthly Membership', NULL, NULL, 1, '1200.00', '1200.00'),
(15, 8, 'plan', NULL, 'Quarterly', 'Quarterly Membership', NULL, NULL, 1, '3200.00', '3200.00'),
(16, 9, 'plan', NULL, 'Monthly', 'Monthly Membership', NULL, NULL, 1, '1200.00', '1200.00'),
(17, 10, 'plan', NULL, 'Monthly', 'Monthly Membership', NULL, NULL, 1, '1200.00', '1200.00'),
(18, 11, 'plan', NULL, 'Monthly', 'Monthly Membership', NULL, NULL, 1, '1200.00', '1200.00');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `slug` varchar(60) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `level` enum('Beginner','Intermediate','Advanced','All Levels') DEFAULT 'All Levels',
  `price` decimal(10,2) NOT NULL,
  `duration_min` smallint(5) UNSIGNED DEFAULT 60,
  `capacity` smallint(5) UNSIGNED DEFAULT 20,
  `days` varchar(40) NOT NULL,
  `time_slots` varchar(120) NOT NULL,
  `trainer_id` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `slug`, `name`, `category`, `level`, `price`, `duration_min`, `capacity`, `days`, `time_slots`, `trainer_id`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'strength', 'Strength Training', 'Strength', 'Intermediate', '300.00', 60, 15, 'Mon,Wed,Fri', '7:30 AM,5:00 PM', 1, 'Compound lifts that build raw strength, muscle and bone density.', 'active', '2026-09-28 15:18:34', '2026-09-28 17:28:01'),
(2, 'hiit', 'Fat Burn HIIT', 'Cardio', 'All Levels', '250.00', 30, 20, 'Tue,Thu,Sat', '6:00 AM,6:30 PM', 4, 'Short, intense intervals that torch calories and lift your stamina.', 'active', '2026-09-28 15:18:34', '2026-09-28 15:18:34'),
(3, 'yoga', 'Yoga Flow', 'Yoga', 'Beginner', '250.00', 45, 20, 'Mon,Tue,Wed,Thu,Fri,Sat', '6:00 AM', 2, 'Mobility, balance and breathwork to recover and de-stress.', 'active', '2026-09-28 15:18:34', '2026-09-28 15:18:34'),
(4, 'crossfit', 'Functional CrossFit', 'CrossFit', 'Advanced', '400.00', 50, 12, 'Mon,Wed,Fri', '6:30 PM', 3, 'Varied, high-intensity functional movements for total fitness.', 'active', '2026-09-28 15:18:34', '2026-09-28 15:18:34'),
(5, 'core', 'Core & Abs', 'Core', 'Beginner', '200.00', 25, 20, 'Tue,Thu', '7:30 AM,8:00 PM', 4, 'A stronger midsection for better posture and safer lifting.', 'active', '2026-09-28 15:18:34', '2026-09-28 15:18:34'),
(6, 'bodybuilding', 'Bodybuilding Split', 'Strength', 'Intermediate', '350.00', 75, 12, 'Tue,Thu,Sat', '5:00 PM', 5, 'Targeted hypertrophy work, one muscle group at a time.', 'active', '2026-09-28 15:18:34', '2026-09-28 15:18:34'),
(7, 'zumba', 'Zumba & Group Fitness', 'Group', 'All Levels', '250.00', 45, 25, 'Mon,Wed,Fri,Sat', '9:00 AM', 2, 'High-energy group sessions set to music.', 'active', '2026-09-28 15:18:34', '2026-09-28 15:18:34'),
(8, 'powerlifting', 'Powerlifting', 'Strength', 'Advanced', '450.00', 90, 10, 'Tue,Fri', '8:00 PM', 5, 'Periodised squat, bench and deadlift programming for max strength.', 'active', '2026-09-28 15:18:34', '2026-09-28 15:18:34'),
(14, 'werwerwerwe', 'Testing live', 'Strength', 'Beginner', '1000.00', 60, 20, 'Mon,Wed,Fri', '6:00 AM', 4, 'erwerwerwe', 'active', '2026-09-29 10:44:24', '2026-09-29 10:45:05'),
(15, 'dfgdfg', 'dfgdfgdf', 'Strength', 'Beginner', '2000.00', 60, 20, 'Mon,Wed,Fri', '6:00 AM', 2, NULL, 'active', '2026-09-29 10:45:49', '2026-09-29 10:45:49');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('unread','read','replied') DEFAULT 'unread',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `created_at`) VALUES
(1, 'Ravi Krishnan', 'ravi@email.com', '9111111111', 'Membership Query', 'I would like to know about your membership plans.', 'unread', '2026-09-25 16:15:48'),
(2, 'Lakshmi Devi', 'lak@email.com', '9222222222', 'Personal Training', 'Looking for 1-on-1 personal training sessions.', 'read', '2026-09-25 16:15:48');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(80) DEFAULT NULL,
  `reset_token_hash` char(64) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `password`, `gender`, `dob`, `address`, `city`, `reset_token_hash`, `reset_expires`, `last_login_at`, `created_at`, `updated_at`) VALUES
(2, 'Testt', 'test@gmail.com', '9976733564', '$2a$12$ulcDUkT1I6jMQFT3bK6.COTdAbJRuh37MDvau.SMH5sFtd4yqmyp6', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-29 11:02:41', '2026-09-28 16:13:39', '2026-09-29 11:02:41');

-- --------------------------------------------------------

--
-- Table structure for table `enquiries`
--

CREATE TABLE `enquiries` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `interest` varchar(100) DEFAULT NULL,
  `plan` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `source` varchar(50) DEFAULT 'Website',
  `status` enum('new','contacted','converted','closed') DEFAULT 'new',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `enquiries`
--

INSERT INTO `enquiries` (`id`, `name`, `email`, `phone`, `interest`, `plan`, `message`, `source`, `status`, `created_at`) VALUES
(1, 'Nikhil Rao', 'nikhil@email.com', '9333333333', 'Weight Training', 'Monthly', 'Interested in joining your gym.', 'Instagram', 'new', '2026-09-25 16:15:48'),
(2, 'Pooja Singh', 'pooja@email.com', '9444444444', 'Yoga & Zumba', 'Quarterly', 'Heard great things about your trainers!', 'Website', 'contacted', '2026-09-25 16:15:48');

-- --------------------------------------------------------

--
-- Table structure for table `fees`
--

CREATE TABLE `fees` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `plan` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('paid','pending','overdue') DEFAULT 'pending',
  `payment_mode` enum('Cash','UPI','Card','NetBanking') DEFAULT 'Cash',
  `receipt_no` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `fees`
--

INSERT INTO `fees` (`id`, `member_id`, `plan`, `amount`, `paid_date`, `due_date`, `status`, `payment_mode`, `receipt_no`, `created_at`) VALUES
(1, 1, 'Monthly', '1200.00', '2024-09-01', '2024-10-01', 'paid', 'UPI', NULL, '2026-09-25 16:15:47'),
(2, 2, 'Yearly', '10800.00', '2024-01-01', '2025-01-01', 'paid', 'Card', NULL, '2026-09-25 16:15:47'),
(3, 3, 'Quarterly', '3200.00', '2024-07-01', '2024-10-01', 'paid', 'Cash', NULL, '2026-09-25 16:15:47'),
(4, 4, 'Monthly', '1200.00', '2024-09-01', '2024-10-01', 'pending', 'UPI', NULL, '2026-09-25 16:15:47'),
(5, 5, 'Half-Yearly', '5500.00', '2024-05-15', '2024-11-15', 'paid', 'NetBanking', NULL, '2026-09-25 16:15:47'),
(6, 6, 'Monthly', '1200.00', NULL, '2024-08-01', 'overdue', 'Cash', NULL, '2026-09-25 16:15:47'),
(7, 7, 'Quarterly', '3200.00', '2024-06-10', '2024-09-10', 'paid', 'UPI', NULL, '2026-09-25 16:15:47');

-- --------------------------------------------------------

--
-- Table structure for table `gym_settings`
--

CREATE TABLE `gym_settings` (
  `id` tinyint(4) NOT NULL DEFAULT 1,
  `name` varchar(100) NOT NULL DEFAULT 'GymPro Fitness Centre',
  `tagline` varchar(200) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `gstin` varchar(20) DEFAULT NULL,
  `weekday_hours` varchar(50) DEFAULT NULL,
  `saturday_hours` varchar(50) DEFAULT NULL,
  `sunday_hours` varchar(50) DEFAULT NULL,
  `about_heading` varchar(200) DEFAULT NULL,
  `about_story` text DEFAULT NULL,
  `mission` text DEFAULT NULL,
  `vision` text DEFAULT NULL,
  `core_values` text DEFAULT NULL,
  `founded_year` smallint(5) UNSIGNED DEFAULT NULL,
  `members_count` varchar(20) DEFAULT NULL,
  `trainers_count` varchar(20) DEFAULT NULL,
  `machines_count` varchar(20) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `gym_settings`
--

INSERT INTO `gym_settings` (`id`, `name`, `tagline`, `phone`, `email`, `address`, `gstin`, `weekday_hours`, `saturday_hours`, `sunday_hours`, `about_heading`, `about_story`, `mission`, `vision`, `core_values`, `founded_year`, `members_count`, `trainers_count`, `machines_count`, `updated_at`) VALUES
(1, 'GymPro Fitness Centre', 'Chennai\'s modern fitness club', '+91 98765 43210', 'info@gympro.in', '123 Fitness Street, Chennai, Tamil Nadu', NULL, '5:00 AM – 11:00 PM', '6:00 AM – 10:00 PM', '7:00 AM – 8:00 PM', 'Built by trainers, for people who want real results', 'GymPro opened with a handful of machines and a simple promise: every member would get a plan and a coach who cares whether it works. Five years on, we\'ve grown to a full-floor facility with more than 500 members, but that promise hasn\'t changed.\n\nWhether you\'re stepping into a gym for the first time or chasing a new personal record, our team meets you where you are and moves you forward.', 'Make expert-guided fitness affordable and approachable for everyone in the neighbourhood.', 'To be the most trusted fitness community in Chennai, measured by member results, not member count.', 'Honest coaching, clean facilities, safe training and respect for every body type and goal.', 2020, '500+', '15', '50+', '2026-09-28 17:00:50');

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `dob` date DEFAULT NULL,
  `address` text DEFAULT NULL,
  `plan` enum('Monthly','Quarterly','Half-Yearly','Yearly') DEFAULT 'Monthly',
  `trainer_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive','expired') DEFAULT 'active',
  `join_date` date DEFAULT curdate(),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `name`, `email`, `phone`, `dob`, `address`, `plan`, `trainer_id`, `status`, `join_date`, `created_at`, `updated_at`) VALUES
(1, 'Arun Patel', 'arun@email.com', '9000000001', '1995-09-24', NULL, 'Monthly', 1, 'active', '2024-01-10', '2026-09-25 16:15:47', '2026-09-25 16:15:47'),
(2, 'Meena Reddy', 'meena@email.com', '9000000002', '1992-03-15', NULL, 'Yearly', 2, 'active', '2024-02-05', '2026-09-25 16:15:47', '2026-09-25 16:15:47'),
(3, 'Karan Shah', 'karan@email.com', '9000000003', '1998-07-08', NULL, 'Quarterly', 3, 'active', '2024-03-12', '2026-09-25 16:15:47', '2026-09-25 16:15:47'),
(4, 'Divya Iyer', 'divya@email.com', '9000000004', '1990-09-24', NULL, 'Monthly', 4, 'active', '2024-04-01', '2026-09-25 16:15:47', '2026-09-25 16:15:47'),
(5, 'Rohan Das', 'rohan@email.com', '9000000005', '1997-12-30', NULL, 'Half-Yearly', 1, 'active', '2024-05-15', '2026-09-25 16:15:47', '2026-09-25 16:15:47'),
(6, 'Sita Menon', 'sita@email.com', '9000000006', '1985-06-18', NULL, 'Monthly', 2, 'expired', '2023-12-01', '2026-09-25 16:15:47', '2026-09-25 16:15:47'),
(7, 'Ajay Gupta', 'ajay@email.com', '9000000007', '2000-01-22', NULL, 'Quarterly', 5, 'active', '2024-06-10', '2026-09-25 16:15:47', '2026-09-25 16:15:47'),
(8, 'dfgdfg1111', 'admin@pdmrindia.com', 'fgdgf', '2026-09-28', 'fgdfgdf', 'Quarterly', 4, 'active', '2026-09-28', '2026-09-28 13:37:23', '2026-09-28 14:52:40');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `quantity` tinyint(3) UNSIGNED DEFAULT 1,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','delivered','cancelled') DEFAULT 'pending',
  `order_date` date DEFAULT curdate(),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `member_id`, `product_name`, `quantity`, `amount`, `status`, `order_date`, `created_at`) VALUES
(1, 1, 'Whey Protein 1kg', 1, '1800.00', 'delivered', '2024-09-10', '2026-09-25 16:15:47'),
(2, 2, 'Resistance Bands', 2, '600.00', 'delivered', '2024-09-12', '2026-09-25 16:15:47'),
(3, 3, 'Pre-Workout 300g', 1, '1200.00', 'processing', '2024-09-18', '2026-09-25 16:15:47'),
(4, 4, 'Gym Gloves', 1, '400.00', 'pending', '2024-09-20', '2026-09-25 16:15:47'),
(5, 5, 'Creatine 250g', 1, '950.00', 'delivered', '2024-09-15', '2026-09-25 16:15:47');

-- --------------------------------------------------------

--
-- Table structure for table `trainers`
--

CREATE TABLE `trainers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `experience` tinyint(3) UNSIGNED DEFAULT 0,
  `salary` decimal(10,2) DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active',
  `joined_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `trainers`
--

INSERT INTO `trainers` (`id`, `name`, `email`, `phone`, `specialization`, `experience`, `salary`, `status`, `joined_date`, `created_at`, `updated_at`) VALUES
(1, 'Ramesh Kumar', 'ramesh@gympro.in', '9876543210', 'Weight Training', 8, '35000.00', 'active', '2020-01-15', '2026-09-25 16:15:47', '2026-09-25 16:15:47'),
(2, 'Priya Nair', 'priya@gympro.in', '9876543211', 'Yoga & Zumba', 5, '28000.00', 'active', '2021-03-10', '2026-09-25 16:15:47', '2026-09-25 16:15:47'),
(3, 'Vikram Singh', 'vikram@gympro.in', '9876543212', 'CrossFit', 6, '32000.00', 'active', '2020-07-22', '2026-09-25 16:15:47', '2026-09-25 16:15:47'),
(4, 'Anita Sharma', 'anita@gympro.in', '9876543213', 'Cardio & HIIT', 4, '26000.00', 'active', '2022-01-05', '2026-09-25 16:15:47', '2026-09-25 16:15:47'),
(5, 'Suresh Babu', 'suresh@gympro.in', '9876543214', 'Bodybuilding', 10, '42000.00', 'active', '2019-06-01', '2026-09-25 16:15:47', '2026-09-25 16:15:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_banners_status_order` (`status`,`sort_order`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `public_id` (`public_id`),
  ADD UNIQUE KEY `booking_no` (`booking_no`),
  ADD KEY `idx_bookings_status` (`status`),
  ADD KEY `idx_bookings_customer` (`customer_id`);

--
-- Indexes for table `booking_items`
--
ALTER TABLE `booking_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_items_booking` (`booking_id`),
  ADD KEY `idx_items_session` (`class_id`,`session_date`,`time_slot`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_customers_reset` (`reset_token_hash`);

--
-- Indexes for table `enquiries`
--
ALTER TABLE `enquiries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fees`
--
ALTER TABLE `fees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `gym_settings`
--
ALTER TABLE `gym_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `trainers`
--
ALTER TABLE `trainers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `booking_items`
--
ALTER TABLE `booking_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `enquiries`
--
ALTER TABLE `enquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `fees`
--
ALTER TABLE `fees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `trainers`
--
ALTER TABLE `trainers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking_items`
--
ALTER TABLE `booking_items`
  ADD CONSTRAINT `fk_items_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_items_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
