import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import AddStudentPopup from './popups/addStudentPopup'; 
import EditStudentPopup from './popups/editStudentPopup'; 
import { supabase } from './supabaseClient';
import '../styles/adminPage.css';
import '../styles/courseComponent.css';

const StudentComponent = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showStudentPopup, setShowStudentPopup] = useState(false);
    const [showEditStudentPopup, setShowEditStudentPopup] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null); 

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('Students') 
                    .select('*');

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
        setStudents([...students, studentData]); 
    };

    const handleDeleteStudent = async (studentId) => {
        try {
            const { error } = await supabase
                .from('Students')
                .delete()
                .eq('id', studentId); 

            if (error) {
                console.error('Error deleting student:', error);
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

    const updateStudent = (updatedStudent) => {
        setStudents(students.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)));
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    console.log('Parsed Results: ', results);
                    

                    if(results && results.data && results.data.length > 0){
                        const parsedStudents = results.data.map((student, index) => ({
                            id: index + students.length + 1,
                            studentID: student['StudentID'],
                            name: student['Student Name'],
                            university_email: student['University Email'],
                            personal_email: student['Personal Email'],
                            course: student['Course Name'],
                        }));
                        setStudents([...students, ...parsedStudents]);
                    } else {
                        console.error('Error: Parsed data is not in the expected format.');
                    }
                    
                },
                error: (error) => {
                    console.error('Error parsing CSV file: ', error);
                }
            });
        }
    };

    const handleUploadButtonClick = () => {
        document.getElementById('file-input').click();
    };

    return (
        <div className="admin-section">

            {isLoading ? (
                <p>Loading students...</p>
            ) : (
                <>
                    <div className="courses-list">
                        {students.map((student, index) => (
                            <div key={index} className="course-row">
                                <div className="course-info">
                                    <div className="course-name"><strong>Name:</strong>{student.name}</div>
                                    <div className="course-code"><strong>University Email:</strong>{student.university_email}</div>
                                    <div className="course-code"><strong>Personal Email:</strong>{student.personal_email || 'N/A'}</div>
                                    <div className="course-code"><strong>Student ID:</strong>{student.studentID || 'N/A'}</div>
                                    <div className="course-code"><strong>Course:</strong>{student.course || 'N/A'}</div>
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
                onChange={handleFileUpload}
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
                    onSubmit={updateStudent}
                />
            )}
        </div>
    );
};

export default StudentComponent;
