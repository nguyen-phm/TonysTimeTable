import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import EditSubjectClassPopup from './popups/editSubjectClassPopup'; // Import the new popup
import '../styles/adminPage.css';

const SubjectListComponent = () => {
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);

    useEffect(() => {
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
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    const handleEditSubject = (subject) => {
        setSelectedSubject(subject);
        setShowEditPopup(true);
    };

    return (
        <div className="admin-section">
            {isLoading ? (
                <div className="courses-list">
                    <div className="course-row">
                        <p>Loading Subjects...</p>
                    </div>
                </div>
            ) : (
                <div className="courses-list">
                    {subjects.map((subject, index) => (
                        <div key={index} className="course-row">
                            <div className="course-info">
                                <div className="course-name">{subject.name}</div>
                                <div className="course-code">{subject.code}</div>
                            </div>
                            <div className="subject-actions">
                                <button className="more-options" onClick={() => handleEditSubject(subject)}>
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showEditPopup && selectedSubject && (
                <EditSubjectClassPopup
                    subject={selectedSubject}
                    onClose={() => setShowEditPopup(false)}
                />
            )}
        </div>
    );
};

export default SubjectListComponent;
