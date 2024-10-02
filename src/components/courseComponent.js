import React, { useState } from 'react';
import AddCoursePopup from './popups/addCoursePopup';
import AddSubjectPopup from './popups/addSubjectPopup';
import '../styles/adminPage.css'; 

const CourseComponent = () => {
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [showCoursePopup, setShowCoursePopup] = useState(false);
    const [showSubjectPopup, setShowSubjectPopup] = useState(false);

    // Handle adding a course
    const addCourse = (courseName) => {
        setCourses([...courses, courseName]);
    };

    const addSubject = (subjectName) => {
        setSubjects([...subjects, subjectName]);
    };

    return (
        <div className="admin-section">
            <h2>Courses</h2>

            <ul>
                {courses.map((course) => (
                    <li key={course.id}>{course}</li>
                ))}
            </ul>

            <ul>
                {subjects.map((subject) => (
                    <li key={subject.id}>{subject}</li>
                ))}
            </ul>

            <button type="button" onClick={() => setShowCoursePopup(true)}>
                Add Course
            </button>

            {showCoursePopup && (
                <AddCoursePopup
                    onClose={() => setShowCoursePopup(false)}
                    onSubmit={addCourse}
                />
            )}

            <button type="button" onClick={() => setShowSubjectPopup(true)}>
                Add Subject
            </button>

            {showSubjectPopup && (
                <AddSubjectPopup
                    onClose={() => setShowSubjectPopup(false)}
                    onSubmit={addSubject}
                />
            )}
        </div>
    );
};

export default CourseComponent;