import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; 
import '../../styles/popup.css'; 

const EditCoursePopup = ({ course, onClose, onSubmit }) => {
    const [courseName, setCourseName] = useState(course.name); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (courseName.trim() !== '') {
            try {
                const { data, error } = await supabase
                    .from('Courses')
                    .update({ name: courseName })
                    .eq('id', course.id)
                    .select();

                if (error) {
                    console.error('Error updating course: ', error);
                } else {
                    console.log('Course updated: ', data);
                    onSubmit(data[0]); 
                }
            } catch (error) {
                console.error('Error updating course: ', error.message);
            }
            onClose();
        }
    };

    return (
        <div className="popup-container">
            <div className="popup">
                <h2>Edit Course</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Course Name:
                        <input
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            required
                            placeholder="Enter Course Name"
                        />
                    </label>
                    <div className="popup-buttons">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCoursePopup;