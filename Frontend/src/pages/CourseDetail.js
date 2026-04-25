import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCourse, getCourseAssignments, enroll, getUserEnrollments,
  submitAssignment, gradeAssignment, createAssignment, deleteAssignment,
  getStudentProgress, getAssignmentSubmissions
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
  const [myProgress, setMyProgress] = useState({}); // assignmentId -> progress record
  const [submissions, setSubmissions] = useState({}); // assignmentId -> submissions[]

  useEffect(() => {
    Promise.all([
      getCourse(id),
      getCourseAssignments(id),
      getUserEnrollments(user._id || user.id),
    ]).then(async ([c, a, e]) => {
      setCourse(c.data);
      setAssignments(a.data);
      setEnrolled(e.data.some((en) => (en.course?._id || en.course) === id));

      if (role === 'Intern') {
        const prog = await getStudentProgress(user._id || user.id);
        const map = {};
        (prog.data || []).forEach((p) => { map[p.assignment?._id || p.assignment] = p; });
        setMyProgress(map);
      }

      if (role === 'Mentor' || role === 'Admin') {
        const subMap = {};
        await Promise.all(a.data.map(async (assign) => {
          const s = await getAssignmentSubmissions(assign._id);
          subMap[assign._id] = s.data;
        }));
        setSubmissions(subMap);
      }
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
      const res = await submitAssignment(assignId, { answer });
      setMyProgress({ ...myProgress, [assignId]: res.data });
      setAnswers({ ...answers, [assignId]: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleGrade = async (assignId, studentId) => {
    const data = gradeData[`${assignId}_${studentId}`];
    const score = Number(data?.score);
    if (!data?.score || isNaN(score) || score < 0) return alert('Enter a valid score (0 or above)');
    try {
      await gradeAssignment(assignId, { studentId, score, feedback: data.feedback || '' });
      // refresh submissions
      const s = await getAssignmentSubmissions(assignId);
      setSubmissions({ ...submissions, [assignId]: s.data });
      setGradeData({ ...gradeData, [`${assignId}_${studentId}`]: {} });
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
              {role === 'Intern' && enrolled && (() => {
                const prog = myProgress[a._id];
                if (prog && ['submitted', 'graded'].includes(prog.status)) {
                  return (
                    <div style={{ marginTop: 8, padding: 10, background: '#f0fdf4', borderRadius: 8 }}>
                      <p style={{ margin: 0, fontWeight: 600, color: prog.status === 'graded' ? '#22c55e' : '#3b82f6' }}>
                        {prog.status === 'graded' ? `✅ Graded: ${prog.score}/${prog.maxScore}` : '⏳ Submitted — awaiting grade'}
                      </p>
                      {prog.feedback && <p style={{ margin: '4px 0 0', fontSize: 13 }}>Feedback: {prog.feedback}</p>}
                    </div>
                  );
                }
                return (
                  <div className="answer-section">
                    <textarea
                      placeholder="Write your answer here..."
                      value={answers[a._id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [a._id]: e.target.value })}
                      rows={4}
                      style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 6, border: '1px solid #ddd', resize: 'vertical' }}
                    />
                    <button className="btn-outline" onClick={() => handleSubmit(a._id)} disabled={!answers[a._id]?.trim()}>
                      Submit
                    </button>
                  </div>
                );
              })()}
              {(role === 'Mentor' || role === 'Admin') && (
                <div className="grade-section">
                  {(submissions[a._id] || []).length === 0 ? (
                    <p style={{ fontSize: 13, color: '#aaa' }}>No submissions yet.</p>
                  ) : (submissions[a._id] || []).map((sub) => (
                    <div key={sub._id} style={{ borderTop: '1px solid #eee', paddingTop: 10, marginTop: 10 }}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{sub.student?.name}</p>
                      <p style={{ margin: '4px 0', fontSize: 13, color: '#555' }}>{sub.answer}</p>
                      {sub.status === 'graded' ? (
                        <p style={{ color: '#22c55e', fontSize: 13 }}>✅ Graded: {sub.score}/{sub.maxScore} — {sub.feedback}</p>
                      ) : (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                          <input type="number" placeholder="Score" min="0" style={{ width: 80, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd' }}
                            onChange={(e) => setGradeData({ ...gradeData, [`${a._id}_${sub.student?._id}`]: { ...gradeData[`${a._id}_${sub.student?._id}`], score: e.target.value } })} />
                          <input placeholder="Feedback" style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd' }}
                            onChange={(e) => setGradeData({ ...gradeData, [`${a._id}_${sub.student?._id}`]: { ...gradeData[`${a._id}_${sub.student?._id}`], feedback: e.target.value } })} />
                          <button className="btn-outline" onClick={() => handleGrade(a._id, sub.student?._id)}>Grade</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {role === 'Admin' && (
                    <button className="btn-delete" style={{ marginTop: 10 }} onClick={() => handleDeleteAssignment(a._id)}>Delete Assignment</button>
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
