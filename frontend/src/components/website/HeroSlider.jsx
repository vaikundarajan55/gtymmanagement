import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Play, Zap } from 'lucide-react';
import { useBanners, useGym } from '../../hooks/useSiteData';
import { assetUrl } from '../../services/config';
import { img, IMAGES } from '../../data/site';

const INTERVAL = 6000;

// Shown while banners load, or when the admin has no active banner
const fallbackBanner = (gym) => ({
  id: 'default',
  tag: gym.tagline,
  title: 'Forge your',
  highlight: 'best self',
  subtitle: "State-of-the-art equipment, expert trainers and programs built around your goals, whether that's losing weight, building muscle or simply feeling better.",
  image_url: img(IMAGES.hero, 1920),
  button_text: 'Book a Class',
  button_link: '/book',
});

// Site paths use the router; http(s) links open in a new tab. The server only accepts these two forms.
function BannerButton({ href, children }) {
  const cls = 'btn-primary px-6 py-3 sm:px-7 sm:py-3.5 text-base';
  if (/^https?:\/\//i.test(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
  }
  return <Link to={href} className={cls}>{children}</Link>;
}

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function HeroSlider() {
  const gym = useGym();
  const { loading, items } = useBanners();
  const slides = items.length ? items : [fallbackBanner(gym)];
  const count = slides.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  // Banners can be removed live by the admin; keep the index in range
  const active = Math.min(index, count - 1);
  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || prefersReducedMotion()) return;
    const t = setTimeout(() => go(active + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [active, count, paused, go]);

  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      className="relative isolate overflow-hidden bg-slate-950"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={onTouchEnd}
    >
      {/* Background images cross-fade */}
      {slides.map((b, i) => (
        <img
          key={b.id}
          src={assetUrl(b.image_url)}
          alt=""
          fetchPriority={i === 0 ? 'high' : 'low'}
          loading={i === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-1000 ${i === active ? 'opacity-50' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-blue-950/30" />

      {/* All slides share one grid cell, so the hero keeps the height of the tallest slide */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-40 sm:pt-24 sm:pb-44 md:pt-32 md:pb-52 grid">
        {slides.map((b, i) => (
          <div
            key={b.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== active}
            inert={i !== active}
            className={`[grid-area:1/1] max-w-2xl transition-all duration-700 ${i === active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${loading ? 'invisible' : ''}`}
          >
            {b.tag && (
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-cyan-300">
                <Zap className="w-4 h-4" /> {b.tag}
              </span>
            )}
            <h1 className="mt-5 sm:mt-6 text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold text-white leading-[1.05] break-words">
              {b.title}
              {b.highlight && (
                <>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 bg-clip-text text-transparent">{b.highlight}</span>
                </>
              )}
            </h1>
            {b.subtitle && <p className="mt-5 sm:mt-6 text-base sm:text-lg text-slate-300 max-w-xl">{b.subtitle}</p>}
            <div className="mt-7 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
              {b.button_text && b.button_link && (
                <BannerButton href={b.button_link}>{b.button_text} <ArrowRight className="w-4 h-4" /></BannerButton>
              )}
              <Link to="/workouts" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 sm:px-7 sm:py-3.5 font-semibold text-white hover:border-cyan-300 hover:text-cyan-200 transition-colors">
                <Play className="w-4 h-4" /> Explore Workouts
              </Link>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-24 sm:bottom-28 md:bottom-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3">
            <button onClick={() => go(active - 1)} aria-label="Previous slide"
              className="w-10 h-10 rounded-full border border-white/25 bg-white/10 text-white backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {slides.map((b, i) => (
                <button key={b.id} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}`} aria-current={i === active}
                  className={`h-2.5 rounded-full transition-all ${i === active ? 'w-8 bg-cyan-400' : 'w-2.5 bg-white/40 hover:bg-white/70'}`} />
              ))}
            </div>
            <button onClick={() => go(active + 1)} aria-label="Next slide"
              className="w-10 h-10 rounded-full border border-white/25 bg-white/10 text-white backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
