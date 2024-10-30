import React, { useState, useEffect } from 'react';
import AddSubjectPopup from './popups/addSubjectPopup';
import EditSubjectPopup from './popups/editSubjectPopup'; 
import { supabase } from './supabaseClient';
import '../styles/adminPage.css';
import '../styles/courseComponent.css';

const SubjectComponent = ({ filters }) => {
    const [courses, setCourses] = useState([]);
    const [campuses, setCampuses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSubjectPopup, setShowSubjectPopup] = useState(false);
    const [showEditSubjectPopup, setShowEditSubjectPopup] = useState(false); 
    const [selectedSubject, setSelectedSubject] = useState(null); 

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
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
                
                // Fetch subjects with campus_name
                const { data: subjectsData, error: subjectsError } = await supabase
                    .from('Subjects')
                    // .select(`
                    //     *,
                    //     Courses (campus_id, Campuses (name))
                    // `);
                    .select(`
                        id, code, name, course_id,
                        Courses!inner (
                            campus_id,
                            Campuses!inner (name)
                        )
                    `);

                if (subjectsError) {
                    console.error('Error fetching subjects:', subjectsError);
                } else {
                    setSubjects(subjectsData.map(subject => ({
                        ...subject,
                        campus_name: subject.Courses?.Campuses?.name // Assign campus_name from nested relation
                    })));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []); // Only run on mount

    useEffect(() => {
        // Filter subjects based on selected filters
        const filtered = subjects.filter(subject => {
            const matchesCourse = filters.courseId ? subject.course_id === filters.courseId : true;
            const matchesSubjectCode = filters.subjectCode ? subject.id === filters.subjectCode : true;
            return matchesCourse &&  matchesSubjectCode;
        });
        setFilteredSubjects(filtered); // Set filtered subjects to a new state
    }, [filters, subjects]); // Update when filters or subjects change

    const getCourseName = (courseId) => {
        const course = courses.find((course) => course.id === courseId);
        return course ? course.name : 'Unknown Course';
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
            // First, delete any related records in StudentSubject
            const { error: subjectRelationError } = await supabase
                .from('StudentSubject')
                .delete()
                .eq('subject_id', subjectId);
    
            if (subjectRelationError) {
                console.error('Error deleting from StudentSubject:', subjectRelationError);
                return;
            }

            // Then delete related records in Classes
            const { error: classesError } = await supabase
                .from('Classes')
                .delete()
                .eq('subject_id', subjectId);

            if (classesError) {
                console.error('Error deleting classes related to subject:', classesError);
                return; 
            }
    
            // Finally, delete the subject itself
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

    const updateSubject = async (updatedSubject) => {
        try {
            const { error } = await supabase
                .from('Subjects')
                .update(updatedSubject)
                .eq('id', updatedSubject.id);

            if (error) {
                console.error('Error updating subject:', error);
            } else {
                setSubjects(subjects.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)));
            }
        } catch (error) {
            console.error('Error updating subject:', error);
        }
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
                        {filteredSubjects.map((subject, index) => (
                            <div key={index} className="course-row">
                                <div className="course-info">
                                    <div className="course-name">{subject.name}</div>
                                    <div className="course-details">
                                        <div className="course-code">{subject.code}</div>
                                        <div className="course-code">{getCourseName(subject.course_id)}</div>
                                        <div className="course-code">{subject.campus_name}</div> {/* Display campus_name */}
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
