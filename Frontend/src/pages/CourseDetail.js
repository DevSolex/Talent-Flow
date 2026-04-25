import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCourse, getCourseAssignments, enroll, getUserEnrollments,
  submitAssignment, gradeAssignment, createAssignment, deleteAssignment
} from '../services/api';
import BottomNav from '../components/BottomNav';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role?.name || user?.role;

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState({ title: '', description: '', dueDate: '', maxScore: 100 });
  const [gradeData, setGradeData] = useState({});
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    Promise.all([
      getCourse(id),
      getCourseAssignments(id),
      getUserEnrollments(user._id || user.id),
    ]).then(([c, a, e]) => {
      setCourse(c.data);
      setAssignments(a.data);
      setEnrolled(e.data.some((en) => (en.course?._id || en.course) === id));
    }).catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleEnroll = async () => {
    try {
      await enroll({ userId: user._id || user.id, courseId: id });
      setEnrolled(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleSubmit = async (assignId) => {
    const answer = answers[assignId]?.trim();
    if (!answer) return setError('Please write your answer before submitting.');
    try {
      await submitAssignment(assignId, { answer });
      alert('Assignment submitted!');
      setAnswers({ ...answers, [assignId]: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleGrade = async (assignId) => {
    const data = gradeData[assignId];
    if (!data?.studentId || !data?.score) return alert('Fill student ID and score');
    try {
      await gradeAssignment(assignId, data);
      alert('Graded!');
    } catch (err) {
      setError(err.response?.data?.message || 'Grading failed');
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await createAssignment({ ...assignForm, course: id });
      setAssignments([...assignments, res.data]);
      setAssignForm({ title: '', description: '', dueDate: '', maxScore: 100 });
      setShowAssignForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async (assignId) => {
    if (!window.confirm('Delete this assignment?')) return;
    await deleteAssignment(assignId);
    setAssignments(assignments.filter((a) => a._id !== assignId));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!course) return null;

  return (
    <div className="page-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="course-hero card">
        <h2>{course.title}</h2>
        <p className="mentor-name">by {course.mentor?.name || 'TalentFlow'}</p>
        <p className="course-desc">{course.description}</p>
        {role === 'Intern' && !enrolled && (
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={handleEnroll}>
            Enroll Now
          </button>
        )}
        {enrolled && <span className="badge enrolled" style={{ marginTop: 12, display: 'inline-block' }}>✓ Enrolled</span>}
      </div>

      {error && <p className="error-msg">{error}</p>}

      {/* Modules */}
      {course.modules?.length > 0 && (
        <>
          <h3 className="section-title">Modules</h3>
          <div className="list">
            {course.modules.map((m, i) => (
              <div className="list-item" key={m._id || i}>
                <p className="item-title">{i + 1}. {m.title}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Assignments */}
      <div className="section-header">
        <h3 className="section-title">Assignments</h3>
        {(role === 'Mentor' || role === 'Admin') && (
          <button className="btn-outline" onClick={() => setShowAssignForm(!showAssignForm)}>+ Add</button>
        )}
      </div>

      {showAssignForm && (
        <form className="card" style={{ marginBottom: 16 }} onSubmit={handleCreateAssignment}>
          <div className="input-group">
            <label>Title</label>
            <input value={assignForm.title} onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea value={assignForm.description} onChange={(e) => setAssignForm({ ...assignForm, description: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Due Date</label>
            <input type="date" value={assignForm.dueDate} onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Max Score</label>
            <input type="number" value={assignForm.maxScore} onChange={(e) => setAssignForm({ ...assignForm, maxScore: e.target.value })} />
          </div>
          <button className="btn-primary" type="submit">Create Assignment</button>
        </form>
      )}

      {assignments.length === 0 ? (
        <p className="empty">No assignments yet.</p>
      ) : (
        <div className="list">
          {assignments.map((a) => (
            <div className="assignment-card" key={a._id}>
              <div className="assignment-info">
                <p className="item-title">{a.title}</p>
                <p className="item-sub">{a.description}</p>
                {a.dueDate && <p className="item-sub">Due: {new Date(a.dueDate).toLocaleDateString()}</p>}
              </div>
              {role === 'Intern' && enrolled && (
                <div className="answer-section">
                  <textarea
                    placeholder="Write your answer here..."
                    value={answers[a._id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [a._id]: e.target.value })}
                    rows={4}
                    style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 6, border: '1px solid #ddd', resize: 'vertical' }}
                  />
                  <button
                    className="btn-outline"
                    onClick={() => handleSubmit(a._id)}
                    disabled={!answers[a._id]?.trim()}
                  >Submit</button>
                </div>
              )}
              {(role === 'Mentor' || role === 'Admin') && (
                <div className="grade-section">
                  <input placeholder="Student ID" onChange={(e) => setGradeData({ ...gradeData, [a._id]: { ...gradeData[a._id], studentId: e.target.value } })} />
                  <input type="number" placeholder="Score" onChange={(e) => setGradeData({ ...gradeData, [a._id]: { ...gradeData[a._id], score: e.target.value } })} />
                  <input placeholder="Feedback" onChange={(e) => setGradeData({ ...gradeData, [a._id]: { ...gradeData[a._id], feedback: e.target.value } })} />
                  <button className="btn-outline" onClick={() => handleGrade(a._id)}>Grade</button>
                  {role === 'Admin' && (
                    <button className="btn-delete" onClick={() => handleDeleteAssignment(a._id)}>Delete</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
};

export default CourseDetail;
