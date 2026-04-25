import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import './Dashboard.css';

const Courses = () => {
  const { user } = useAuth();
  const role = user?.role?.name || user?.role;
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const showAll = role === 'Admin' || role === 'Mentor';
    getCourses(showAll).then((res) => setCourses(res.data)).finally(() => setLoading(false));
  }, [role]);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <h2 className="section-title">Course Catalog</h2>
      <div className="input-group">
        <input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <p className="empty">No courses found.</p>
      ) : (
        <div className="course-grid">
          {filtered.map((course) => (
            <Link to={`/courses/${course._id}`} key={course._id} className="course-card">
              <div className="course-card-body">
                <h4>{course.title}</h4>
                <p>{course.mentor?.name || 'TalentFlow'}</p>
                <p style={{ marginTop: 4, fontSize: 11, color: '#aaa' }}>{course.modules?.length || 0} modules</p>
                {course.status === 'pending' && (
                  <span style={{ fontSize: 11, color: '#f0a500', fontWeight: 600 }}>⏳ Pending Approval</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
};

export default Courses;
