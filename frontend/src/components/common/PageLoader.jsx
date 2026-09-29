// Full-screen spinner shown while the first route chunk loads
export default function PageLoader() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
