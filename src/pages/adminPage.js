import React, { useState } from 'react';
import { Home, BookOpen, User, Presentation, Users, Settings, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../components/supabaseClient';
import '../styles/adminPage.css';
import VITLogo from '../assets/VITLogo.png';


const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('courses');
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
      case 'students':
        return <StudentsContent />;
      case 'staff':
        return <StaffContent />;
      case 'classrooms':
        return <ClassroomsContent />;
      case 'home':
        return <HomeContent />;
      default:
        return null;
    }
  };

  return (
    
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="sidebar w-64 flex flex-col">
        {/* Logo section */}
        <div className="sidebar-logo">
          <img src={VITLogo} alt="VIT Logo" className="h-15" />
        </div>

        {/* Home link - separated */}
        <div className="nav-section">
          <SidebarLink Icon={Home} label="Home" onClick={() => setActiveTab('home')} active={activeTab === 'home'} />
        </div>

        {/* Main navigation links */}
        <nav className="flex-grow py-4">
          <div className="nav-section">
            <SidebarLink Icon={BookOpen} label="Courses" onClick={() => setActiveTab('courses')} active={activeTab === 'courses'} />
            <SidebarLink Icon={Presentation} label="Classrooms" onClick={() => setActiveTab('classrooms')} active={activeTab === 'classrooms'} />
            <SidebarLink Icon={Users} label="Students" onClick={() => setActiveTab('students')} active={activeTab === 'students'} />
            <SidebarLink Icon={User} label="Staff" onClick={() => setActiveTab('staff')} active={activeTab === 'staff'} />
          </div>
          <div className="nav-section">
            <SidebarLink Icon={Settings} label="Account" onClick={() => setActiveTab('account')} active={activeTab === 'account'} />
          </div>
        </nav>

        <button onClick={handleSignOut} className="signout-button">
          SIGN OUT
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-grow flex flex-col">
        <div className="top-nav">
          <h1 className="top-nav-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
        </div>

        <div className="flex flex-grow">
          {/* Main content */}
          <div className="flex-grow p-6 bg-gray-100">
            {renderContent()}
          </div>
          
          {/* Filters sidebar */}
          <div className="filters-sidebar w-72 p-6">
            <h2 className="text-xl font-semibold mb-4">FILTERS</h2>
            <FilterSection label="Course Name" />
            <FilterSection label="Course ID" />
            <FilterSection label="Unit Name" />
            <FilterSection label="Unit ID" />
            <FilterSection label="Campus" />
            <button className="apply-button">Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarLink = ({ Icon, label, onClick, active }) => (
  <button onClick={onClick} className={`sidebar-link ${active ? 'active' : ''}`}>
    <Icon className="sidebar-link-icon" />
    {label}
  </button>
);

const FilterSection = ({ label }) => (
  <div className="filter-section">
    <label className="filter-label">{label}</label>
    <input type="text" className="filter-input" placeholder="All" />
  </div>
);

// Content components with dummy data
const AccountContent = () => (
  <div className="admin-section">
    <div className="account-box">
      <p><span className="font-semibold">Name:</span> Michelle Gu</p>
      <p><span className="font-semibold">Email:</span> mich@elle.gu</p>
      <p><span className="font-semibold">Role:</span> Administrator</p>
      <p><span className="font-semibold">Last Login:</span> 2023-09-24 14:30:00</p>
      <p><span className="font-semibold">Account Status:</span> Active</p>
    </div>
  </div>
);

const CoursesContent = () => (
  <div className="courses-list">
    {coursesData.map((course, index) => (
      <div key={index} className="course-row">
        <div className="course-info">
          <div className="course-title">{course.title}</div>
          <div className="course-code">{course.code}</div>
        </div>
        <div className="course-details">
          <div className="delivery-mode">{course.deliveryMode}</div>
          <div className="campus">{course.campus}</div>
        </div>
        <button className="more-options">
          <MoreVertical size={20} />
        </button>
      </div>
    ))}
  </div>
);

const coursesData = [
  {
    title: "BITS - Network Specialisation",
    code: "ICA70112",
    deliveryMode: "On Campus",
    campus: "Sydney"
  },
  {
    title: "Database Fundamentals",
    code: "ITDA1001",
    deliveryMode: "On Campus",
    campus: "Sydney"
  },
];

const StudentsContent = () => (
  <div className="admin-section">
    <p>Students functionality coming soon... d-(^_^)z</p>
  </div>
);

const StaffContent = () => (
  <div className="admin-section">
    <p>Staff functionality coming soon... d-(^_^)z</p>
  </div>
);

const ClassroomsContent = () => (
  <div className="admin-section">
    <p>Classrooms functionality coming soon... d-(^_^)z</p>
  </div>
);

const HomeContent = () => (
  <div className="admin-section">
    <p>Home dashboard coming soon... d-(^_^)z</p>
  </div>
);

export default AdminPage;