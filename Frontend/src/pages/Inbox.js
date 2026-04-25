import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications, markNotificationRead, approveMentor, rejectMentor,
  getStudentProgress,
} from '../services/api';
import BottomNav from '../components/BottomNav';

const typeColor = {
  mentor_request: '#f0a500',
  mentor_approved: '#22c55e',
  mentor_rejected: '#ef4444',
};

const statusColor = { not_started: '#aaa', in_progress: '#f0a500', submitted: '#3b82f6', graded: '#22c55e' };
const statusLabel = { not_started: 'Not Started', in_progress: 'In Progress', submitted: '⏳ Submitted', graded: '✅ Graded' };

const Inbox = () => {
  const { user } = useAuth();
  const role = user?.role?.name || user?.role;
  const [notifications, setNotifications] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetches = [getNotifications()];
    if (role === 'Intern') fetches.push(getStudentProgress(user._id || user.id));
    Promise.all(fetches)
      .then(([n, p]) => {
        setNotifications(n.data || []);
        if (p) setProgress(p.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, role]);

  const handleRead = async (id) => {
    await markNotificationRead(id);
    setNotifications(notifications.map((n) => n._id === id ? { ...n, read: true } : n));
  };

  const handleApprove = async (notif) => {
    await approveMentor(notif.meta.applicantId);
    setNotifications(notifications.filter((n) => n._id !== notif._id));
  };

  const handleReject = async (notif) => {
    if (!window.confirm(`Reject ${notif.meta.applicantName}?`)) return;
    await rejectMentor(notif.meta.applicantId);
    setNotifications(notifications.filter((n) => n._id !== notif._id));
  };

  if (loading) return <div className="loading">Loading...</div>;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="page-container">
      <h2 style={{ padding: '16px 16px 4px' }}>
        Inbox {unread > 0 && <span style={{ fontSize: 13, background: '#ef4444', color: '#fff', borderRadius: 12, padding: '2px 8px', marginLeft: 8 }}>{unread}</span>}
      </h2>

      <div style={{ padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Notifications for all roles */}
        {notifications.length === 0 && progress.length === 0 && (
          <p style={{ color: '#888', marginTop: 16 }}>No messages yet.</p>
        )}

        {notifications.map((n) => (
          <div key={n._id} style={{
            background: n.read ? '#fff' : '#fffbeb',
            border: `1px solid ${n.read ? '#e5e7eb' : typeColor[n.type] || '#e5e7eb'}`,
            borderRadius: 10, padding: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 14, flex: 1 }}>{n.message}</p>
              {!n.read && (
                <button onClick={() => handleRead(n._id)}
                  style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Mark read
                </button>
              )}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#aaa' }}>{new Date(n.createdAt).toLocaleString()}</p>

            {/* Admin approve/reject buttons for pending mentor requests */}
            {n.type === 'mentor_request' && !n.read && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn-primary" style={{ fontSize: 13, padding: '6px 16px' }} onClick={() => handleApprove(n)}>
                  ✓ Approve
                </button>
                <button className="btn-delete" style={{ fontSize: 13 }} onClick={() => handleReject(n)}>
                  ✗ Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Assignment progress for interns */}
        {role === 'Intern' && progress.length > 0 && (
          <>
            <h3 style={{ margin: '8px 0 0', fontSize: 15 }}>Assignment Updates</h3>
            {progress.map((p) => (
              <div key={p._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: 14 }}>{p.assignment?.title || 'Assignment'}</strong>
                  <span style={{ fontSize: 12, color: statusColor[p.status], fontWeight: 600 }}>{statusLabel[p.status]}</span>
                </div>
                {p.submissionDate && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#aaa' }}>Submitted: {new Date(p.submissionDate).toLocaleDateString()}</p>}
                {p.status === 'graded' && (
                  <div style={{ marginTop: 8, padding: 8, background: '#f0fdf4', borderRadius: 6 }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>Score: {p.score} / {p.maxScore}</p>
                    {p.feedback && <p style={{ margin: '4px 0 0', fontSize: 13 }}>Feedback: {p.feedback}</p>}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Inbox;
