import React from "react";
import "./Profile.css";

const menuItems = [
  "My Profile",
  "My Courses",
  "My Certifications",
  "Mentors",
  "My Payment",
  "My Wish list",
  "Change Password",
];

function Profile() {
  return (
    <div className="profile-container">
      <h2 className="title">Profile</h2>

      {/* Profile Section */}
      <div className="profile-header">
        <div className="avatar-wrapper">
          <img
            src="https://via.placeholder.com/100"
            alt="profile"
            className="avatar"
          />
          <div className="add-icon">+</div>
        </div>
        <h3>AbdulMujeeb ADIO</h3>
      </div>

      {/* Menu List */}
      <div className="menu">
        {menuItems.map((item, index) => (
          <div className="menu-item" key={index}>
            <span>{item}</span>
            <span className="arrow">›</span>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item active">🏠<p>Home</p></div>
        <div className="nav-item">📚<p>Catalog</p></div>
        <div className="nav-item">✉️<p>Inbox</p></div>
        <div className="nav-item user">👤</div>
      </div>
    </div>
  );
}

export default Profile;