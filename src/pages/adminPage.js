import React, { useState } from 'react';
import { Settings, BookOpen, User, Inbox, Clock } from 'lucide-react';
import NavbarComponent from '../components/navbarComponent';
import CourseComponent from '../components/courseComponent';
import '../styles/adminPage.css'; // Import the new CSS file

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('account');

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountContent />;
      case 'courses':
        return <CourseComponent />;
      case 'user':
        return <UserContent />;
      case 'inbox':
        return <InboxContent />;
      case 'history':
        return <HistoryContent />;
      default:
        return <AccountContent />;
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-main-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <nav>
            <SidebarLink icon={<Settings />} label="Account" onClick={() => setActiveTab('account')} active={activeTab === 'account'} />
            <SidebarLink icon={<BookOpen />} label="Courses" onClick={() => setActiveTab('courses')} active={activeTab === 'courses'} />
            <SidebarLink icon={<User />} label="User" onClick={() => setActiveTab('user')} active={activeTab === 'user'} />
            <SidebarLink icon={<Inbox />} label="Inbox" onClick={() => setActiveTab('inbox')} active={activeTab === 'inbox'} />
            <SidebarLink icon={<Clock />} label="History" onClick={() => setActiveTab('history')} active={activeTab === 'history'} />
          </nav>
        </div>

        {/* Main content */}
        <main className="admin-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const SidebarLink = ({ icon, label, onClick, active }) => (
  <a
    href="#"
    className={active ? 'active' : ''}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </a>
);

const AccountContent = () => (
  <div className="admin-section">
    <h2>Account Details</h2>
    <p>Name: Michelle Gu</p>
    <p>Email: mich@elle.gu</p>
    <p>Role: Administrator</p>
    <p>Last Login: 2023-09-24 14:30:00</p>
    <p>Account Status: Active</p>
  </div>
);

const UserContent = () => (
  <div className="admin-section">
    <h2>User</h2>
    <p>functionality coming soon... d-(^_^)z</p>
  </div>
);

const InboxContent = () => (
  <div className="admin-section">
    <h2>Inbox</h2>
    <p>functionality coming soon... d-(^_^)z</p>
  </div>
);

const HistoryContent = () => (
  <div className="admin-section">
    <h2>History/Log</h2>
    <p>functionality coming soon... d-(^_^)z</p>
  </div>
);

export default AdminPage;