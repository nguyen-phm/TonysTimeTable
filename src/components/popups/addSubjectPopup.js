import React, { useState, useEffect } from 'react';
import { supabase } from '.././supabaseClient'; 
import '../../styles/popup.css'; 

const AddSubjectPopup = ({ onClose, onSubmit }) => {
    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');

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

    const insertSubjectToSupabase = async (subjectName, subjectCode) => {
        try {
            const { data, error } = await supabase
                .from('Subjects') 
                .insert([
                    {
                        name: subjectName,
                        code: subjectCode,
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
        if (subjectName.trim() !== '' && subjectCode.trim() !== '') {
          await insertSubjectToSupabase(subjectName, subjectCode); 
          onSubmit(subjectName); 
          setSubjectName(''); 
          setSubjectCode('');
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