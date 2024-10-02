import React, { useState, useEffect } from 'react';
import { supabase } from '.././supabaseClient'; 
import '../../styles/popup.css'; 

const AddSubjectPopup = ({ onClose, onSubmit }) => {
    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState(''); // Enum: 'NULL', 'ONE', 'TWO'

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

    const insertSubjectToSupabase = async (subjectName, subjectCode, year, semester) => {
        try {
            const { data, error } = await supabase
                .from('Subjects') // Ensure this table is correctly named
                .insert([
                    {
                        name: subjectName,
                        code: subjectCode,
                        year: year,
                        semester: semester, // Using the enum value for semester
                    },
                ])
                .select();
    
            if (error) {
                console.error('Error inserting subject: ', error);
            } else {
                console.log('Subject added: ', data);
            }

        } catch (error) {
            console.error('Error inserting subject to Supabase: ', error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (subjectName.trim() !== '' && subjectCode.trim() !== '' && year.trim() !== '' && semester !== '') {
            await insertSubjectToSupabase(subjectName, subjectCode, year, semester); // Pass all values to Supabase
            onSubmit(subjectName); // Pass the subject name to the parent component (if necessary)
            setSubjectName(''); 
            setSubjectCode(''); 
            setYear('');
            setSemester('');
            onClose(); 
        }
    };
    
    return (
        <div className="popup-container">
            <div className="popup">
                <h2>Add a New Subject</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Subject Name:
                        <input
                            type="text"
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Subject Code:
                        <input
                            type="text"
                            value={subjectCode}
                            onChange={(e) => setSubjectCode(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Year:
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Semester:
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            required
                        >
                            <option value="">Select Semester</option>
                            <option value="NULL">None</option>
                            <option value="ONE">One</option>
                            <option value="TWO">Two</option>
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
