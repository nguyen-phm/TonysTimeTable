import React, { useState, useEffect } from 'react';
import { MultiSelect } from 'primereact/multiselect'; // Import PrimeReact MultiSelect
import { supabase } from '../supabaseClient';
import '../../styles/popup.css';
import 'primereact/resources/themes/saga-blue/theme.css'; // Import the PrimeReact theme
import 'primereact/resources/primereact.min.css';         // Core CSS for PrimeReact components
import 'primeicons/primeicons.css';       
        

const AddStudentPopup = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [courses, setCourses] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [subjects, setSubjects] = useState([]);

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
    
    // Fetch the courses from the database
    useEffect(() => {
        const fetchCourses = async () => {
            const { data, error } = await supabase.from('Courses').select('*');

            if (error) {
                console.error('Error fetching courses:', error);
            } else {
                setCourses(data || []);
            }
        };

        fetchCourses();
    }, []);

    // Fetch subjects when a course is selected
    useEffect(() => {
        const fetchSubjects = async () => {
            if (selectedCourse) {
                const { data, error } = await supabase
                    .from('Subjects')
                    .select('*')
                    .eq('course_id', selectedCourse);

                if (error) {
                    console.error('Error fetching subjects:', error);
                } else {
                    setSubjects(data || []);
                }
            }
        };

        fetchSubjects();
    }, [selectedCourse]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name.trim() !== '' && email.trim() !== '' && selectedCourse !== '' && selectedSubjects.length > 0) {
            try {
                const { data: studentData, error: studentError } = await supabase
                    .from('Students')
                    .insert([{ name, university_email: email, course_id: selectedCourse }])
                    .select();

                if (studentError) {
                    console.error('Error adding student:', studentError);
                } else {
                    const studentId = studentData[0]?.id;

                    // Insert multiple records into StudentSubject table
                    const studentSubjectEntries = selectedSubjects.map(subject => ({
                        student_id: studentId,
                        subject_id: subject.id // Use the subject ID
                    }));

                    const { error: studentSubjectError } = await supabase
                        .from('StudentSubject')
                        .insert(studentSubjectEntries);

                    if (studentSubjectError) {
                        console.error('Error adding student-subject relations:', studentSubjectError);
                    } else {
                        console.log('Student added and subjects assigned:', studentData);
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
                            {courses?.map((course) => (
                                <option key={course?.id} value={course?.id}>
                                    {course?.name || 'Unnamed Course'}
                                </option>
                            ))}
                        </select>
                    </label>

                    {selectedCourse && (
                        <label>
                            Select Subjects:
                            <MultiSelect
                                value={selectedSubjects}
                                options={subjects.map(subject => ({
                                    id: subject.id,
                                    name: subject.name || 'Unnamed Subject'
                                }))}
                                onChange={(e) => setSelectedSubjects(e.value)}
                                optionLabel="name"  // Display the subject name
                                placeholder="Select subjects"
                                display="chip"
                                filter
                                className="multiselect-custom" // Apply custom styles
                                //virtualScrollerOptions={{itemSize: 40}}
                            />
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


