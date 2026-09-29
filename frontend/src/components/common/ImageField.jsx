import { useRef, useState } from 'react';
import { ImageUp, Loader2, ImageOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { assetUrl } from '../../services/config';

const MAX_MB = 3;
const TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

// Image picker for admin forms: upload a file (stored by the API) or paste an https:// URL.
// The form value is the stored path/URL string.
export default function ImageField({ id, value, onChange, uploadPath, required }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [broken, setBroken] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!TYPES.includes(file.type)) return toast.error('Choose a PNG, JPG or WebP image');
    if (file.size > MAX_MB * 1024 * 1024) return toast.error(`Image must be ${MAX_MB} MB or smaller`);
    setUploading(true);
    try {
      const { data } = await api.post(uploadPath, { image: await readAsDataUrl(file) }, { timeout: 30000 });
      setBroken(false);
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/6] w-full overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
        {value && !broken ? (
          <img src={assetUrl(value)} alt="Preview" onError={() => setBroken(true)} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400 text-sm">
            <ImageOff className="w-6 h-6" />
            {value ? 'Image could not be loaded' : 'No image yet'}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-secondary justify-center whitespace-nowrap disabled:opacity-60">
          <ImageUp className="w-4 h-4" /> Upload image
        </button>
        <input
          id={id}
          value={value || ''}
          required={required}
          onChange={(e) => { setBroken(false); onChange(e.target.value); }}
          placeholder="or paste an https:// image URL"
          className="input-field flex-1 min-w-0"
        />
      </div>
      <p className="text-xs text-slate-500">PNG, JPG or WebP up to {MAX_MB} MB. Wide images (1920 × 800 or larger) look best.</p>
      <input ref={fileRef} type="file" accept={TYPES.join(',')} onChange={pick} className="hidden" />
    </div>
  );
}
