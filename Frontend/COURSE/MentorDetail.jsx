import React from "react";
import "./MentorDetail.css";

const courses = [
  {
    title: "Application Design for Beginner",
    image: "https://via.placeholder.com/80",
  },
  {
    title: "Software developments IT Company",
    image: "https://via.placeholder.com/80",
  },
  {
    title: "Graphics Design in Advance",
    image: "https://via.placeholder.com/80",
  },
  {
    title: "Graphics Design in Advance",
    image: "https://via.placeholder.com/80",
  },
];

const MentorDetail = () => {
  return (
    <div className="mentor-container">
      {/* Header */}
      <div className="header">
        <span className="back">←</span>
        <h3>Mentor Detail</h3>
      </div>

      {/* Profile */}
      <div className="profile">
        <img
          src="https://via.placeholder.com/100"
          alt="mentor"
          className="avatar"
        />
        <h2>Grace Adeleke</h2>
        <p className="role">Senior UI/UX</p>

        <div className="stats">
          <div>
            <h3>10</h3>
            <p>Courses</p>
          </div>
          <div>
            <h3>120</h3>
            <p>Students</p>
          </div>
          <div>
            <h3>4.5</h3>
            <p>Reviews</p>
          </div>
        </div>

        <div className="actions">
          <button className="follow">Follow</button>
          <button className="message">Message</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <span className="active">Courses</span>
        <span>Review</span>
      </div>

      {/* Course List */}
      <div className="course-list">
        {courses.map((course, index) => (
          <div className="course-card" key={index}>
            <img src={course.image} alt="course" />
            <div className="course-info">
              <h4>{course.title}</h4>
              <p>Grace Adeleke</p>
            </div>
            <span className="heart">♡</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorDetail;