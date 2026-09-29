import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { fail } from './http.js';

// Files are served at /uploads/<folder>/<random>.<ext> from backend/uploads
export const UPLOAD_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES = {
  png: { ext: 'png', magic: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  jpeg: { ext: 'jpg', magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  webp: { ext: 'webp', magic: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
};

// Accepts a data URL (data:image/png;base64,...) from the admin form, checks the real file
// signature (not just the declared type) and stores it under a random name.
export const saveImage = async (dataUrl, folder) => {
  const m = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw fail(400, 'Upload a PNG, JPG or WebP image');
  const type = TYPES[m[1]];
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > MAX_BYTES) throw fail(400, 'Image must be 3 MB or smaller');
  if (buf.length < 12 || !type.magic(buf)) throw fail(400, 'That file is not a valid image');

  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  const name = `${crypto.randomBytes(12).toString('hex')}.${type.ext}`;
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${folder}/${name}`;
};

// Removes a file we stored earlier; external URLs and unknown paths are ignored
export const removeUpload = async (url, folder) => {
  const m = new RegExp(`^/uploads/${folder}/([a-f0-9]+\\.(png|jpe?g|webp))$`).exec(String(url || ''));
  if (!m) return;
  await unlink(path.join(UPLOAD_ROOT, folder, m[1])).catch(() => {});
};
