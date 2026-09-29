// Static website content. Gym contact details and About text are editable in Admin → Gym Details;
// the values here are fallbacks until that loads. Plan prices must match backend/src/config/plans.js.

export const img = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMAGES = {
  hero: '1581009146145-b5ef050c2e1e',
  interior: '1540497077202-7c8a3999166f',
  floor: '1593079831268-3381b0db4a77',
  dumbbells: '1534438327276-14e5300c3a48',
};

export const CONTACT = {
  phone: '+91 98765 43210',
  phoneHref: 'tel:+919876543210',
  email: 'info@gympro.in',
  address: '123 Fitness Street, Chennai, Tamil Nadu',
};

export const HOURS = [
  ['Mon – Fri', '5:00 AM – 11:00 PM'],
  ['Saturday', '6:00 AM – 10:00 PM'],
  ['Sunday', '7:00 AM – 8:00 PM'],
];

export const STATS = [
  ['500+', 'Active Members'],
  ['15', 'Expert Trainers'],
  ['50+', 'Modern Machines'],
  ['5+', 'Years of Coaching'],
];

export const CATEGORIES = ['All', 'Strength', 'Cardio', 'Yoga', 'CrossFit', 'Core', 'Group'];

export const PROGRAMS = [
  {
    slug: 'strength', name: 'Strength Training', category: 'Strength', level: 'Intermediate',
    duration: 60, calories: 450, image: '1517836357463-d25dfeac3438',
    summary: 'Compound lifts that build raw strength, muscle and bone density.',
    exercises: [['Barbell Back Squat', '4 × 8'], ['Bench Press', '4 × 8'], ['Deadlift', '3 × 6'], ['Overhead Press', '3 × 10'], ['Bent-over Row', '3 × 10'], ['Plank Hold', '3 × 45s']],
  },
  {
    slug: 'hiit', name: 'Fat Burn HIIT', category: 'Cardio', level: 'All Levels',
    duration: 30, calories: 400, image: '1476480862126-209bfaa8edc8',
    summary: 'Short, intense intervals that torch calories and lift your stamina.',
    exercises: [['Jumping Jacks', '3 × 45s'], ['Burpees', '4 × 12'], ['Mountain Climbers', '3 × 40s'], ['High Knees', '3 × 45s'], ['Jump Squats', '3 × 15'], ['Stair Sprints', '5 × 1 min']],
  },
  {
    slug: 'yoga', name: 'Yoga Flow', category: 'Yoga', level: 'Beginner',
    duration: 45, calories: 200, image: '1544367567-0f2fcb009e0b',
    summary: 'Mobility, balance and breathwork to recover and de-stress.',
    exercises: [['Sun Salutation', '5 rounds'], ['Warrior II', '3 × 30s / side'], ['Downward Dog', '3 × 45s'], ['Tree Pose', '2 × 30s / side'], ['Cobra Stretch', '3 × 20s'], ['Shavasana', '5 min']],
  },
  {
    slug: 'crossfit', name: 'Functional CrossFit', category: 'CrossFit', level: 'Advanced',
    duration: 50, calories: 550, image: '1599058945522-28d584b6f0ff',
    summary: 'Varied, high-intensity functional movements for total fitness.',
    exercises: [['Kettlebell Swings', '4 × 15'], ['Box Jumps', '4 × 12'], ['Pull-ups', '4 × 8'], ['Wall Balls', '3 × 20'], ['Rowing', '3 × 500 m'], ["Farmer's Carry", '3 × 40 m']],
  },
  {
    slug: 'core', name: 'Core & Abs', category: 'Core', level: 'Beginner',
    duration: 25, calories: 180, image: '1571019613454-1cb2f99b2d8b',
    summary: 'A stronger midsection for better posture and safer lifting.',
    exercises: [['Crunches', '3 × 20'], ['Bicycle Crunch', '3 × 20'], ['Leg Raises', '3 × 15'], ['Russian Twist', '3 × 20'], ['Plank', '3 × 60s'], ['Dead Bug', '3 × 12']],
  },
  {
    slug: 'bodybuilding', name: 'Bodybuilding Split', category: 'Strength', level: 'Intermediate',
    duration: 75, calories: 500, image: '1583454110551-21f2fa2afe61',
    summary: 'Targeted hypertrophy work, one muscle group at a time.',
    exercises: [['Dumbbell Curl', '4 × 12'], ['Incline DB Press', '4 × 10'], ['Lat Pulldown', '4 × 12'], ['Lateral Raise', '3 × 15'], ['Leg Press', '4 × 12'], ['Triceps Pushdown', '3 × 15']],
  },
  {
    slug: 'zumba', name: 'Zumba & Group Fitness', category: 'Group', level: 'All Levels',
    duration: 45, calories: 380, image: '1518611012118-696072aa579a',
    summary: 'High-energy group sessions set to music. Fun first, fitness follows.',
    exercises: [['Dance Warm-up', '5 min'], ['Salsa Cardio', '10 min'], ['Step Aerobics', '10 min'], ['Mat Toning', '10 min'], ['Stretch & Cool-down', '5 min']],
  },
  {
    slug: 'powerlifting', name: 'Powerlifting', category: 'Strength', level: 'Advanced',
    duration: 90, calories: 480, image: '1605296867304-46d5465a13f1',
    summary: 'Periodised squat, bench and deadlift programming for max strength.',
    exercises: [['Back Squat', '5 × 5'], ['Bench Press', '5 × 5'], ['Deadlift', '5 × 3'], ['Barbell Row', '3 × 10'], ['Good Mornings', '3 × 10']],
  },
];

export const LEVEL_BADGE = { Beginner: 'badge-success', Intermediate: 'badge-info', Advanced: 'badge-danger', 'All Levels': 'badge-violet' };

// Timetable chip colours by class category (the schedule itself comes from /api/catalog)
export const CATEGORY_TONE = {
  Yoga: 'badge-violet', Cardio: 'badge-danger', CrossFit: 'badge-warn', Strength: 'badge-info', Core: 'badge-success', Group: 'badge-neutral',
};

export const PLANS = [
  { name: 'Monthly', price: 1200, period: 'month', features: ['Full gym floor access', 'Locker & shower', '1 fitness assessment'] },
  { name: 'Quarterly', price: 3200, period: '3 months', features: ['Everything in Monthly', 'All group classes', 'Diet consultation'] },
  { name: 'Half-Yearly', price: 5500, period: '6 months', features: ['Everything in Quarterly', '4 personal training sessions', 'Monthly body analysis'] },
  { name: 'Yearly', price: 10800, period: '12 months', popular: true, features: ['Everything in Half-Yearly', '12 personal training sessions', 'Free gym kit', 'Freeze up to 30 days'] },
];

export const TESTIMONIALS = [
  { name: 'Arun P.', since: 'Member since 2024', quote: 'Lost 12 kg in five months. The trainers track every session and actually care about form.' },
  { name: 'Meena R.', since: 'Yearly member', quote: 'The morning yoga batch is the best part of my day. Clean, friendly and never overcrowded.' },
  { name: 'Karan S.', since: 'CrossFit regular', quote: 'Great equipment and real programming. My deadlift went from 80 to 140 kg in a year.' },
];
