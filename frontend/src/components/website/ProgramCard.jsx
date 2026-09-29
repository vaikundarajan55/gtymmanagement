import { Link } from 'react-router-dom';
import { ArrowRight, Timer, Flame } from 'lucide-react';
import { img, LEVEL_BADGE } from '../../data/site';

// Links to the workout on /workouts, or opens its routine when onOpen is given
export default function ProgramCard({ p, onOpen }) {
  const Wrapper = onOpen ? 'button' : Link;
  const props = onOpen ? { onClick: () => onOpen(p), type: 'button' } : { to: `/workouts#${p.slug}` };
  return (
    <Wrapper {...props} id={onOpen ? p.slug : undefined}
      className="group text-left bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 scroll-mt-28">
      <div className="relative h-52 overflow-hidden bg-slate-200">
        <img src={img(p.image, 700)} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent" />
        <span className="absolute top-3 left-3 badge bg-white/95 border-white text-slate-800 normal-case">{p.category}</span>
        <span className={`absolute top-3 right-3 ${LEVEL_BADGE[p.level]} normal-case`}>{p.level}</span>
        <div className="absolute bottom-3 left-4 flex gap-4 text-xs font-semibold text-white">
          <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> {p.duration} min</span>
          <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {p.calories} kcal</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{p.summary}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-cyan-600 group-hover:gap-2 transition-all">
          View workout <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Wrapper>
  );
}
