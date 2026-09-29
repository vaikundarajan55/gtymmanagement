import { useEffect } from 'react';
import api from '../services/api';
import { onSiteUpdate } from '../services/siteSocket';
import { createLiveStore } from './liveStore';
import { CONTACT, HOURS, STATS } from '../data/site';

const FALLBACK_GYM = {
  name: 'GymPro Fitness Centre',
  tagline: "Chennai's modern fitness club",
  phone: CONTACT.phone,
  email: CONTACT.email,
  address: CONTACT.address,
  weekday_hours: HOURS[0][1],
  saturday_hours: HOURS[1][1],
  sunday_hours: HOURS[2][1],
  members_count: STATS[0][0],
  trainers_count: STATS[1][0],
  machines_count: STATS[2][0],
};

// Adds convenience fields the website uses everywhere
const shapeGym = (g) => {
  const gym = { ...FALLBACK_GYM, ...Object.fromEntries(Object.entries(g || {}).filter(([, v]) => v != null && v !== '')) };
  const years = gym.founded_year ? Math.max(1, new Date().getFullYear() - gym.founded_year) : 5;
  return {
    ...gym,
    phoneHref: `tel:${String(gym.phone).replace(/[^\d+]/g, '')}`,
    hours: [['Mon – Fri', gym.weekday_hours], ['Saturday', gym.saturday_hours], ['Sunday', gym.sunday_hours]],
    stats: [
      [gym.members_count, 'Active Members'],
      [gym.trainers_count, 'Expert Trainers'],
      [gym.machines_count, 'Modern Machines'],
      [`${years}+`, 'Years of Coaching'],
    ],
  };
};

// Each store keeps the last good value if a refresh fails
const gymStore = createLiveStore({
  resources: ['gym'],
  initial: shapeGym(null),
  load: (prev) => api.get('/gym').then(({ data }) => shapeGym(data)).catch(() => prev),
});

const catalogStore = createLiveStore({
  // Trainer renames show up as the class coach
  resources: ['classes', 'trainers'],
  initial: { loading: true, error: null, classes: [], plans: [], gstRate: 0.18, paymentsEnabled: false, maxDaysAhead: 30 },
  load: (prev) => api.get('/catalog')
    .then(({ data }) => ({ loading: false, error: null, ...data }))
    .catch(() => ({ ...prev, loading: false, error: prev.classes.length ? null : 'Could not load classes. Please refresh.' })),
});

const bannerStore = createLiveStore({
  resources: ['banners'],
  initial: { loading: true, items: [] },
  load: (prev) => api.get('/banners/active').then(({ data }) => ({ loading: false, items: data })).catch(() => ({ ...prev, loading: false })),
});

const teamStore = createLiveStore({
  resources: ['trainers'],
  initial: { loading: true, items: [] },
  load: (prev) => api.get('/trainers/team').then(({ data }) => ({ loading: false, items: data })).catch(() => ({ ...prev, loading: false })),
});

export const useGym = gymStore.use;
// Classes with live prices/schedule + plan prices + whether payments are enabled
export const useCatalog = catalogStore.use;
// Active home page banners, in admin sort order
export const useBanners = bannerStore.use;
// Active trainers for "Meet the team"
export const useTeam = teamStore.use;

// The admin panel calls this after saving gym details (the socket also announces it)
export const invalidateGym = () => gymStore.refresh();

// Runs `fn` whenever the server announces a change to one of `resources`
export function useSiteUpdate(resources, fn) {
  useEffect(() => onSiteUpdate(resources, fn), [resources.join(','), fn]);
}

export const inr = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
