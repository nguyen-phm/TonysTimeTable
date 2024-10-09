import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MultiSelect } from 'primereact/multiselect';
import '../../styles/popup.css';

const EditStudentPopup = ({ student, onClose, onSubmit }) => {
    const [name, setName] = useState(student.name);
    const [email, setEmail] = useState(student.university_email);
    const [selectedCourse, setSelectedCourse] = useState(student.course_id);
    const [studentId, setStudentId] = useState(student.student_id); // New state for student ID
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]); // Store selected subjects

    // Add an event listener to handle "Escape" key press
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    // Fetch the courses and subjects from the database
    useEffect(() => {
        const fetchCoursesAndSubjects = async () => {
            // Fetch courses
            const { data: coursesData, error: coursesError } = await supabase
                .from('Courses')
                .select('*');

            if (coursesError) {
                console.error('Error fetching courses:', coursesError);
            } else {
                setCourses(coursesData);
            }

            // Fetch all subjects
            const { data: subjectsData, error: subjectsError } = await supabase
                .from('Subjects')
                .select('*');

            if (subjectsError) {
                console.error('Error fetching subjects:', subjectsError);
            } else {
                setSubjects(subjectsData);
            }

            // Fetch the subjects the student is already enrolled in
            const { data: studentSubjectsData, error: studentSubjectsError } = await supabase
                .from('StudentSubject')
                .select('subject_id')
                .eq('student_id', student.id);

            if (studentSubjectsError) {
                console.error('Error fetching student subjects:', studentSubjectsError);
            } else {
                // Pre-fill the multi-select with the subject IDs the student is currently enrolled in
                const prefilledSubjects = studentSubjectsData.map((ss) => ss.subject_id);
                setSelectedSubjects(prefilledSubjects); // Set selected subjects by ID
            }
        };

        fetchCoursesAndSubjects();
    }, [student.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure the student ID is valid (4 digits)
        if (!/^\d{4}$/.test(studentId)) {
            alert('Please enter a valid 4-digit Student ID.');
            return;
        }

        if (name.trim() !== '' && email.trim() !== '' && selectedCourse !== '' && selectedSubjects.length > 0) {
            try {
                // Step 1: Update the student's basic info including the student ID
                const { data, error } = await supabase
                    .from('Students')
                    .update({ name, university_email: email, course_id: selectedCourse, student_id: studentId }) // Include student_id in the update
                    .eq('id', student.id)
                    .select();

                if (error) {
                    console.error('Error updating student:', error);
                } else {
                    console.log('Student updated:', data);

                    // Step 2: Delete the existing subjects from StudentSubject
                    const { error: deleteError } = await supabase
                        .from('StudentSubject')
                        .delete()
                        .eq('student_id', student.id);

                    if (deleteError) {
                        console.error('Error deleting student subjects:', deleteError);
                    } else {
                        // Step 3: Insert the updated subjects into StudentSubject
                        const subjectEntries = selectedSubjects.map((subjectId) => ({
                            student_id: student.id,
                            subject_id: subjectId,
                        }));

                        const { error: insertError } = await supabase
                            .from('StudentSubject')
                            .insert(subjectEntries);

                        if (insertError) {
                            console.error('Error inserting student subjects:', insertError);
                        } else {
                            console.log('Student subjects updated successfully');
                            onSubmit(data[0]); // Send the updated student data back
                        }
                    }
                }
            } catch (error) {
                console.error('Error updating student:', error.message);
            }
            onClose();
        }
    };

    return (
        <div className="popup-container">
            <div className="popup">
                <div className='popup-h2'>Edit Student</div>
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

                    {/* New field for Student ID */}
                    <label>
                        Student ID:
                        <input
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            required
                            placeholder="Enter 4-digit Student ID"
                            maxLength={4} // Restrict input to 4 characters
                            pattern="\d{4}" // Ensure only digits
                            title="Please enter exactly 4 digits"
                        />
                    </label>

                    <label>
                        Course:
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            required
                        >
                            <option value="" disabled hidden className="placeholder-option">Select a Course</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Select Subjects:
                        <MultiSelect
                            value={selectedSubjects} // Should be an array of IDs
                            options={subjects.map((subject) => ({
                                id: subject.id,
                                name: subject.name || 'Unnamed Subject',
                            }))}
                            onChange={(e) => setSelectedSubjects(e.value)} // Update the selected subjects state
                            optionLabel="name"
                            optionValue="id" // Ensure the value matches subject.id
                            placeholder="Select subjects"
                            display="chip"
                            filter
                            className="multiselect-custom"
                        />
                    </label>

                    <div className="popup-buttons">
                        <button type="submit">Save</button>
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStudentPopup;
