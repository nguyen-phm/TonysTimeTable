import React, { useState, useEffect } from 'react';
import { supabase } from '.././supabaseClient'; 
import '../../styles/popup.css'; 

const AddCoursePopup = ({ onClose, onSubmit }) => {
    const [courseName, setCourseName] = useState('');
    const [campuses, setCampuses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState('');

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

    useEffect(() => {
        const fetchCampuses = async () => {
          const { data, error } = await supabase
            .from('Campuses') 
            .select('*');
    
          if (error) {
            console.error('Error fetching campuses: ', error);
          } else {
            setCampuses(data); 
          }
        };
    
        fetchCampuses(); 
    }, []);

    const insertCourseToSupabase = async (courseName, campusId) => {
        try {
            const { data, error } = await supabase
                .from('Courses') 
                .insert([
                    {
                        name: courseName,
                        campus_id: campusId, 
                    },
                ])
                .select();
    
            if (error) {
                console.error('Error inserting course: ', error);
            } else {
                console.log('Course added: ', data);
            }

        } catch (error) {
            console.error('Error inserting course to Supabase: ', error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (courseName.trim() !== '' && selectedCampus !== '') {
          await insertCourseToSupabase(courseName, selectedCampus); 
          onSubmit(courseName); 
          setCourseName(''); 
          setSelectedCampus(''); 
          onClose(); 
        }
    };
    
    return (
        <div className="popup-container">
            <div className="popup">
                <div className='popup-h2'>Add a New Course</div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Course Name:
                        <input
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            required
                        />
                    </label>
    
                    <label>
                         Select Campus:
                        <select
                            value={selectedCampus}
                            onChange={(e) => setSelectedCampus(e.target.value)}
                            required
                        >
                            <option value="" disabled hidden className="placeholder-option">Select a Campus</option>
                            {campuses.map((campus) => (
                                <option key={campus.id} value={campus.id}>
                                    {campus.name}
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
    
export default AddCoursePopup;
