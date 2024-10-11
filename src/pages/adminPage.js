import React, { useState } from 'react';
import { Home, BookOpen, User, Presentation, Users, Settings, PcCase } from 'lucide-react';
import CourseComponent from '../components/courseComponent';
import StudentComponent from '../components/studentComponent';
import ClassComponent from '../components/classComponent';
import StaffComponent from '../components/staffComponent';
import SubjectClassComponent from '../components/subjectClassComponent';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../components/supabaseClient';
import '../styles/adminPage.css';
import '../styles/filterComponent.css';
import VITLogo from '../assets/VIT_White.png';

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
                return <CourseComponent />;
            case 'subjectclasses':
                return <SubjectClassComponent />;
            case 'students':
                return <StudentComponent />;
            case 'staff':
                return <StaffComponent />;
            case 'classrooms':
                return <ClassComponent />;
            case 'home':
                return <HomeContent />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className='sidebar-wrapper'>
                <div className="sidebar">
                    {/* Logo section */}
                    <div className="sidebar-logo">
                        <img src={VITLogo} alt="VIT Logo" className="h-15" />
                    </div>

                    {/* Home link - separated */}
                    <div className="nav-section">
                        <SidebarLink Icon={Home} label="Home" onClick={() => setActiveTab('home')} active={activeTab === 'home'} />
                    </div>

                    {/* Main navigation links */}
                    <nav className="flex-grow pb-5 pt-2">
                        <div className="nav-section">
                            <SidebarLink Icon={BookOpen} label="Courses" onClick={() => setActiveTab('courses')} active={activeTab === 'courses'} />
                            <SidebarLink Icon={Presentation} label="Classrooms" onClick={() => setActiveTab('classrooms')} active={activeTab === 'classrooms'} />
                            <SidebarLink Icon={PcCase} label="Subject Classes" onClick={() => setActiveTab('subjectclasses')} active={activeTab === 'subjectclasses'} />
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
            </div>
            
            {/* Main content area */}
            <div className="flex-grow flex flex-col">
                <div className='top-nav-wrapper'>
                    <div className="top-nav">
                        <h1 className="top-nav-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                    </div>
                </div>

                <div className="flex flex-grow">
                    {/* Main content */}
                    <div className="flex-grow p-6 bg-gray-100">
                        {renderContent()}
                    </div>

                    {/* Filters sidebar */}
                    <div className="filters-sidebar">
                        <div className='filters-border'>
                            <div className="filters-title">FILTERS</div>
                            <hr className="filters-divider" />
                            <FilterSection label="Course Name" />
                            <FilterSection label="Course ID" />
                            <FilterSection label="Unit Name" />
                            <FilterSection label="Unit ID" />
                            <FilterSection label="Campus" />
                            <hr className="filters-divider" />
                            <button className="apply-button">Apply</button>
                        </div>
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

const HomeContent = () => (
    <div className="admin-section">
        <p>Home dashboard coming soon... d-(^_^)z</p>
    </div>
);

export default AdminPage;
