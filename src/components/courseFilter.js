import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const CourseFilterComponent = ({ onFilterChange }) => {
    const [campuses, setCampuses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState('all');
    const [selectedCourse, setSelectedCourse] = useState('');

    useEffect(() => {
        fetchCampuses(); // Fetch campuses when the component mounts
    }, []);

    useEffect(() => {
        if (selectedCampus === 'all') {
            fetchCourses('all');
            setSelectedCourse('all');
        } else {
            fetchCourses(selectedCampus);
            setSelectedCourse('');
        }
    }, [selectedCampus]);

    const fetchCampuses = async () => {
        const { data, error } = await supabase
            .from('Campuses')
            .select('id, name');
        if (error) console.error('Error fetching campuses:', error);
        else setCampuses(data);
    };

    const fetchCourses = async (campusId) => {
        let query = supabase.from('Courses').select('id, name');
        if (campusId !== 'all') {
            query = query.eq('campus_id', campusId);
        }
        const { data, error } = await query;
        if (error) console.error('Error fetching courses:', error);
        else setCourses(data);
    };

    const handleCampusChange = (e) => {
        const campusId = e.target.value;
        setSelectedCampus(campusId);
        if (campusId === 'all') {
            setSelectedCourse('all');
        } else {
            setSelectedCourse('');
        }
    };

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
    };

    const handleApply = () => {
        // console.log("Applying filters:", {
        //     campusName: selectedCampus,
        //     courseId: selectedCourse
        //     // subjectCode: selectedUnit
        // });
        
        onFilterChange({
            // campusName: selectedCampus === 'all' ? null : campuses.find(campus => campus.id === Number(selectedCampus))?.name, // Set campus name
            courseId: selectedCourse === 'all' ? null : Number(selectedCourse)
        });
    };

    const isApplyDisabled = selectedCampus === 'all' && selectedCourse === 'all' ? false : !selectedCampus || !selectedCourse;

    return (
        <div className="filters-border">
            <div className="filters-title">Filter by course</div>
            <hr className="filters-divider" />
            <div className="filter-section">
                <label className="filter-label">Campus</label>
                <select
                    className="filter-input"
                    value={selectedCampus}
                    onChange={handleCampusChange}
                >
                    <option value="all">All Campuses</option>
                    {campuses.map(campus => (
                        <option key={campus.id} value={campus.id}>{campus.name}</option>
                    ))}
                </select>
            </div>
            <div className="filter-section">
                <label className="filter-label">Course</label>
                <select
                    className="filter-input"
                    value={selectedCourse}
                    onChange={handleCourseChange}
                    disabled={!selectedCampus} // Disable if no campus selected
                >
                    <option value="">Select Course</option>
                    {selectedCampus === 'all' ? (
                        <option value="all">All Courses</option>
                    ) : (
                        courses.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))
                    )}
                </select>
            </div>
            <hr className="filters-divider" />
            <button
                className={`apply-button ${isApplyDisabled ? 'disabled' : ''}`}
                onClick={handleApply}
                disabled={isApplyDisabled}
            >
                Apply
            </button>
        </div>
    );
};

export default CourseFilterComponent;