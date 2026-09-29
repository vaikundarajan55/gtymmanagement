import jwt from 'jsonwebtoken';

const JWT_SECRET = () => process.env.JWT_SECRET || 'gym_secret_key_2024';

// Admin and website-customer tokens share a secret but carry different roles,
// so each guard must check the role, not just the signature.
const guard = (role, label) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const payload = jwt.verify(authHeader.split(' ')[1], JWT_SECRET());
    if (payload.role !== role) return res.status(403).json({ message: `${label} access only` });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authenticate = guard('admin', 'Admin');
export const authenticateCustomer = guard('customer', 'Customer');
