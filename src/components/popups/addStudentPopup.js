import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../../styles/popup.css';

const AddStudentPopup = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(''); // Selected course
    const [courses, setCourses] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(''); // Selected subject
    const [subjects, setSubjects] = useState([]); // Subjects for the selected course

    // Fetch the courses from the database
    useEffect(() => {
        const fetchCourses = async () => {
            const { data, error } = await supabase.from('Courses').select('*');

            if (error) {
                console.error('Error fetching courses:', error);
            } else {
                setCourses(data);
            }
        };

        fetchCourses();
    }, []);

    // Fetch subjects when a course is selected
    useEffect(() => {
        const fetchSubjects = async () => {
            if (selectedCourse) {
                const { data, error } = await supabase
                    .from('Subjects') // Assuming the table is "Subjects"
                    .select('*')
                    .eq('course_id', selectedCourse); // Filter subjects by selected course

                if (error) {
                    console.error('Error fetching subjects:', error);
                } else {
                    setSubjects(data);
                }
            }
        };

        fetchSubjects();
    }, [selectedCourse]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name.trim() !== '' && email.trim() !== '' && selectedCourse !== '' && selectedSubject !== '') {
            try {
                const { data: studentData, error: studentError } = await supabase
                    .from('Students') // Assuming "Students" is the table for students
                    .insert([{ name, university_email: email, course_id: selectedCourse }])
                    .select();

                if (studentError) {
                    console.error('Error adding student:', studentError);
                } else {
                    const studentId = studentData[0].id;

                    // Insert into StudentSubject table
                    const { error: studentSubjectError } = await supabase
                        .from('StudentSubject')
                        .insert([{ student_id: studentId, subject_id: selectedSubject }]);

                    if (studentSubjectError) {
                        console.error('Error adding student-subject relation:', studentSubjectError);
                    } else {
                        console.log('Student added and subject assigned:', studentData);
                        onSubmit(studentData[0]); // Send back the new student to update the state
                    }
                }
            } catch (error) {
                console.error('Error adding student:', error.message);
            }
            onClose();
        }
    };

    return (
        <div className="popup-container">
            <div className="popup">
                <div className='popup-h2'>Add New Student</div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter Student Name"
                        />
                    </label>

                    <label>
                        Email:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter Student Email"
                        />
                    </label>

                    <label>
                        Select Course:
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            required
                        >
                            <option disabled hidden value="">Select a course</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    {selectedCourse && (
                        <label>
                            Select Subject:
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                required
                            >
                                <option disabled hidden value="">Select a subject</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <div className="popup-buttons">
                        <button type="submit">Submit</button>
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudentPopup;
