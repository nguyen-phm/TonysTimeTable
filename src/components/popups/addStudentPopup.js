import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../../styles/popup.css';

const AddStudentPopup = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(''); // For selecting a course
    const [courses, setCourses] = useState([]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name.trim() !== '' && email.trim() !== '' && selectedCourse !== '') {
            try {
                const { data, error } = await supabase
                    .from('Students') // Assuming "Students" is the table for students
                    .insert([{ name, university_email: email, course_id: selectedCourse }])
                    .select();

                if (error) {
                    console.error('Error adding student:', error);
                } else {
                    console.log('Student added:', data);
                    onSubmit(data[0]); // Send back the new student to update the state
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
                <h2>Add New Student</h2>
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