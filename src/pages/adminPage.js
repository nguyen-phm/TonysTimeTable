import React, { useState } from 'react';
import { Settings, BookOpen, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../components/supabaseClient';
import '../styles/adminPage.css';
import VITLogo from '../assets/VITLogo.png';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('account');
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountContent />;
      case 'courses':
        return <CoursesContent />;
      case 'user':
        return <UserContent />;
      case 'history':
        return <HistoryContent />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="sidebar w-64">
        {/* Logo section */}
        <div className="sidebar-logo">
          <img src={VITLogo} alt="VIT Logo" className="h-15" />
        </div>

        {/* Navigation links */}
        <nav className="flex-grow py-4">
          <SidebarLink Icon={Settings} label="Account" onClick={() => setActiveTab('account')} active={activeTab === 'account'} />
          <SidebarLink Icon={BookOpen} label="Courses" onClick={() => setActiveTab('courses')} active={activeTab === 'courses'} />
          <SidebarLink Icon={User} label="User" onClick={() => setActiveTab('user')} active={activeTab === 'user'} />
          <SidebarLink Icon={Clock} label="History" onClick={() => setActiveTab('history')} active={activeTab === 'history'} />
        </nav>

        {/* Sign out button */}
        <button 
          onClick={handleSignOut}
          className="signout-button"
        >
          Sign Out
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-grow flex flex-col">
        {/* Top navigation */}
        <div className="top-nav">
          <h1 className="top-nav-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="admin-info">
            <span>Admin</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-grow p-6 bg-gray-100 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const SidebarLink = ({ Icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`sidebar-link ${active ? 'active' : ''}`}
  >
    <Icon className="sidebar-link-icon" />
    {label}
  </button>
);

const AccountContent = () => (
  <div className="admin-section">
    {/* <h2>Account Details</h2> */}
    <div className="space-y-4">
      <p><span className="font-semibold">Name:</span> Michelle Gu</p>
      <p><span className="font-semibold">Email:</span> mich@elle.gu</p>
      <p><span className="font-semibold">Role:</span> Administrator</p>
      <p><span className="font-semibold">Last Login:</span> 2023-09-24 14:30:00</p>
      <p><span className="font-semibold">Account Status:</span> Active</p>
    </div>
  </div>
);

const CoursesContent = () => (
  <div className="admin-section">
    {/* <h2>Courses</h2> */}
    <ul className="space-y-2">
      <li className="course-list-item">IT Project COMP30022</li>
      <li className="course-list-item">Models of Computation COMP30026</li>
      <li className="course-list-item">Web Information Technologies COMP30023</li>
      <li className="course-list-item">Artificial Intelligence COMP30024</li>
    </ul>
  </div>
);

const UserContent = () => (
  <div className="admin-section">
    {/* <h2>User</h2> */}
    <p>Functionality coming soon... d-(^_^)z</p>
  </div>
);

const HistoryContent = () => (
  <div className="admin-section history-section">
    {/* <h2>History/Log</h2> */}
    <p>Functionality coming soon... d-(^_^)z</p>
  </div>
);

export default AdminPage;
