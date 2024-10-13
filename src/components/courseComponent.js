import React, { useState, useEffect } from 'react';
import AddCoursePopup from './popups/addCoursePopup'; 
import EditCoursePopup from './popups/editCoursePopup'; 
import { supabase } from './supabaseClient';
import '../styles/adminPage.css';

const CourseComponent = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddCoursePopup, setShowAddCoursePopup] = useState(false);
    const [showEditCoursePopup, setShowEditCoursePopup] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null); 

    // Fetch courses from Supabase when the component mounts
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('Courses')
                    .select('*');

                if (error) {
                    console.error('Error fetching courses:', error);
                } else {
                    setCourses(data); 
                }
            } finally {
                setIsLoading(false); 
            }
        };

        fetchCourses();
    }, []);

    const addCourse = (newCourse) => {
        setCourses([...courses, newCourse]); 
    };

    const handleDeleteCourse = async (courseId) => {
        try {
            const { error: subjectsError } = await supabase
                .from('Subjects')
                .delete()
                .eq('course_id', courseId); 

            if (subjectsError) {
                console.error('Error deleting subjects related to course:', subjectsError);
                return; 
            }

            const { error: deleteError } = await supabase
                .from('Courses')
                .delete()
                .eq('id', courseId);

            if (deleteError) {
                console.error('Error deleting course:', deleteError);
            } else {
                setCourses(courses.filter((course) => course.id !== courseId)); 
            }
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    const handleEditCourse = (course) => {
        setSelectedCourse(course); 
        setShowEditCoursePopup(true); 
    };

    const updateCourse = (updatedCourse) => {
        setCourses(courses.map((course) => (course.id === updatedCourse.id ? updatedCourse : course)));
    };

    return (
        <div className="admin-section">
            {isLoading ? (
                <p>Loading Courses</p>
            ) : (
                <>
                    <div className="courses-list">
                        {courses.map((course, index) => (
                            <div key={index} className="course-row">
                                <div className="course-info">
                                    <div className="course-name">{course.name}</div>
                                    <div className="course-code">{course.course_code}</div>
                                </div>
                                <div className="course-actions">
                                    <button className="more-options" onClick={() => handleEditCourse(course)}>
                                        Edit
                                    </button>
                                    <button className="more-options" onClick={() => handleDeleteCourse(course.id)}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <br />

            <button className="more-options" type="button" onClick={() => setShowAddCoursePopup(true)}>
                Add Course
            </button>

            {showAddCoursePopup && (
                <AddCoursePopup
                    onClose={() => setShowAddCoursePopup(false)}
                    onSubmit={addCourse}
                />
            )}

            {showEditCoursePopup && selectedCourse && (
                <EditCoursePopup
                    course={selectedCourse}
                    onClose={() => setShowEditCoursePopup(false)}
                    onSubmit={updateCourse}
                />
            )}
        </div>
    );
};

export default CourseComponent;