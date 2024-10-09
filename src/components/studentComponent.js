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

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
    
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    console.log('Parsed Results: ', results);
    
                    if (results && results.data && results.data.length > 0) {
                        for (const student of results.data) {
                            // Change to match the new CSV column names
                            const studentId = student['StudentID'] || null;
                            const name = student['Student Name'] || null;
                            const university_email = student['University Email'] || null;
                            const courseName = student['Course Name'] || null;
                            const campusName = student['Campus'] ? student['Campus'].trim() : null; // Trim campus name from CSV
    
                            if (!studentId || !name || !courseName || !campusName) {
                                console.error('Missing required student data:', { studentId, name, university_email, courseName, campusName });
                                continue;
                            }
    
                            try {
                                // Step 1: Check if the student already exists in the 'Students' table based on 'student_id'
                                const { data: existingStudentData, error: existingStudentError } = await supabase
                                    .from('Students')
                                    .select('*')
                                    .eq('student_id', studentId)
                                    .single();
    
                                if (existingStudentError && existingStudentError.code !== 'PGRST116') { // Ignore "No Rows Found" error
                                    console.error(`Error checking if student exists for student_id ${studentId}:`, existingStudentError);
                                    continue;
                                }
    
                                // If the student already exists, skip adding the student or update them if necessary
                                if (existingStudentData) {
                                    console.log(`Student with student_id ${studentId} already exists. Skipping insertion or updating...`);
                                    continue; // Skip or implement update logic here if you want to update the existing record
                                }
    
                                // Step 2: Fetch the course along with the campus it is associated with
                                const { data: courseData, error: courseError } = await supabase
                                    .from('Courses')
                                    .select('id, campus_id')
                                    .eq('name', courseName)
                                    .single();
    
                                if (courseError || !courseData) {
                                    console.error(`Error fetching course for ${courseName}:`, courseError);
                                    continue;
                                }
    
                                const courseId = courseData.id;
                                const campusId = courseData.campus_id;
    
                                // Step 3: Fetch the campus name using the campus_id
                                const { data: campusData, error: campusError } = await supabase
                                    .from('Campuses')
                                    .select('name')
                                    .eq('id', campusId)
                                    .single();
    
                                if (campusError || !campusData) {
                                    console.error(`Error fetching campus for campus_id ${campusId}:`, campusError);
                                    continue;
                                }
    
                                const fetchedCampusName = campusData.name.trim(); // Trim the fetched campus name
    
                                // Check if the campus names match case-insensitively
                                if (fetchedCampusName.toLowerCase() !== campusName.toLowerCase()) {
                                    console.error(`Campus mismatch: expected ${campusName}, but found ${fetchedCampusName}`);
                                    continue;
                                }
    
                                // Step 4: Now check for columns that have numbers in the column name (for subjects)
                                const subjectCodes = Object.keys(student).filter(key => /\d/.test(key)); // Check if the key contains numbers
                                let allSubjectsExist = true; // Flag to check if all subjects exist
    
                                for (const subjectCode of subjectCodes) {
                                    const enrollmentStatus = student[subjectCode];
    
                                    if (enrollmentStatus === 'ENRL') {
                                        // Check if the subject exists in the Subjects table
                                        const { data: subjectData, error: subjectError } = await supabase
                                            .from('Subjects')
                                            .select('id')
                                            .eq('code', subjectCode)
                                            .single();
    
                                        if (subjectError || !subjectData) {
                                            console.error(`Error: Subject with code ${subjectCode} does not exist for ${name}.`);
                                            allSubjectsExist = false; // Mark that a subject does not exist
                                            break; // Exit loop if any subject is not found
                                        }
                                    }
                                }
    
                                // If any of the subjects don't exist, skip adding the student
                                if (!allSubjectsExist) {
                                    console.error(`Aborting adding student ${name}: One or more subjects do not exist.`);
                                    continue;
                                }
    
                                // Step 5: If all subjects and course-campus match, insert the student data into the Students table
                                const { data: studentData, error: studentError } = await supabase
                                    .from('Students')
                                    .insert([
                                        {
                                            student_id: studentId, // Insert the 'student_id' from CSV
                                            name,
                                            university_email,
                                            course_id: courseId
                                        }
                                    ])
                                    .select();
    
                                if (studentError) {
                                    console.error(`Error inserting student ${name}:`, studentError);
                                    continue;
                                }
    
                                const studentIdDb = studentData[0].id;
    
                                // Step 6: Insert into the StudentSubject table for each valid subject
                                for (const subjectCode of subjectCodes) {
                                    const enrollmentStatus = student[subjectCode];
    
                                    if (enrollmentStatus === 'ENRL') {
                                        const { data: subjectData } = await supabase
                                            .from('Subjects')
                                            .select('id')
                                            .eq('code', subjectCode)
                                            .single();
    
                                        const subjectId = subjectData.id;
    
                                        const { error: studentSubjectError } = await supabase
                                            .from('StudentSubject')
                                            .insert([
                                                {
                                                    student_id: studentIdDb,
                                                    subject_id: subjectId
                                                }
                                            ]);
    
                                        if (studentSubjectError) {
                                            console.error(`Error inserting into StudentSubject for ${name} and ${subjectCode}:`, studentSubjectError);
                                        } else {
                                            console.log(`Inserted ${name} into StudentSubject for subject ${subjectCode}`);
                                        }
                                    }
                                }
    
                            } catch (error) {
                                console.error('Error processing student:', error);
                            }
                        }
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
