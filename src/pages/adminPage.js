import React, { useState } from 'react';
import { Home, School, BookCopy, BookOpenText, User, Presentation, Users, Settings, MessageSquareMore } from 'lucide-react';
import CampusComponent from '../components/admin/campusComponent';
import SignupFormComponent from '../components/admin/signupFormComponent';
import CourseComponent from '../components/admin/courseComponent';
import StudentComponent from '../components/admin/studentComponent';
import TimetableComponent from '../components/timetable/timetableComponent';
import TimetableFilterComponent from '../components/timetable/timetableFilterComponent';
import ClassComponent from '../components/admin/classComponent';
import StaffComponent from '../components/admin/staffComponent';
import SubjectComponent from '../components/admin/subjectComponent';
import GPTAssist from '../components/admin/gptAssist';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import '../styles/adminPage.css';
import '../styles/filterComponent.css';
import '../styles/timetablePage.css';
import VITLogo from '../assets/VIT_White.png';

const AdminPage = () => {
    // Manage active tab in sidebar
    const [activeTab, setActiveTab] = useState('home');
    const [timetableFilters, setTimetableFilters] = useState({ campusId: null, courseId: null });
    const navigate = useNavigate();

    // Handle user sign out
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/');
        }
    };

    // Handle changes in timetable filters
    const handleTimetableFilterChange = (filters) => {
        setTimetableFilters(filters);
    };

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'campuses':
                return <CampusComponent />;
            case 'register':
                return <SignupFormComponent />;
            case 'courses':
                return <CourseComponent />;
            case 'units':
                return <SubjectComponent />;
            case 'students':
                return <StudentComponent />;
            case 'staff':
                return <StaffComponent />;
            case 'classrooms':
                return <ClassComponent />;
            case 'home':
                return <TimetableComponent filters={timetableFilters} />;
            case 'assistant':
                return <GPTAssist />;
            default:
                return null;
        }
    };

    // Render sidebar with filters based on active tab
    const renderSidebar = () => {

        // Timetable filter on Home page
        if (activeTab === 'home') {
            return (
                <TimetableFilterComponent onFilterChange={handleTimetableFilterChange} /> 
            );
        } 

        //No Filter on AI page
        if (activeTab === 'assistant') { 
            return;
        }

        // General filter on other tabs
        return ( 
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
        );
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className='admin-sidebar-wrapper'>
                <div className="admin-sidebar">
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
                            <SidebarLink Icon={School} label="Campuses" onClick={() => setActiveTab('campuses')} active={activeTab === 'campuses'} />
                            <SidebarLink Icon={BookCopy} label="Courses" onClick={() => setActiveTab('courses')} active={activeTab === 'courses'} />
                            <SidebarLink Icon={BookOpenText} label="Units" onClick={() => setActiveTab('units')} active={activeTab === 'units'} />
                            <SidebarLink Icon={Presentation} label="Classrooms" onClick={() => setActiveTab('classrooms')} active={activeTab === 'classrooms'} />
                        </div>
                        <div className="nav-section">
                            <SidebarLink Icon={Users} label="Students" onClick={() => setActiveTab('students')} active={activeTab === 'students'} />
                            <SidebarLink Icon={User} label="Staff" onClick={() => setActiveTab('staff')} active={activeTab === 'staff'} />
                        </div>
                        <div className="nav-section">
                            <SidebarLink Icon={MessageSquareMore} label="AI Assistant" onClick={() => setActiveTab('assistant')} active={activeTab === 'assistant'} />
                            <SidebarLink Icon={Settings} label="Register" onClick={() => setActiveTab('register')} active={activeTab === 'register'} />
                        </div>
                    </nav>

                    <button onClick={handleSignOut} className="signout-button">
                        SIGN OUT
                    </button>
                </div>
            </div>
            
            {/* Main content area */}
            <div className="main-content">
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
                        {renderSidebar()}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sidebar link component
const SidebarLink = ({ Icon, label, onClick, active }) => (
    <button onClick={onClick} className={`sidebar-link ${active ? 'active' : ''}`}>
        <Icon className="sidebar-link-icon" />
        {label}
    </button>
);

// Filter section component for each filter
const FilterSection = ({ label }) => (
    <div className="filter-section">
        <label className="filter-label">{label}</label>
        <input type="text" className="filter-input" placeholder="All" />
    </div>
);

export default AdminPage;
