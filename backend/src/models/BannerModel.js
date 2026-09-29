import Model from './Model.js';

// Button links go straight into <a href>: allow only site paths and http(s) URLs (never javascript:)
const SAFE_LINK = /^(\/(?!\/)[^\s]*|https?:\/\/[^\s]+)$/i;
const SAFE_IMAGE = /^(\/uploads\/banners\/[a-f0-9]+\.(png|jpe?g|webp)|https:\/\/[^\s]+)$/i;

function normaliseBanner(data) {
  for (const f of ['tag', 'title', 'highlight', 'subtitle', 'button_text', 'button_link', 'image_url']) {
    if (typeof data[f] === 'string') data[f] = data[f].trim() || null;
  }
  if (data.image_url != null && !SAFE_IMAGE.test(data.image_url)) return 'Image must be an uploaded file or an https:// URL';
  if (data.button_link != null && !SAFE_LINK.test(data.button_link)) return 'Button link must start with / (a site page) or http(s)://';
  if (data.button_text && !data.button_link && 'button_link' in data) return 'Add a button link or clear the button text';
  if (data.sort_order != null) {
    const n = Number.parseInt(data.sort_order, 10);
    if (Number.isNaN(n)) return 'Order must be a number';
    data.sort_order = n;
  }
  return null;
}

class BannerModel extends Model {
  constructor() {
    super({
      table: 'banners',
      required: ['title', 'image_url'],
      normalise: normaliseBanner,
      fields: ['tag', 'title', 'highlight', 'subtitle', 'image_url', 'button_text', 'button_link', 'sort_order', 'status'],
    });
  }

  list({ like, page, limit }) {
    return this.paginate(
      'SELECT * FROM banners WHERE title LIKE ? OR tag LIKE ? OR highlight LIKE ? ORDER BY sort_order, id',
      [like, like, like], page, limit
    );
  }

  // Home page slider
  active() {
    return this.query(
      `SELECT id, tag, title, highlight, subtitle, image_url, button_text, button_link
       FROM banners WHERE status = 'active' ORDER BY sort_order, id`
    );
  }
}

export default new BannerModel();
