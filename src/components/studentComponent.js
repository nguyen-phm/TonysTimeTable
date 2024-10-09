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
                            const studentId = student['StudentID'] || null;
                            const name = student['Student Name'] || null;
                            const university_email = student['University Email'] || null;
                            const courseName = student['Course Name'] || null;
                            const campusName = student['Campus'] ? student['Campus'].trim() : null;

                            if (!validateStudentData({ studentId, name, courseName, campusName })) {
                                console.error('Missing or invalid student data:', { studentId, name, courseName, campusName });
                                continue;
                            }

                            try {
                                const existingStudent = await checkIfStudentExists(studentId);
                                const courseData = await fetchCourseAndCampus(courseName, campusName);

                                if (!courseData) continue;

                                const { courseId, campusId, fetchedCampusName } = courseData;

                                if (!validateCampusName(fetchedCampusName, campusName)) {
                                    console.error(`Campus mismatch: expected ${campusName}, but found ${fetchedCampusName}`);
                                    continue;
                                }

                                const subjectsExist = await checkSubjectsExist(student);
                                if (!subjectsExist) {
                                    console.error(`Aborting adding student ${name}: One or more subjects do not exist.`);
                                    continue;
                                }

                                let studentIdDb;

                                if (existingStudent) {
                                    console.log(`Updating existing student with student_id ${studentId}.`);
                                    studentIdDb = await updateStudent(existingStudent.id, { name, university_email, courseId });
                                } else {
                                    console.log(`Inserting new student with student_id ${studentId}.`);
                                    studentIdDb = await insertStudent({ studentId, name, university_email, courseId });
                                }

                                await insertStudentSubjects(student, studentIdDb);

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

    // Helper function to validate the basic student data
    const validateStudentData = ({ studentId, name, courseName, campusName }) => {
        return studentId && name && courseName && campusName;
    };

    // Helper function to check if the student already exists
    const checkIfStudentExists = async (studentId) => {
        const { data: existingStudentData, error: existingStudentError } = await supabase
            .from('Students')
            .select('*')
            .eq('student_id', studentId)
            .single();

        if (existingStudentError && existingStudentError.code !== 'PGRST116') {
            console.error(`Error checking if student exists for student_id ${studentId}:`, existingStudentError);
            return null;
        }

        return existingStudentData;
    };

    // Helper function to fetch course and campus information
    const fetchCourseAndCampus = async (courseName, campusName) => {
        const { data: courseData, error: courseError } = await supabase
            .from('Courses')
            .select('id, campus_id')
            .eq('name', courseName)
            .single();

        if (courseError || !courseData) {
            console.error(`Error fetching course for ${courseName}:`, courseError);
            return null;
        }

        const { data: campusData, error: campusError } = await supabase
            .from('Campuses')
            .select('name')
            .eq('id', courseData.campus_id)
            .single();

        if (campusError || !campusData) {
            console.error(`Error fetching campus for campus_id ${courseData.campus_id}:`, campusError);
            return null;
        }

        return { courseId: courseData.id, campusId: courseData.campus_id, fetchedCampusName: campusData.name.trim() };
    };

    // Helper function to validate the campus name
    const validateCampusName = (fetchedCampusName, campusName) => {
        return fetchedCampusName.toLowerCase() === campusName.toLowerCase();
    };

    // Helper function to check if all the subjects exist
    const checkSubjectsExist = async (student) => {
        const subjectCodes = Object.keys(student).filter(key => /\d/.test(key)); // Find columns that contain subject codes
        let allSubjectsExist = true;

        for (const subjectCode of subjectCodes) {
            const enrollmentStatus = student[subjectCode];

            if (enrollmentStatus === 'ENRL') {
                const { data: subjectData, error: subjectError } = await supabase
                    .from('Subjects')
                    .select('id')
                    .eq('code', subjectCode)
                    .single();

                if (subjectError || !subjectData) {
                    console.error(`Error: Subject with code ${subjectCode} does not exist.`);
                    allSubjectsExist = false;
                    break;
                }
            }
        }

        return allSubjectsExist;
    };

    // Helper function to insert a new student
    const insertStudent = async ({ studentId, name, university_email, courseId }) => {
        const { data: studentData, error: studentError } = await supabase
            .from('Students')
            .insert([{ student_id: studentId, name, university_email, course_id: courseId }])
            .select();

        if (studentError) {
            console.error(`Error inserting student ${name}:`, studentError);
            return null;
        }

        return studentData[0].id;
    };

    // Helper function to update an existing student
    const updateStudent = async (studentIdDb, { name, university_email, courseId }) => {
        const { data: updatedStudentData, error: updateError } = await supabase
            .from('Students')
            .update({ name, university_email, course_id: courseId })
            .eq('id', studentIdDb)
            .select();

        if (updateError) {
            console.error(`Error updating student with id ${studentIdDb}:`, updateError);
            return null;
        }

        return updatedStudentData[0].id;
    };

    // Helper function to insert subjects for the student
    const insertStudentSubjects = async (student, studentIdDb) => {
        const subjectCodes = Object.keys(student).filter(key => /\d/.test(key));

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
                    .insert([{ student_id: studentIdDb, subject_id: subjectId }]);

                if (studentSubjectError) {
                    console.error(`Error inserting into StudentSubject for subject ${subjectCode}:`, studentSubjectError);
                } else {
                    console.log(`Inserted student into StudentSubject for subject ${subjectCode}`);
                }
            }
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

    const updateStudentList = (updatedStudent) => {
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
                    onSubmit={updateStudentList}
                />
            )}
        </div>
    );
};

export default StudentComponent;
