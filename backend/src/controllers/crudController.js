import { handle } from '../utils/http.js';
import { publishSiteUpdate } from '../utils/realtime.js';

// Standard admin create/update/delete handlers for a Model.
// `publicResource` names data the website shows; open website tabs are told to refresh it.
export const crud = (model, { publicResource } = {}) => {
  const changed = () => publicResource && publishSiteUpdate(publicResource);
  return {
    create: handle(async (req, res) => {
      const id = await model.create(req.body);
      changed();
      res.status(201).json({ message: 'Created successfully', id });
    }),
    update: handle(async (req, res) => {
      await model.update(req.params.id, req.body);
      changed();
      res.json({ message: 'Updated successfully' });
    }),
    remove: handle(async (req, res) => {
      await model.remove(req.params.id);
      changed();
      res.json({ message: 'Deleted successfully' });
    }),
  };
};
