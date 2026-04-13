const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const verifyToken = async (req, res, next) => {
  try {
    let token = req.header('Authorization');

    if (!token) return res.status(403).json({ message: 'Access Denied: No token provided' });

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = await User.findById(verified.id).populate('role');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access Denied: No role found' });
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({ message: 'Access Denied: You do not have permission' });
    }
    next();
  };
};

module.exports = { verifyToken, verifyRole };
