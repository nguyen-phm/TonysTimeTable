import React, { useState, useEffect } from 'react';
import { supabase } from '.././supabaseClient'; 
import '../../styles/popup.css'; 

const AddSubjectPopup = ({ onClose, onSubmit }) => {
    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState(''); 
    const [courses, setCourses] = useState([]); // To store the fetched courses
    const [selectedCourse, setSelectedCourse] = useState(''); // To store the selected course ID

    // Fetch the courses when the component mounts
    useEffect(() => {
        const fetchCourses = async () => {
            const { data, error } = await supabase
                .from('Courses') 
                .select('*'); 

            if (error) {
                console.error('Error fetching courses:', error);
            } else {
                setCourses(data); 
            }
        };

        fetchCourses(); 
    }, []);

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

    const insertSubjectToSupabase = async (subjectName, subjectCode, year, semester, courseId) => {
        try {
            const { data, error } = await supabase
                .from('Subjects') 
                .insert([
                    {
                        name: subjectName,
                        code: subjectCode,
                        year: year,
                        semester: semester, 
                        course_id: courseId, 
                    },
                ])
                .select();
    
            if (error) {
                console.error('Error inserting subject: ', error);
            } else {
                console.log('Subject added: ', data);
            }

        } catch (error) {
            console.error('Error inserting subject to Supabase:', error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            subjectName.trim() !== '' &&
            subjectCode.trim() !== '' &&
            year.trim() !== '' &&
            semester !== '' &&
            selectedCourse !== ''
        ) {
            await insertSubjectToSupabase(subjectName, subjectCode, year, semester, selectedCourse); 
            onSubmit(subjectName); 
            setSubjectName('');
            setSubjectCode('');
            setYear('');
            setSemester('');
            setSelectedCourse('');
            onClose();
        }
    };
    
    return (
        <div className="popup-container">
            <div className="popup">
                <div className='popup-h2'>Add New Subject</div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Subject Name:
                        <input
                            type="text"
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            required
                            placeholder="Enter Subject Name"
                        />
                    </label>

                    <label>
                        Subject Code:
                        <input
                            type="text"
                            value={subjectCode}
                            onChange={(e) => setSubjectCode(e.target.value)}
                            required
                            placeholder="Enter Subject Code"
                        />
                    </label>

                    <label>
                        Year:
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            required
                            placeholder='Enter Year'
                        />
                    </label>

                    <label>
                        Semester:
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            required
                            placeholder='Select Semester'
                        >
                            <option value="" disabled hidden className="placeholder-option">Select Semester</option>
                            <option value="ONE">One</option>
                            <option value="TWO">Two</option>
                        </select>
                    </label>

                    <label>
                        Select Course:
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

export default AddSubjectPopup;
