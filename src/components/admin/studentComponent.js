import React, { useState, useEffect } from 'react';
import AddStudentPopup from '../popups/addStudentPopup'; 
import EditStudentPopup from '../popups/editStudentPopup'; 
import RemovePopup from '../popups/removePopup';
import ErrorPopup from '../popups/errorPopup'; 
import { supabase } from '../../utils/supabaseClient';
import { handleFileUpload } from '../../utils/csvFileHandle'; 
import '../../styles/adminPage.css';
import '../../styles/courseComponent.css';

const StudentComponent = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showStudentPopup, setShowStudentPopup] = useState(false);
    const [showEditStudentPopup, setShowEditStudentPopup] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false); 
    const [errorMessages, setErrorMessages] = useState([]); 
    const [showRemovePopup, setShowRemovePopup] = useState(false);

    // Fetch student from Supabase when the component mounts
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('Students')
                    .select(`
                        id,
                        student_id,
                        name,
                        university_email,
                        course_id,
                        Courses (
                            name,
                            campus_id,
                            Campuses (
                                name
                            )
                        )
                    `);

                if (error) {
                    console.error('Error fetching students:', error);
                } else {
                    setStudents(data);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, []);

    // Adds student data to state
    const addStudent = (studentData) => {
        setStudents(prevStudents => [...prevStudents, studentData]);
    };

    // Updates students on page
    const updateStudentList = (updatedStudent) => {
        setStudents((prevStudents) => 
            prevStudents.map((student) => 
                student.id === updatedStudent.id ? updatedStudent : student
            )
        );
    };

    // Handle updates from CSV upload
    const handleStudentsUpdated = (student) => {
        setStudents(prevStudents => {
            const existingIndex = prevStudents.findIndex(s => s.student_id === student.student_id);
            if (existingIndex !== -1) {
                // Update existing student
                return prevStudents.map(s => (s.student_id === student.student_id ? student : s));
            } else {
                // Add new student
                return [...prevStudents, student];
            }
        });
    };

    // Gets CSV file on button click
    const handleUploadButtonClick = () => {
        document.getElementById('file-input').click();
    };

    // Handles student removal from database
    const handleDeleteStudent = async (studentId) => {
        try {
            const { error: joinTableError } = await supabase
                .from('StudentSubject') 
                .delete()
                .eq('student_id', studentId);   
    
            if (joinTableError) {
                console.error('Error deleting from join table:', joinTableError);
                return;
            }
    
            const { error: studentError } = await supabase
                .from('Students')
                .delete()
                .eq('id', studentId);
    
            if (studentError) {
                console.error('Error deleting student:', studentError);
            } else {
                setStudents(students.filter((student) => student.id !== studentId));
            }
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };
    
    // Popup Handling
    const handleEditStudent = (student) => {
        setSelectedStudent(student); 
        setShowEditStudentPopup(true); 
    };

    const closeErrorPopup = () => {
        setShowErrorPopup(false);
        setErrorMessages([]); 
    };

    const handleConfirmRemove = async () => {
        if (selectedStudent) {
            await handleDeleteStudent(selectedStudent.id);
            setShowRemovePopup(false);
        }
    };

    const handleRemoveClick = (student) => {
        setSelectedStudent(student);
        setShowRemovePopup(true);
    };

    return (
        <div className="admin-section">
            {isLoading ? (
                <div className='courses-list'>   
                    <div className='course-row'>
                        <p>Loading Students</p>
                    </div>
                </div>
            ) : (
                <div className="courses-list">
                    {students.map((student, index) => (
                        <div key={index} className="course-row">
                            <div className="course-info">
                                <div className="course-name">{student.name}</div>
                                <div className='course-details'>
                                    <div className="course-code">{student.student_id}</div>
                                    <div className="course-code">{student.Courses?.name || 'No Course'}</div>
                                    <div className="course-code">{student.Courses?.Campuses?.name || 'No Campus'}</div>
                                </div>
                            </div>
                            <div className="student-actions">
                                <button className="more-options" onClick={() => handleEditStudent(student)}>Edit</button>
                                <button className="more-options" onClick={() => handleRemoveClick(student)}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <br />

            <button className='more-options' type="button" onClick={() => setShowStudentPopup(true)}>
                Add Student
            </button>

            <button className='more-options' type="button" onClick={handleUploadButtonClick}>
                Upload CSV
            </button>

            <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={(event) => handleFileUpload(event, setErrorMessages, setShowErrorPopup, handleStudentsUpdated)}
                style={{ display: 'none' }} 
            />

            {showStudentPopup && (
                <AddStudentPopup
                    onClose={() => setShowStudentPopup(false)}
                    onSubmit={addStudent}
                />
            )}

            {showEditStudentPopup && selectedStudent && (
                <EditStudentPopup
                    student={selectedStudent}
                    onClose={() => setShowEditStudentPopup(false)}
                    onSubmit={updateStudentList}
                />
            )}

            {showErrorPopup && (
                <ErrorPopup
                    errors={errorMessages}
                    onClose={closeErrorPopup}
                />
            )}

            {showRemovePopup && selectedStudent && (
                <RemovePopup
                    onClose={() => setShowRemovePopup(false)}
                    onConfirm={handleConfirmRemove}
                />
            )}
        </div>
    );
};

export default StudentComponent;



