import React, { useState, useEffect } from 'react';
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

    const updateStudent = (updatedStudent) => {
        setStudents(students.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)));
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
                                    <div className="course-name">{student.name}</div>
                                    <div className="course-code">{student.university_email}</div>
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
