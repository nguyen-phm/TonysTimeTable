import React, { useState, useEffect } from 'react';
import AddCoursePopup from './popups/addCoursePopup';
import EditCoursePopup from './popups/editCoursePopup';
import { supabase } from './supabaseClient';
import '../styles/adminPage.css';

const CourseComponent = ({ filters }) => {
    const [courses, setCourses] = useState([]);
    const [campuses, setCampuses] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [filtered_course, setFilteredCourses] = useState([]);
    const [showAddCoursePopup, setShowAddCoursePopup] = useState(false);
    const [showEditCoursePopup, setShowEditCoursePopup] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

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

    useEffect(() => {
        const filtered_course = courses.filter(courses => {
            const matchesCourse = filters.courseId? courses.id === filters.courseId : true;
            // console.log("Matches Course: ",matchesCourse)
            // console.log("Filters.courseID: ", filters.courseId)
            // console.log("courses.id: ", courses.id)
            return matchesCourse
        });


        setFilteredCourses(filtered_course); // Set filtered subjects to a new state

    }, [filters, courses]); // Update when filters or subjects change


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
                        {filtered_course.map((course, index) => (
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