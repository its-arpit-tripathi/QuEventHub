import jwt from 'jsonwebtoken';
import User from '../models/usersModel.js';
import Club from '../models/Club.js';

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token, return error
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Branch by role: student/admin use User model, 'club' uses Club model
    if (decoded.role === 'club') {
      const club = await Club.findById(decoded.id).select('-passwordHash');
      if (!club) {
        return res
          .status(401)
          .json({ success: false, message: 'Club not found' });
      }
      // Attach a normalized user-like object and raw club for downstream use
      req.user = {
        ...club.toObject(),
        role: 'club',
        email: club.contactEmail,
        isClub: true,
      };
      req.club = club;
      return next();
    }

    // Default: regular user (student/admin)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'User not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ success: false, message: 'Token expired' });
    }

    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, token failed' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, message: 'Admin privileges required' });
  }
  next();
};

const requireClub = (req, res, next) => {
  if (!req.user || req.user.role !== 'club') {
    return res
      .status(403)
      .json({ success: false, message: 'Club privileges required' });
  }
  next();
};

export { protect, requireAdmin, requireClub };
