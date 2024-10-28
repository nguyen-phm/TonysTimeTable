import React, { useState, useEffect } from 'react';
import AddCoursePopup from '../popups/addCoursePopup';
import EditCoursePopup from '../popups/editCoursePopup';
import RemovePopup from '../popups/removePopup'; // Import RemovePopup
import { supabase } from '../../utils/supabaseClient';
import '../../styles/adminPage.css';

const CourseComponent = () => {
    const [courses, setCourses] = useState([]);
    const [campuses, setCampuses] = useState([]); // Store campus data
    const [isLoading, setIsLoading] = useState(true);
    const [showAddCoursePopup, setShowAddCoursePopup] = useState(false);
    const [showEditCoursePopup, setShowEditCoursePopup] = useState(false);
    const [showRemovePopup, setShowRemovePopup] = useState(false); // Control remove popup
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseToRemove, setCourseToRemove] = useState(null); // Store the course to be removed

    // Fetch courses and campuses from Supabase when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch courses
                const { data: coursesData, error: coursesError } = await supabase
                    .from('Courses')
                    .select('*');

                if (coursesError) {
                    console.error('Error fetching courses:', coursesError);
                }

                // Fetch campuses
                const { data: campusesData, error: campusesError } = await supabase
                    .from('Campuses')
                    .select('*');

                if (campusesError) {
                    console.error('Error fetching campuses:', campusesError);
                }

                // Store the courses and campuses data
                setCourses(coursesData || []);
                setCampuses(campusesData || []);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const addCourse = (newCourse) => {
        setCourses([...courses, newCourse]); // Add new course to the list
    };

    const handleDeleteCourse = async (courseId) => {
        try {
            // Step 1: Remove any subjects associated with this course
            const { error: subjectsError } = await supabase
                .from('Subjects')
                .delete()
                .eq('course_id', courseId); // Delete subjects where course_id matches

            if (subjectsError) {
                console.error('Error deleting subjects related to course:', subjectsError);
                return;
            }

            // Step 2: Delete the course record
            const { error: deleteError } = await supabase
                .from('Courses')
                .delete()
                .eq('id', courseId);

            if (deleteError) {
                console.error('Error deleting course:', deleteError);
            } else {
                setCourses(courses.filter((course) => course.id !== courseId)); // Remove course from the list
            }
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    const handleEditCourse = (course) => {
        setSelectedCourse(course); // Store the selected course
        setShowEditCoursePopup(true); // Show the edit popup
    };

    const updateCourse = (updatedCourse) => {
        setCourses(courses.map((course) => (course.id === updatedCourse.id ? updatedCourse : course)));
    };

    // Find campus name by campus_id
    const getCampusName = (campusId) => {
        const campus = campuses.find((campus) => campus.id === campusId);
        return campus ? campus.name : 'Unknown Campus'; // Return the campus name or 'Unknown'
    };

    // Show remove popup and set course to be removed
    const handleRemoveClick = (course) => {
        setCourseToRemove(course);
        setShowRemovePopup(true); // Show remove confirmation popup
    };

    // Confirm deletion from RemovePopup
    const confirmRemoveCourse = () => {
        handleDeleteCourse(courseToRemove.id); // Delete the course
        setShowRemovePopup(false); // Close the popup after deletion
    };

    return (
        <div className="admin-section">
            {isLoading ? (
                <div className='courses-list'>   
                    <div className='course-row'>
                        <p>Loading Courses</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="courses-list">
                        {courses.map((course, index) => (
                            <div key={index} className="course-row">
                                <div className="course-info">
                                    <div className="course-name">{course.name}</div>
                                    <div className='course-details'>    
                                        <div className="course-code">{course.course_code || 'No Code'}</div>
                                        <div className="course-code">{getCampusName(course.campus_id)}</div> 
                                    </div>
                                </div>
                                <div className="course-actions">
                                    <button className="more-options" onClick={() => handleEditCourse(course)}>
                                        Edit
                                    </button>
                                    <button className="more-options" onClick={() => handleRemoveClick(course)}>
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

            {showRemovePopup && (
                <RemovePopup
                    onClose={() => setShowRemovePopup(false)}
                    onConfirm={confirmRemoveCourse}
                />
            )}
        </div>
    );
};

export default CourseComponent;
