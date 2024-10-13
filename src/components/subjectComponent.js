import React, { useState, useEffect } from 'react';
import AddCoursePopup from './popups/addCoursePopup';
import AddSubjectPopup from './popups/addSubjectPopup';
import EditSubjectPopup from './popups/editSubjectPopup'; // Import EditSubjectPopup
import { supabase } from './supabaseClient';
import '../styles/adminPage.css';
import '../styles/courseComponent.css';

const CourseComponent = () => {
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSubjectPopup, setShowSubjectPopup] = useState(false);
    const [showEditSubjectPopup, setShowEditSubjectPopup] = useState(false); 
    const [selectedSubject, setSelectedSubject] = useState(null); 

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

    const addSubject = async (subjectData) => {
        try {
            const { data, error } = await supabase
                .from('Subjects')
                .insert([subjectData])
                .select();

            if (error) {
                console.error('Error adding subject:', error);
            } else if (data && data.length > 0) {
                // Use functional form to ensure state is correctly updated
                setSubjects((prevSubjects) => [...prevSubjects, data[0]]);
            }
        } catch (error) {
            console.error('Error adding subject:', error);
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        try {
            const { error: subjectRelationError } = await supabase
                .from('StudentSubject')
                .delete()
                .eq('subject_id', subjectId);
    
            if (subjectRelationError) {
                console.error('Error deleting from StudentSubject:', subjectRelationError);
                return;
            }

            const { error: classesError } = await supabase
                .from('Classes')
                .delete()
                .eq('subject_id', subjectId);

            if (classesError) {
                console.error('Error deleting classes related to subject:', classesError);
                return; 
            }
    
            const { error: subjectError } = await supabase
                .from('Subjects')
                .delete()
                .eq('id', subjectId);
    
            if (subjectError) {
                console.error('Error deleting subject:', subjectError);
            } else {
                setSubjects(subjects.filter((subject) => subject.id !== subjectId));
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
        }
    };

    const handleEditSubject = (subject) => {
        setSelectedSubject(subject);
        setShowEditSubjectPopup(true);
    };

    const updateSubject = (updatedSubject) => {
        setSubjects(subjects.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)));
    };

    return (
        <div className="admin-section">

            {isLoading ? (
                <div className='courses-list'>   
                    <div className='course-row'>
                        <p>Loading Subjects</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="courses-list">
                        {subjects.map((subject, index) => (
                            <div key={index} className="course-row">
                                <div className="course-info">
                                    <div className="course-name">{subject.name}</div>
                                    <div className="course-code">{subject.code}</div>
                                </div>
                                <div className="subject-actions">
                                    <button className="more-options" onClick={() => handleEditSubject(subject)}>Edit</button>
                                    <button className="more-options" onClick={() => handleDeleteSubject(subject.id)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <br />

            <button className='more-options' type="button" onClick={() => setShowSubjectPopup(true)}>
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