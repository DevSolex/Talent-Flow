import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications, markNotificationRead, approveMentor, rejectMentor,
  approveCourse, rejectCourse, getStudentProgress,
} from '../services/api';
import BottomNav from '../components/BottomNav';

const typeColor = {
  mentor_request: '#f0a500',
  mentor_approved: '#22c55e',
  mentor_rejected: '#ef4444',
  course_request: '#8b5cf6',
  course_approved: '#22c55e',
  course_rejected: '#ef4444',
};

const statusColor = { not_started: '#aaa', in_progress: '#f0a500', submitted: '#3b82f6', graded: '#22c55e' };
const statusLabel = { not_started: 'Not Started', in_progress: 'In Progress', submitted: '⏳ Submitted', graded: '✅ Graded' };

const Inbox = () => {
  const { user, setUnreadCount } = useAuth();
  const role = user?.role?.name || user?.role;
  const [notifications, setNotifications] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  // track which mentor_request notifs have been actioned this session
  const [actioned, setActioned] = useState({});

  useEffect(() => {
    const fetches = [getNotifications()];
    if (role === 'Intern') fetches.push(getStudentProgress(user._id || user.id));
    Promise.all(fetches)
      .then(([n, p]) => {
        setNotifications(n.data || []);
        if (p) setProgress(p.data || []);
        const unread = (n.data || []).filter((x) => !x.read).length;
        setUnreadCount(unread);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, role, setUnreadCount]);

  const handleRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleApprove = async (notif) => {
    if (notif.type === 'course_request') {
      await approveCourse(notif.meta.courseId);
    } else {
      await approveMentor(notif.meta.applicantId);
    }
    setActioned((a) => ({ ...a, [notif._id]: 'approved' }));
    if (!notif.read) {
      await markNotificationRead(notif._id);
      setNotifications((prev) => prev.map((n) => n._id === notif._id ? { ...n, read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const handleReject = async (notif) => {
    const name = notif.type === 'course_request' ? notif.meta?.courseTitle : notif.meta?.applicantName;
    if (!window.confirm(`Reject "${name}"?`)) return;
    if (notif.type === 'course_request') {
      await rejectCourse(notif.meta.courseId);
    } else {
      await rejectMentor(notif.meta.applicantId);
    }
    setActioned((a) => ({ ...a, [notif._id]: 'rejected' }));
    if (!notif.read) {
      await markNotificationRead(notif._id);
      setNotifications((prev) => prev.map((n) => n._id === notif._id ? { ...n, read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="page-container">
      <h2 style={{ padding: '16px 16px 4px' }}>
        Inbox{unread > 0 && (
          <span style={{ fontSize: 13, background: '#ef4444', color: '#fff',
            borderRadius: 12, padding: '2px 8px', marginLeft: 8 }}>{unread} unread</span>
        )}
      </h2>

      <div style={{ padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>

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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {!n.read && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                )}
                {!n.read && n.type !== 'mentor_request' && n.type !== 'course_request' && (
                  <button onClick={() => handleRead(n._id)}
                    style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Mark read
                  </button>
                )}
              </div>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#aaa' }}>{new Date(n.createdAt).toLocaleString()}</p>

            {/* Approve/Reject — show until actioned */}
            {(n.type === 'mentor_request' || n.type === 'course_request') && !actioned[n._id] && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn-primary" style={{ fontSize: 13, padding: '6px 16px' }} onClick={() => handleApprove(n)}>
                  ✓ Approve
                </button>
                <button className="btn-delete" style={{ fontSize: 13 }} onClick={() => handleReject(n)}>
                  ✗ Reject
                </button>
              </div>
            )}
            {n.type === 'mentor_request' && actioned[n._id] && (
              <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 600,
                color: actioned[n._id] === 'approved' ? '#22c55e' : '#ef4444' }}>
                {actioned[n._id] === 'approved' ? '✓ Approved' : '✗ Rejected'}
              </p>
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
