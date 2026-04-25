import React from 'react';
import { NavLink } from 'react-router-dom';
import { AiOutlineHome } from 'react-icons/ai';
import { BiBook } from 'react-icons/bi';
import { MdOutlineInbox } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { useAuth } from '../context/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
  const { unreadCount } = useAuth();
  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <AiOutlineHome size={22} /><span>Home</span>
      </NavLink>
      <NavLink to="/courses" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <BiBook size={22} /><span>Catalog</span>
      </NavLink>
      <NavLink to="/inbox" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <MdOutlineInbox size={22} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -8,
              background: '#ef4444', color: '#fff',
              fontSize: 10, fontWeight: 700,
              borderRadius: '50%', width: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </div>
        <span>Inbox</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <CgProfile size={22} /><span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
