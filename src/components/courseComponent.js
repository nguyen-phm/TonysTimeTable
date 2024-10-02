import React, { useState, useEffect } from 'react';
import AddCoursePopup from './popups/addCoursePopup';
import AddSubjectPopup from './popups/addSubjectPopup';
import { supabase } from './supabaseClient';
import '../styles/adminPage.css'; 


//Add loading indicator 
const CourseComponent = () => {
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCoursePopup, setShowCoursePopup] = useState(false);
    const [showSubjectPopup, setShowSubjectPopup] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setIsLoading(true); 
                const { data, error } = await supabase
                    .from('Subjects') 
                    .select('*'); 

                if (error) {
                    console.error('Error fetching subjects:', error);
                } else {
                    setSubjects(data); 
                }
            } finally {
                setIsLoading(false); 
            }
        };

        fetchSubjects(); 
    }, []);

    const addCourse = (courseName) => {
        setCourses([...courses, courseName]);
    };

    const addSubject = (subjectName) => {
        setSubjects([...subjects, subjectName]);
    };

    return (
        <div className="admin-section">
            <h2>Courses</h2>

            {isLoading ? (
                <p>Loading courses and subjects...</p>
            ) : (
                <>
                    <ul>
                        {courses.map((course) => (
                            <li key={course.id}>{course}</li>
                        ))}
                    </ul>

                    <ul>
                        {subjects.map((subject) => (
                            <li key={subject.id}>
                                {subject.name} - {subject.code} ({subject.year}, {subject.semester})
                            </li>
                        ))}
                    </ul>
                </>
            )}

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