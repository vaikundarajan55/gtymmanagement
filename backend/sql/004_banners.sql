-- Home page hero banners, managed from Admin → Website → Banners. Re-runnable.
CREATE TABLE IF NOT EXISTS banners (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  tag          VARCHAR(80),
  title        VARCHAR(120) NOT NULL,
  highlight    VARCHAR(80),
  subtitle     VARCHAR(300),
  image_url    VARCHAR(500) NOT NULL,
  button_text  VARCHAR(40),
  button_link  VARCHAR(255),
  sort_order   INT NOT NULL DEFAULT 0,
  status       ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at   DATETIME DEFAULT NOW(),
  updated_at   DATETIME DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_banners_status_order (status, sort_order)
) ENGINE=InnoDB;

INSERT INTO banners (tag, title, highlight, subtitle, image_url, button_text, button_link, sort_order)
SELECT * FROM (
  SELECT 'Chennai''s modern fitness club' AS tag, 'Forge your' AS title, 'best self' AS highlight,
         'State-of-the-art equipment, expert trainers and programs built around your goals.' AS subtitle,
         'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1920&q=80' AS image_url,
         'Book a Class' AS button_text, '/book' AS button_link, 1 AS sort_order
  UNION ALL
  SELECT 'Group classes', 'Train together,', 'grow stronger',
         'Yoga, HIIT, CrossFit and more: book a seat online in under a minute.',
         'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1920&q=80',
         'See the timetable', '/workouts', 2
  UNION ALL
  SELECT 'No joining fee', 'Memberships from', '₹1,200 / month',
         'Monthly, quarterly and yearly plans with a free fitness assessment.',
         'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80',
         'View plans', '/#plans', 3
) seed
WHERE NOT EXISTS (SELECT 1 FROM banners);
