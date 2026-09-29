import BannerModel from '../models/BannerModel.js';
import { handle, fail, listParams } from '../utils/http.js';
import { saveImage, removeUpload } from '../utils/uploads.js';
import { publishSiteUpdate } from '../utils/realtime.js';

const FOLDER = 'banners';
const changed = () => publishSiteUpdate('banners');

// Public: active banners for the home page slider
export const active = handle(async (_req, res) => res.json(await BannerModel.active()));

export const list = handle(async (req, res) => res.json(await BannerModel.list(listParams(req.query))));

// Admin image upload; returns the path to store in image_url
export const upload = handle(async (req, res) => {
  const url = await saveImage(req.body.image, FOLDER);
  res.status(201).json({ url });
});

export const create = handle(async (req, res) => {
  const id = await BannerModel.create(req.body);
  changed();
  res.status(201).json({ message: 'Created successfully', id });
});

// When the image is replaced, the old uploaded file is deleted
export const update = handle(async (req, res) => {
  const before = await BannerModel.findById(req.params.id);
  if (!before) throw fail(404, 'Record not found');
  await BannerModel.update(req.params.id, req.body);
  if ('image_url' in req.body && req.body.image_url !== before.image_url) await removeUpload(before.image_url, FOLDER);
  changed();
  res.json({ message: 'Updated successfully' });
});

export const remove = handle(async (req, res) => {
  const before = await BannerModel.findById(req.params.id);
  if (!before) throw fail(404, 'Record not found');
  await BannerModel.remove(req.params.id);
  await removeUpload(before.image_url, FOLDER);
  changed();
  res.json({ message: 'Deleted successfully' });
});
