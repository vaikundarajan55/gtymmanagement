-- Adds class booking, online payments (Razorpay) and editable gym details.
-- Safe to re-run: tables are created only if missing and seed rows are skipped when present.
USE admin_gym_management;

-- Gym profile shown on the website (single row, id = 1, update only)
CREATE TABLE IF NOT EXISTS gym_settings (
  id              TINYINT PRIMARY KEY DEFAULT 1,
  name            VARCHAR(100) NOT NULL DEFAULT 'GymPro Fitness Centre',
  tagline         VARCHAR(200),
  phone           VARCHAR(20),
  email           VARCHAR(150),
  address         VARCHAR(255),
  weekday_hours   VARCHAR(50),
  saturday_hours  VARCHAR(50),
  sunday_hours    VARCHAR(50),
  about_heading   VARCHAR(200),
  about_story     TEXT,
  mission         TEXT,
  vision          TEXT,
  core_values     TEXT,
  founded_year    SMALLINT UNSIGNED,
  members_count   VARCHAR(20),
  trainers_count  VARCHAR(20),
  machines_count  VARCHAR(20),
  updated_at      DATETIME DEFAULT NOW() ON UPDATE NOW()
);

INSERT IGNORE INTO gym_settings
  (id, name, tagline, phone, email, address, weekday_hours, saturday_hours, sunday_hours,
   about_heading, about_story, mission, vision, core_values, founded_year, members_count, trainers_count, machines_count)
VALUES
  (1, 'GymPro Fitness Centre', 'Chennai''s modern fitness club', '+91 98765 43210', 'info@gympro.in',
   '123 Fitness Street, Chennai, Tamil Nadu', '5:00 AM – 11:00 PM', '6:00 AM – 10:00 PM', '7:00 AM – 8:00 PM',
   'Built by trainers, for people who want real results',
   'GymPro opened with a handful of machines and a simple promise: every member would get a plan and a coach who cares whether it works. Five years on, we''ve grown to a full-floor facility with more than 500 members, but that promise hasn''t changed.\n\nWhether you''re stepping into a gym for the first time or chasing a new personal record, our team meets you where you are and moves you forward.',
   'Make expert-guided fitness affordable and approachable for everyone in the neighbourhood.',
   'To be the most trusted fitness community in Chennai, measured by member results, not member count.',
   'Honest coaching, clean facilities, safe training and respect for every body type and goal.',
   2020, '500+', '15', '50+');

-- Bookable classes. `days` = comma list (Mon,Tue,…); `time_slots` = comma list (6:00 AM,6:30 PM)
CREATE TABLE IF NOT EXISTS classes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(60) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  category      VARCHAR(50),
  level         ENUM('Beginner','Intermediate','Advanced','All Levels') DEFAULT 'All Levels',
  price         DECIMAL(10,2) NOT NULL,
  duration_min  SMALLINT UNSIGNED DEFAULT 60,
  capacity      SMALLINT UNSIGNED DEFAULT 20,
  days          VARCHAR(40) NOT NULL,
  time_slots    VARCHAR(120) NOT NULL,
  trainer_id    INT NULL,
  description   VARCHAR(255),
  status        ENUM('active','inactive') DEFAULT 'active',
  created_at    DATETIME DEFAULT NOW(),
  updated_at    DATETIME DEFAULT NOW() ON UPDATE NOW()
);

INSERT IGNORE INTO classes (slug, name, category, level, price, duration_min, capacity, days, time_slots, trainer_id, description) VALUES
  ('strength',     'Strength Training',     'Strength', 'Intermediate', 300, 60, 15, 'Mon,Wed,Fri',         '7:30 AM,5:00 PM', 1, 'Compound lifts that build raw strength, muscle and bone density.'),
  ('hiit',         'Fat Burn HIIT',         'Cardio',   'All Levels',   250, 30, 20, 'Tue,Thu,Sat',         '6:00 AM,6:30 PM', 4, 'Short, intense intervals that torch calories and lift your stamina.'),
  ('yoga',         'Yoga Flow',             'Yoga',     'Beginner',     250, 45, 20, 'Mon,Tue,Wed,Thu,Fri,Sat', '6:00 AM',     2, 'Mobility, balance and breathwork to recover and de-stress.'),
  ('crossfit',     'Functional CrossFit',   'CrossFit', 'Advanced',     400, 50, 12, 'Mon,Wed,Fri',         '6:30 PM',         3, 'Varied, high-intensity functional movements for total fitness.'),
  ('core',         'Core & Abs',            'Core',     'Beginner',     200, 25, 20, 'Tue,Thu',             '7:30 AM,8:00 PM', 4, 'A stronger midsection for better posture and safer lifting.'),
  ('bodybuilding', 'Bodybuilding Split',    'Strength', 'Intermediate', 350, 75, 12, 'Tue,Thu,Sat',         '5:00 PM',         5, 'Targeted hypertrophy work, one muscle group at a time.'),
  ('zumba',        'Zumba & Group Fitness', 'Group',    'All Levels',   250, 45, 25, 'Mon,Wed,Fri,Sat',     '9:00 AM',         2, 'High-energy group sessions set to music.'),
  ('powerlifting', 'Powerlifting',          'Strength', 'Advanced',     450, 90, 10, 'Tue,Fri',             '8:00 PM',         5, 'Periodised squat, bench and deadlift programming for max strength.');

-- One row per checkout; `public_id` is the unguessable id used in customer-facing URLs
CREATE TABLE IF NOT EXISTS bookings (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  booking_no           VARCHAR(20) UNIQUE,
  public_id            CHAR(32) UNIQUE NOT NULL,
  customer_name        VARCHAR(100) NOT NULL,
  customer_email       VARCHAR(150) NOT NULL,
  customer_phone       VARCHAR(20) NOT NULL,
  notes                VARCHAR(500),
  subtotal             DECIMAL(10,2) NOT NULL,
  tax                  DECIMAL(10,2) NOT NULL,
  total                DECIMAL(10,2) NOT NULL,
  status               ENUM('pending','paid','failed','cancelled','refunded') DEFAULT 'pending',
  razorpay_order_id    VARCHAR(50),
  razorpay_payment_id  VARCHAR(50),
  razorpay_signature   VARCHAR(128),
  payment_method       VARCHAR(30),
  failure_reason       VARCHAR(255),
  paid_at              DATETIME,
  created_at           DATETIME DEFAULT NOW(),
  updated_at           DATETIME DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_bookings_status (status)
);

CREATE TABLE IF NOT EXISTS booking_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  booking_id    INT NOT NULL,
  item_type     ENUM('class','plan') NOT NULL,
  class_id      INT NULL,
  plan          VARCHAR(30),
  title         VARCHAR(150) NOT NULL,
  session_date  DATE,
  time_slot     VARCHAR(20),
  qty           SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  unit_price    DECIMAL(10,2) NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_items_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  INDEX idx_items_session (class_id, session_date, time_slot)
);
