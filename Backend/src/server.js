const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  const setupSwagger = require('./utils/swagger');
  setupSwagger(app);
}

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/talentflow')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.get('/', (req, res) => {
  res.json({
    message: 'Talent Flow Backend API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      enrollments: '/api/enrollments',
      assignments: '/api/assignments',
      progress: '/api/progress',
    },
  });
});

require('./models/Module'); // register Module schema

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/notifications', require('./routes/notifications'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
