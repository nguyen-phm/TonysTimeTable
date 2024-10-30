// Work on correctly fetching from the database. (Filter function doesnt work yet fully)
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const SubjectFilterComponent = ({ onFilterChange }) => {
    const [campuses, setCampuses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [units, setUnits] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState('all');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');

    useEffect(() => {
        fetchCampuses(); 
    }, []);

    useEffect(() => {
        fetchUnits(selectedCampus); // Pass selectedCampus to fetchUnits
        if (selectedCampus === 'all') {
            fetchCourses('all');
            setSelectedCourse('all');
            // setSelectedUnit(''); // Reset on campus change
        } else {
            fetchCourses(selectedCampus);
            setSelectedCourse('');
            setSelectedUnit('');
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

    const fetchUnits = async (campusId) => {
        let query = supabase.from('Subjects').select('id, code, Courses (campus_id, Campuses (name))'); // Fetch campus_name
        if (campusId !== 'all') {
            query = query.eq('Courses.campus_id', campusId);
        }
        const { data, error } = await query;
        if (error) console.error('Error fetching units for campus:', error);
        else setUnits(data);
    };

    const handleCampusChange = (e) => {
        const campusId = e.target.value;
        setSelectedCampus(campusId);
        if (campusId === 'all') {
            setSelectedCourse('all');
            setSelectedUnit('');
        } else {
            setSelectedCourse('');
            setSelectedUnit('');
        }
    };

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
    };

    const handleUnitChange = (e) => {
        const unitId = e.target.value; 
        setSelectedUnit(unitId); 
    };

    const handleApply = () => {
        onFilterChange({
            campusId: selectedCampus === 'all' ? null : Number(selectedCampus),
            courseId: selectedCourse === 'all' ? null : Number(selectedCourse),
            subjectCode: selectedUnit === 'all' ? null : Number(selectedUnit)
        });
    };

    const isApplyDisabled = selectedCampus === 'all' && selectedCourse === 'all' ? false : !selectedCampus || !selectedCourse;

    return (
        <div className="filters-border">
            <div className="filters-title">Filter by Unit</div>
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
            <div className="filter-section">
                <label className="filter-label">Subject Code</label>
                <select
                    className="filter-input"
                    value={selectedUnit}
                    onChange={handleUnitChange}
                    disabled={!selectedCampus} // Disable if no campus selected
                >
                    <option value="">Select Subject</option>
                    {selectedCampus === 'all' ? (
                        <option value="all">All Subjects</option>
                    ) : (
                        units.map(unit => (
                            <option key={unit.id} value={unit.id}>{unit.code}</option>
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

export default SubjectFilterComponent;
