const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, roleName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    let role = await Role.findOne({ name: roleName || 'Intern' });
    if (!role) {
      // In a real app we'd seed roles. Here we auto-create if not exists for easy MVP testing.
      role = new Role({ name: roleName || 'Intern' });
      await role.save();
    }

    const user = new User({ name, email, password, role: role._id });
    await user.save();

    res
      .status(201)
      .json({ message: 'User registered successfully', user: { id: user._id, name, email } });
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
