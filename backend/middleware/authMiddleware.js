const jwt = require('jsonwebtoken');
const User = require('../models/User');

const normalizeRole = (role) => {
  // Backwards compatibility: some existing code stores "student".
  if (role === 'student') return 'currentStudent';
  return role;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id || decoded.userId; // support both old/new payloads
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    });
  }
};

const authorizeRoles = (...roles) => {
  const normalizedRoles = roles.map(normalizeRole);
  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.role);
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient role permissions.',
      });
    }
    next();
  };
};

const adminMiddleware = (req, res, next) => {
  if (normalizeRole(req.user.role) !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

const alumniMiddleware = (req, res, next) => {
  if (normalizeRole(req.user.role) !== 'alumni' && normalizeRole(req.user.role) !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Alumni privileges required.' 
    });
  }
  next();
};

const studentMiddleware = (req, res, next) => {
  const userRole = normalizeRole(req.user.role);
  if (userRole !== 'currentStudent' && userRole !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Student privileges required.' 
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  authorizeRoles,
  adminMiddleware,
  alumniMiddleware,
  studentMiddleware
};
