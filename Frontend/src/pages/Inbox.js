import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentProgress, getCourseAssignments, getUserEnrollments } from '../services/api';
import BottomNav from '../components/BottomNav';
import './Auth.css';

const statusLabel = { not_started: 'Not Started', in_progress: 'In Progress', submitted: '⏳ Submitted', graded: '✅ Graded' };
const statusColor = { not_started: '#aaa', in_progress: '#f0a500', submitted: '#3b82f6', graded: '#22c55e' };

const Inbox = () => {
  const { user } = useAuth();
  const role = user?.role?.name || user?.role;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const userId = user._id || user.id;

        if (role === 'Intern') {
          const progressRes = await getStudentProgress(userId);
          setMessages(progressRes.data || []);
        } else {
          // Mentor/Admin: show all enrollments across their courses
          const enrollRes = await getUserEnrollments(userId);
          setMessages(enrollRes.data || []);
        }
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [user, role]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <h2 style={{ padding: '16px 16px 0' }}>Inbox</h2>

      {messages.length === 0 ? (
        <p style={{ padding: 16, color: '#888' }}>No messages yet.</p>
      ) : (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 80 }}>
          {role === 'Intern' ? messages.map((p) => (
            <div key={p._id} className="card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{p.assignment?.title || 'Assignment'}</strong>
                <span style={{ fontSize: 12, color: statusColor[p.status], fontWeight: 600 }}>
                  {statusLabel[p.status] || p.status}
                </span>
              </div>
              {p.assignment?.description && (
                <p style={{ fontSize: 13, color: '#666', margin: '4px 0' }}>{p.assignment.description}</p>
              )}
              {p.submissionDate && (
                <p style={{ fontSize: 12, color: '#aaa' }}>Submitted: {new Date(p.submissionDate).toLocaleDateString()}</p>
              )}
              {p.status === 'graded' && (
                <div style={{ marginTop: 8, padding: 8, background: '#f0fdf4', borderRadius: 6 }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>Score: {p.score} / {p.maxScore}</p>
                  {p.feedback && <p style={{ margin: '4px 0 0', fontSize: 13 }}>Feedback: {p.feedback}</p>}
                  {p.gradedDate && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#aaa' }}>Graded: {new Date(p.gradedDate).toLocaleDateString()}</p>}
                </div>
              )}
            </div>
          )) : messages.map((e) => (
            <div key={e._id} className="card" style={{ margin: 0 }}>
              <strong>{e.course?.title || 'Course'}</strong>
              <p style={{ fontSize: 13, color: '#666', margin: '4px 0' }}>
                Student enrolled · {new Date(e.enrolledAt).toLocaleDateString()}
              </p>
              <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>{e.status}</span>
            </div>
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
};

export default Inbox;
