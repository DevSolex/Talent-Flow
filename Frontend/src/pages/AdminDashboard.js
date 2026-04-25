import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, deleteUser, getCourses, getAllEnrollments, deleteCourse } from '../services/api';
import BottomNav from '../components/BottomNav';
import './Dashboard.css';

const roleColor = { Admin: '#ef4444', Mentor: '#8b5cf6', Intern: '#3b82f6' };

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getCourses(), getAllEnrollments()])
      .then(([u, c, e]) => {
        setUsers(u.data);
        setCourses(c.data);
        setEnrollments(e.data);
      }).finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await deleteUser(id);
    setUsers(users.filter((u) => u._id !== id));
  };

  const handleDeleteCourse = async (id, title) => {
    if (!window.confirm(`Delete course "${title}"?`)) return;
    await deleteCourse(id);
    setCourses(courses.filter((c) => c._id !== id));
  };

  const interns = users.filter((u) => u.role?.name === 'Intern');
  const mentors = users.filter((u) => u.role?.name === 'Mentor');
  const admins  = users.filter((u) => u.role?.name === 'Admin');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dash-header">
        <div>
          <p className="greeting">Admin Panel</p>
          <h2>{user.name}</h2>
        </div>
        <button className="btn-outline" style={{ fontSize: 13 }} onClick={() => { logout(); navigate('/login'); }}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {['overview', 'users', 'courses', 'enrollments'].map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setSearch(''); }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <>
          <div className="stats-row">
            <div className="stat-card"><h3>{users.length}</h3><p>Total Users</p></div>
            <div className="stat-card"><h3>{courses.length}</h3><p>Courses</p></div>
            <div className="stat-card"><h3>{enrollments.length}</h3><p>Enrollments</p></div>
          </div>
          <div className="stats-row">
            <div className="stat-card"><h3>{interns.length}</h3><p>Interns</p></div>
            <div className="stat-card"><h3>{mentors.length}</h3><p>Mentors</p></div>
            <div className="stat-card"><h3>{admins.length}</h3><p>Admins</p></div>
          </div>

          <h3 className="section-title">Recent Enrollments</h3>
          <div className="list">
            {enrollments.slice(0, 8).map((e) => (
              <div className="list-item" key={e._id}>
                <div>
                  <p className="item-title">{e.user?.name || '—'}</p>
                  <p className="item-sub">{e.course?.title || '—'} · {new Date(e.enrolledAt).toLocaleDateString()}</p>
                </div>
                <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{e.status}</span>
              </div>
            ))}
          </div>

          <h3 className="section-title">Recent Users</h3>
          <div className="list">
            {users.slice(0, 6).map((u) => (
              <div className="list-item" key={u._id}>
                <div>
                  <p className="item-title">{u.name}</p>
                  <p className="item-sub">{u.email}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: roleColor[u.role?.name] || '#aaa',
                  background: '#f3f4f6', padding: '2px 8px', borderRadius: 12 }}>
                  {u.role?.name}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Users */}
      {tab === 'users' && (
        <>
          <div style={{ padding: '0 16px 12px' }}>
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
            />
          </div>
          <div className="list">
            {filteredUsers.map((u) => (
              <div className="list-item" key={u._id}>
                <div style={{ flex: 1 }}>
                  <p className="item-title">{u.name}</p>
                  <p className="item-sub">{u.email} · Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: roleColor[u.role?.name] || '#aaa',
                  background: '#f3f4f6', padding: '2px 8px', borderRadius: 12, marginRight: 8 }}>
                  {u.role?.name}
                </span>
                {u._id !== (user._id || user.id) && (
                  <button className="btn-delete" onClick={() => handleDeleteUser(u._id, u.name)}>Delete</button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Courses */}
      {tab === 'courses' && (
        <>
          <div style={{ padding: '0 16px 4px' }}>
            <input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
            />
          </div>
          <div className="list">
            {courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase())).map((c) => {
              const courseEnrollments = enrollments.filter((e) => (e.course?._id || e.course) === c._id);
              return (
                <div className="list-item" key={c._id}>
                  <div style={{ flex: 1 }}>
                    <p className="item-title">{c.title}</p>
                    <p className="item-sub">{courseEnrollments.length} enrolled · {c.duration || 0} hrs</p>
                  </div>
                  <button className="btn-delete" onClick={() => handleDeleteCourse(c._id, c.title)}>Delete</button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Enrollments */}
      {tab === 'enrollments' && (
        <div className="list">
          {enrollments.map((e) => (
            <div className="list-item" key={e._id}>
              <div>
                <p className="item-title">{e.user?.name || '—'}</p>
                <p className="item-sub">{e.course?.title || '—'}</p>
                <p className="item-sub" style={{ fontSize: 11, color: '#aaa' }}>{new Date(e.enrolledAt).toLocaleDateString()}</p>
              </div>
              <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{e.status}</span>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default AdminDashboard;
