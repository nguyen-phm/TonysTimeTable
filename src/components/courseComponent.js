import React, { useState, useEffect } from 'react';
import AddCoursePopup from './popups/addCoursePopup';
import AddSubjectPopup from './popups/addSubjectPopup';
import EditSubjectPopup from './popups/editSubjectPopup'; // Import EditSubjectPopup
import { supabase } from './supabaseClient';
import '../styles/adminPage.css';

const CourseComponent = () => {
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCoursePopup, setShowCoursePopup] = useState(false);
    const [showSubjectPopup, setShowSubjectPopup] = useState(false);
    const [showEditSubjectPopup, setShowEditSubjectPopup] = useState(false); // For editing subjects
    const [selectedSubject, setSelectedSubject] = useState(null); // Store the selected subject for editing

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

        const fetchSubjects = async () => {
            try {
                const { data, error } = await supabase
                    .from('Subjects')
                    .select('*');

                if (error) {
                    console.error('Error fetching subjects:', error);
                } else {
                    setSubjects(data);
                }
            } catch (error) {
                console.error('Error fetching subjects:', error);
            }
        };

        fetchCourses();
        fetchSubjects();
    }, []);

    const addCourse = (courseName) => {
        setCourses([...courses, courseName]);
    };

    const addSubject = async (subjectData) => {
        try {
            const { data, error } = await supabase
                .from('Subjects')
                .insert([subjectData])
                .select();

            if (error) {
                console.error('Error adding subject:', error);
            } else if (data && data.length > 0) {
                setSubjects([...subjects, data[0]]);
            }
        } catch (error) {
            console.error('Error adding subject:', error);
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        try {
            const { error } = await supabase
                .from('Subjects')
                .delete()
                .eq('id', subjectId);

            if (error) {
                console.error('Error deleting subject:', error);
            } else {
                setSubjects(subjects.filter((subject) => subject.id !== subjectId));
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
        }
    };

    const handleEditSubject = (subject) => {
        setSelectedSubject(subject); // Store the selected subject for editing
        setShowEditSubjectPopup(true); // Show the edit popup
    };

    const updateSubject = (updatedSubject) => {
        setSubjects(subjects.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)));
    };

    return (
        <div className="admin-section">

            {isLoading ? (
                <p>Loading courses and subjects...</p>
            ) : (
                <>
                    <div className="courses-list">
                        {subjects.map((subject, index) => (
                            <div key={index} className="course-row">
                                <div className="course-info">
                                    <div className="course-name">{subject.name}</div>
                                    <div className="course-code">{subject.code}</div>
                                </div>
                                <div className="course-details">
                                    <div className="delivery-mode">Year: {subject.year}</div>
                                    <div className="campus">Semester: {subject.semester}</div>
                                </div>
                                <div className="subject-actions">
                                    <button className="edit-button" onClick={() => handleEditSubject(subject)}>Edit</button>
                                    <button className="delete-button" onClick={() => handleDeleteSubject(subject.id)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <br />

            <button type="button" onClick={() => setShowCoursePopup(true)}>
                Add Course
            </button>

            {showCoursePopup && (
                <AddCoursePopup
                    onClose={() => setShowCoursePopup(false)}
                    onSubmit={addCourse}
                />
            )}

            <br />

            <button type="button" onClick={() => setShowSubjectPopup(true)}>
                Add Subject
            </button>

            {showSubjectPopup && (
                <AddSubjectPopup
                    onClose={() => setShowSubjectPopup(false)}
                    onSubmit={addSubject}
                />
            )}

            {showEditSubjectPopup && selectedSubject && (
                <EditSubjectPopup
                    subject={selectedSubject}
                    onClose={() => setShowEditSubjectPopup(false)}
                    onSubmit={updateSubject}
                />
            )}
        </div>
    );
};

export default CourseComponent;