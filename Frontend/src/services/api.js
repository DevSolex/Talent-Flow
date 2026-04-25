import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// Users
export const getProfile = () => api.get('/users/profile');
export const getAllUsers = () => api.get('/users');
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Courses
export const getCourses = () => api.get('/courses');
export const getCourse = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// Enrollments
export const enroll = (data) => api.post('/enrollments', data);
export const getUserEnrollments = (userId) => api.get(`/enrollments/${userId}`);
export const getAllEnrollments = () => api.get('/enrollments');

// Assignments
export const getCourseAssignments = (courseId) => api.get(`/assignments/course/${courseId}`);
export const createAssignment = (data) => api.post('/assignments', data);
export const submitAssignment = (id, data) => api.post(`/assignments/${id}/submit`, data);
export const gradeAssignment = (id, data) => api.post(`/assignments/${id}/grade`, data);
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`);

// Progress
export const getStudentProgress = (studentId) => api.get(`/progress/student/${studentId}`);

export default api;
