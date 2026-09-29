import { useEffect, useState } from 'react';
import { onSiteUpdate } from '../services/siteSocket';

// A shared, self-refreshing value for public website data.
//   load(previous) → Promise<value>; should resolve (not reject) with a fallback on error
//   resources      → site:update names that should trigger a reload
// Every component using the hook shares one fetch, and all of them re-render when the
// admin changes the data — no page refresh needed.
export function createLiveStore({ load, resources, initial }) {
  let value = initial;
  let pending = null;
  let fresh = false;
  let unsubscribe = null;
  const subscribers = new Set();

  const refresh = () => {
    pending ||= load(value).then((v) => {
      value = v;
      fresh = subscribers.size > 0; // only a subscribed store hears about later changes
      pending = null;
      subscribers.forEach((set) => set(v));
      return v;
    });
    return pending;
  };

  const subscribe = (set) => {
    subscribers.add(set);
    unsubscribe ||= onSiteUpdate(resources, refresh);
    return () => {
      subscribers.delete(set);
      if (!subscribers.size) {
        unsubscribe?.();
        unsubscribe = null;
        fresh = false; // missed updates while nobody listened: reload on next use
      }
    };
  };

  function useLive() {
    const [state, setState] = useState(value);
    useEffect(() => {
      const off = subscribe(setState);
      if (fresh) setState(value); else refresh();
      return off;
    }, []);
    return state;
  }

  return { use: useLive, refresh, get: () => value };
}
