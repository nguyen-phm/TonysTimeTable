import React, { useState, useEffect } from 'react';
import AddSubjectPopup from './popups/addSubjectPopup';
import EditSubjectPopup from './popups/editSubjectPopup'; 
import { supabase } from './supabaseClient';
import '../styles/adminPage.css';
import '../styles/courseComponent.css';

const SubjectComponent = () => {
    const [courses, setCourses] = useState([]);
    const [campuses, setCampuses] = useState([]); // To store campuses
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSubjectPopup, setShowSubjectPopup] = useState(false);
    const [showEditSubjectPopup, setShowEditSubjectPopup] = useState(false); 
    const [selectedSubject, setSelectedSubject] = useState(null); 

    // Fetch courses, campuses, and subjects from Supabase
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
                } else {
                    setCourses(coursesData);
                }

                // Fetch campuses
                const { data: campusesData, error: campusesError } = await supabase
                    .from('Campuses')
                    .select('*');

                if (campusesError) {
                    console.error('Error fetching campuses:', campusesError);
                } else {
                    setCampuses(campusesData);
                }

                // Fetch subjects
                const { data: subjectsData, error: subjectsError } = await supabase
                    .from('Subjects')
                    .select('*');

                if (subjectsError) {
                    console.error('Error fetching subjects:', subjectsError);
                } else {
                    setSubjects(subjectsData);
                }

            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Find course name by course_id
    const getCourseName = (courseId) => {
        const course = courses.find((course) => course.id === courseId);
        return course ? course.name : 'Unknown Course';
    };

    // Find campus name by course's campus_id
    const getCampusName = (courseId) => {
        const course = courses.find((course) => course.id === courseId);
        if (course) {
            const campus = campuses.find((campus) => campus.id === course.campus_id);
            return campus ? campus.name : 'Unknown Campus';
        }
        return 'Unknown Campus';
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
                        <p>Loading Units</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="courses-list">
                        {subjects.map((subject, index) => (
                            <div key={index} className="course-row">
                                <div className="course-info">
                                    <div className="course-name">{subject.name}</div>
                                    <div className="course-details">
                                        <div className="course-code">{subject.code}</div>
                                        <div className="course-code">{getCourseName(subject.course_id)}</div>
                                        <div className="course-code">{getCampusName(subject.course_id)}</div>
                                    </div>
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
                Add Unit
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

export default SubjectComponent;
