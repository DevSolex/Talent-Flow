const Course = require('../models/Course');
const User = require('../models/User');
const Role = require('../models/Role');
const Notification = require('../models/Notification');

const getCourses = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { status: 'published' };
    const courses = await Course.find(filter).populate('mentor', 'name email').populate('modules');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('mentor', 'name email').populate('modules');
    if (course) return res.json(course);
    return res.status(404).json({ message: 'Course not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCourse = async (req, res) => {
  const { title, description, modules } = req.body;
  try {
    const isAdmin = req.user.role?.name === 'Admin';
    const course = new Course({
      title, description,
      mentor: req.user._id,
      modules: modules || [],
      status: isAdmin ? 'published' : 'pending',
    });
    const createdCourse = await course.save();

    if (!isAdmin) {
      // Notify all admins
      const adminRole = await Role.findOne({ name: 'Admin' });
      if (adminRole) {
        const admins = await User.find({ role: adminRole._id });
        await Notification.insertMany(admins.map((admin) => ({
          recipient: admin._id,
          type: 'course_request',
          message: `${req.user.name} submitted a new course "${title}" for approval.`,
          meta: { courseId: createdCourse._id, courseTitle: title, mentorId: req.user._id, mentorName: req.user.name },
        })));
      }
    }

    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    Object.assign(course, req.body);
    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse };
