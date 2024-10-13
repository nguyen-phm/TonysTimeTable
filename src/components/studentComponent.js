import React, { useState, useEffect } from 'react';
import AddStudentPopup from './popups/addStudentPopup'; 
import EditStudentPopup from './popups/editStudentPopup'; 
import ErrorPopup from './popups/errorPopup'; 
import { supabase } from './supabaseClient';
import {
    handleFileUpload
} from './csvFileHandle'; 
import '../styles/adminPage.css';
import '../styles/courseComponent.css';

const StudentComponent = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showStudentPopup, setShowStudentPopup] = useState(false);
    const [showEditStudentPopup, setShowEditStudentPopup] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false); 
    const [errorMessages, setErrorMessages] = useState([]); 

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

    const addStudent = (studentData) => {
        setStudents(prevStudents => [...prevStudents, studentData]);
    };

    const updateStudentList = (updatedStudent) => {
        setStudents((prevStudents) => 
            prevStudents.map((student) => 
                student.id === updatedStudent.id ? updatedStudent : student
            )
        );
    };

    const handleUploadButtonClick = () => {
        document.getElementById('file-input').click();
    };

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
    
    const handleEditStudent = (student) => {
        setSelectedStudent(student); 
        setShowEditStudentPopup(true); 
    };

    const closeErrorPopup = () => {
        setShowErrorPopup(false);
        setErrorMessages([]); 
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
                <>
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
                                    <button className="more-options" onClick={() => handleDeleteStudent(student.id)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
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
                onChange={(event) => handleFileUpload(event, setErrorMessages, setShowErrorPopup)}
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
        </div>
    );
};

export default StudentComponent;

