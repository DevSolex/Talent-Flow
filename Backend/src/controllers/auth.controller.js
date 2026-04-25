const User = require('../models/User');
const Role = require('../models/Role');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, roleName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    let role = await Role.findOne({ name: roleName || 'Intern' });
    if (!role) {
      role = new Role({ name: roleName || 'Intern' });
      await role.save();
    }

    const isMentor = role.name === 'Mentor';
    const user = new User({ name, email, password, role: role._id, status: isMentor ? 'pending' : 'active' });
    await user.save();

    if (isMentor) {
      // Notify all admins
      const adminRole = await Role.findOne({ name: 'Admin' });
      if (adminRole) {
        const admins = await User.find({ role: adminRole._id });
        const notifications = admins.map((admin) => ({
          recipient: admin._id,
          type: 'mentor_request',
          message: `${name} has requested a Mentor account and is awaiting your approval.`,
          meta: { applicantId: user._id, applicantName: name, applicantEmail: email },
        }));
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({
      message: isMentor
        ? 'Registration submitted. Your account is pending admin approval.'
        : 'User registered successfully',
      user: { id: user._id, name, email, status: user.status },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('role');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending admin approval.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', {
      expiresIn: '1d',
    });

    res
      .status(200)
      .json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role?.name },
      });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
