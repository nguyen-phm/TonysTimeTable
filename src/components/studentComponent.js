import React, { useState, useEffect } from 'react';
import AddStudentPopup from './popups/addStudentPopup'; // Use the AddStudentPopup
import EditStudentPopup from './popups/editStudentPopup'; // Use the EditStudentPopup
import { supabase } from './supabaseClient';
import '../styles/adminPage.css';

const StudentComponent = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showStudentPopup, setShowStudentPopup] = useState(false);
    const [showEditStudentPopup, setShowEditStudentPopup] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null); // Store the selected student for editing

    // Fetch students from the Supabase database
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('Students') // Assuming "Students" is your table for students
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

    // Add a new student
    const addStudent = (studentData) => {
        setStudents([...students, studentData]); // Add new student to state
    };

    // Delete a student
    const handleDeleteStudent = async (studentId) => {
        try {
            const { error } = await supabase
                .from('Students')
                .delete()
                .eq('id', studentId); // Delete based on student ID

            if (error) {
                console.error('Error deleting student:', error);
            } else {
                setStudents(students.filter((student) => student.id !== studentId));
            }
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    // Open the edit popup for a selected student
    const handleEditStudent = (student) => {
        setSelectedStudent(student); // Store the selected student for editing
        setShowEditStudentPopup(true); // Show the edit popup
    };

    // Update student data after editing
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
                                    <button className="edit-button" onClick={() => handleEditStudent(student)}>Edit</button>
                                    <button className="delete-button" onClick={() => handleDeleteStudent(student.id)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <br />

            <button type="button" onClick={() => setShowStudentPopup(true)}>
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
