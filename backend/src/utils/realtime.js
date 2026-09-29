import { getIO, ADMIN_ROOM } from './socket.js';

export { ADMIN_ROOM };

// Private events (names, amounts, enquiries) go only to signed-in admins
export const notifyAdmins = (event, data) => getIO()?.to(ADMIN_ROOM).emit(event, data);

// Tells every open website tab that public data changed. Only the resource name is sent:
// clients re-read the public API, which already strips private columns.
export const publishSiteUpdate = (resource) => getIO()?.emit('site:update', { resource, at: Date.now() });
