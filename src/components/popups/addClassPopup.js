import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../../styles/popup.css';

const AddClassPopup = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState('');
    const [classType, setClassType] = useState('');
    const [campuses, setCampuses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState('');

    // Fetch campuses for campus selection
    useEffect(() => {
        const fetchCampuses = async () => {
            const { data, error } = await supabase
                .from('Campuses')
                .select('*');

            if (error) {
                console.error('Error fetching campuses: ', error);
            } else {
                setCampuses(data); // Store fetched campuses
            }
        };

        fetchCampuses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (name.trim() !== '' && capacity.trim() !== '' && classType.trim() !== '' && selectedCampus.trim() !== '') {
            try {
                const { data, error } = await supabase
                    .from('Locations') // Insert into Locations table
                    .insert([{ name, capacity, class_type: classType, campus_id: selectedCampus }])
                    .select();

                if (error) {
                    console.error('Error adding classroom:', error);
                } else {
                    onSubmit(data[0]); // Send the new classroom data to ClassComponent
                }
            } catch (error) {
                console.error('Error adding classroom:', error.message);
            }
            onClose();
        }
    };

    return (
        <div className="popup-container">
            <div className="popup">
                <div className='popup-h2'>Add Classroom</div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Classroom Name:
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter Classroom Name"
                        />
                    </label>

                    <label>
                        Capacity:
                        <input
                            type="number"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            required
                            placeholder="Enter Capacity"
                        />
                    </label>

                    <label>
                        Class Type:
                        <input
                            type="text"
                            value={classType}
                            onChange={(e) => setClassType(e.target.value)}
                            required
                            placeholder="Enter Class Type"
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

export default AddClassPopup;
