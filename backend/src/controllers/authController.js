import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AdminModel from '../models/AdminModel.js';
import { handle, fail } from '../utils/http.js';

const JWT_SECRET = () => process.env.JWT_SECRET || 'gym_secret_key_2024';
const JWT_EXPIRES = () => process.env.JWT_EXPIRES || '7d';

export const login = handle(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw fail(400, 'Email and password required');

  const admin = await AdminModel.findByEmail(email);
  if (!admin || !(await bcrypt.compare(password, admin.password))) throw fail(401, 'Invalid credentials');

  const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET(), { expiresIn: JWT_EXPIRES() });
  const { password: _, ...user } = admin;
  res.json({ token, user });
});

export const changePassword = handle(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await AdminModel.findById(req.user.id);
  if (!admin) throw fail(404, 'Admin not found');
  if (!(await bcrypt.compare(String(currentPassword || ''), admin.password))) throw fail(400, 'Current password is incorrect');
  if (String(newPassword || '').length < 6) throw fail(400, 'New password must be at least 6 characters');

  await AdminModel.updatePassword(req.user.id, await bcrypt.hash(newPassword, 12));
  res.json({ message: 'Password changed successfully' });
});
