import React, { useState } from 'react';
import { Home, School, BookCopy, BookOpenText, User, Presentation, Users, Settings, PcCase } from 'lucide-react';
import CampusComponent from '../components/campusComponent';
import CourseComponent from '../components/courseComponent';
import StudentComponent from '../components/studentComponent';
import TimetableComponent from '../components/timetableComponent';
import TimetableFilterComponent from '../components/timetableFilterComponent';
import SubjectFilterComponent from '../components/subjectFilterComponent'
import CourseFilterComponent from '../components/courseFilter';
import ClassComponent from '../components/classComponent';
import StaffComponent from '../components/staffComponent';
import SubjectComponent from '../components/subjectComponent';
import SubjectClassComponent from '../components/subjectClassComponent';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../components/supabaseClient';
import '../styles/adminPage.css';
import '../styles/filterComponent.css';
import '../styles/timetablePage.css';
import VITLogo from '../assets/VIT_White.png';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [timetableFilters, setTimetableFilters] = useState({ campusId: null, courseId: null });
    const [subjectFilters, setSubjectFilters] = useState({ campusId: null, courseId: null, unitId: null});
    const [courseFilters, setCourseFilters] = useState({ campusId: null, courseId: null });
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/');
        }
    };

    const handleTimetableFilterChange = (filters) => {
        setTimetableFilters(filters);
    };

    const handleSubjectFilterChange = (filters) => {
        setSubjectFilters(filters);
    };

    const handleCourseFilterChange = (filters) => {
        setCourseFilters(filters);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'campuses':
                return <CampusComponent />;
            case 'account':
                return <AccountContent />;
            case 'courses':
                return <CourseComponent filters={courseFilters}/>;
            case 'units':
                return <SubjectComponent filters={subjectFilters} />;
            case 'subjectclasses':
                return <SubjectClassComponent />;
            case 'students':
                return <StudentComponent />;
            case 'staff':
                return <StaffComponent />;
            case 'classrooms':
                return <ClassComponent />;
            case 'home':
                return <TimetableComponent filters={timetableFilters} />;
            default:
                return null;
        }
    };

    const renderSidebar = () => {
        if (activeTab === 'home') {
            return (
                <TimetableFilterComponent onFilterChange={handleTimetableFilterChange} />
            );
        } else if (activeTab == 'units') {
            return (
                <SubjectFilterComponent onFilterChange={handleSubjectFilterChange} />
            );
        } else if (activeTab == 'courses'){
            return (
                <CourseFilterComponent onFilterChange={handleCourseFilterChange} />
            )
        }
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
                            <SidebarLink Icon={School} label="Campuses" onClick={() => setActiveTab('campuses')} active={activeTab === 'campuses'} />
                            <SidebarLink Icon={BookCopy} label="Courses" onClick={() => setActiveTab('courses')} active={activeTab === 'courses'} />
                            <SidebarLink Icon={BookOpenText} label="Units" onClick={() => setActiveTab('units')} active={activeTab === 'units'} />
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

export default AdminPage;