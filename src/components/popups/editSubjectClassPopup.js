import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../../styles/popup.css';

const EditSubjectClassPopup = ({ subject, onClose }) => {
    const [classes, setClasses] = useState([]);
    const [newClasses, setNewClasses] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [classTypes, setClassTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    // Fetch classes, staff, and class types on component load
    useEffect(() => {
        const fetchClassesAndData = async () => {
            try {
                // Fetch the classes for the subject
                const { data: classesData, error: classesError } = await supabase
                    .from('Classes')
                    .select('*')
                    .eq('subject_id', subject.id);

                if (classesError) {
                    console.error('Error fetching classes:', classesError);
                } else {
                    setClasses(classesData);
                }

                // Fetch the staff list for the staff dropdown
                const { data: staffData, error: staffError } = await supabase
                    .from('Staff')
                    .select('id, name');

                if (staffError) {
                    console.error('Error fetching staff:', staffError);
                } else {
                    setStaffList(staffData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClassesAndData();
    }, [subject.id]);

    // Handle input change for existing classes
    const handleClassChange = (index, field, value) => {
        const updatedClasses = [...classes];
        updatedClasses[index][field] = value;
        setClasses(updatedClasses);
    };

    // Handle input change for new classes
    const handleNewClassChange = (index, field, value) => {
        const updatedNewClasses = [...newClasses];
        updatedNewClasses[index][field] = value;
        setNewClasses(updatedNewClasses);
    };

    // Add a new class input field
    const handleAddClass = () => {
        setNewClasses([
            ...newClasses, 
            { class_type: '', is_online: false, start_time: '', duration_30mins: '', location_id: '', staff_id: '' }
        ]);
    };

    // Remove an existing class
    const handleRemoveClass = async (classId) => {
        try {
            const { error } = await supabase
                .from('Classes')
                .delete()
                .eq('id', classId);

            if (error) {
                console.error('Error removing class:', error);
            } else {
                setClasses(classes.filter((classItem) => classItem.id !== classId));
            }
        } catch (error) {
            console.error('Error removing class:', error);
        }
    };

    // Save all changes to the database on submit
    const handleSubmit = async () => {
        // Update existing classes
        for (const classItem of classes) {
            const { error } = await supabase
                .from('Classes')
                .update({
                    class_type: classItem.class_type, // Make sure class_type is updated based on the value
                    is_online: classItem.is_online,
                    start_time: classItem.start_time,
                    duration_30mins: classItem.duration_30mins,
                    location_id: classItem.location_id,
                    staff_id: classItem.staff_id,
                })
                .eq('id', classItem.id);

            if (error) {
                console.error('Error updating class:', error);
            }
        }

        // Insert new classes
        for (const newClass of newClasses) {
            const { error } = await supabase
                .from('Classes')
                .insert({
                    subject_id: subject.id,
                    ...newClass
                });

            if (error) {
                console.error('Error adding class:', error);
            }
        }

        // Clear the new classes and close the popup
        setNewClasses([]);
        onClose();
    };

    return (
        <div className="popup-container">
            <div className="popup">
                <div className="popup-h2">{subject.code}</div>

                {isLoading ? (
                    <div>Loading classes...</div>
                ) : (
                    <>
                        {classes.length > 0 ? (
                            classes.map((classItem, index) => (
                                <div key={index}>
                                    <div className="flex-container">
                                        <div className="dropdown-container">
                                            <label>
                                                Class Type:
                                                <select
                                                    value={classItem.class_type} 
                                                    onChange={(e) => handleClassChange(index, 'class_type', e.target.value)}
                                                >
                                                    <option value="" disabled hidden className="placeholder-option">Select Class Type</option>
                                                    <option value="Tutorial">Tutorial</option>
                                                    <option value="Lecture">Lecture</option>
                                                    <option value="Practical">Practical</option>
                                                </select>
                                            </label>
                                        </div>

                                        <div className="dropdown-container">
                                            <label>
                                                Staff:
                                                <select
                                                    value={classItem.staff_id}
                                                    onChange={(e) => handleClassChange(index, 'staff_id', e.target.value)}
                                                >
                                                    <option value="" disabled hidden>Select Staff</option>
                                                    {staffList.map((staff) => (
                                                        <option key={staff.id} value={staff.id}>
                                                            {staff.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex-container">
                                        <div className="dropdown-container">
                                            <label>
                                                Duration Hrs:
                                                <input
                                                    type="number"
                                                    value={classItem.duration_30mins}
                                                    onChange={(e) => handleClassChange(index, 'duration_30mins', e.target.value)}
                                                />
                                            </label>
                                        </div>

                                        <div className="dropdown-container">
                                            <label>
                                                Is Online:
                                                <select
                                                    value={classItem.is_online ? 'true' : 'false'}
                                                    onChange={(e) => handleClassChange(index, 'is_online', e.target.value === 'true')}
                                                >
                                                    <option value="true">Yes</option>
                                                    <option value="false">No</option>
                                                </select>
                                            </label>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveClass(classItem.id)}>Remove Class</button>
                                    <hr />
                                </div>
                            ))
                        ) : (
                            <div>This subject currently has no classes.</div>
                        )}

                        {newClasses.map((newClass, index) => (
                            <div key={index}>
                                <div className="flex-container">
                                    <div className="dropdown-container">
                                        <label>Class Type:</label>
                                        <select
                                            value={newClass.class_type}
                                            onChange={(e) => handleNewClassChange(index, 'class_type', e.target.value)}
                                        >
                                            <option value="" disabled hidden className="placeholder-option">Select Class Type</option>
                                            <option value="Tutorial">Tutorial</option>
                                            <option value="Lecture">Lecture</option>
                                            <option value="Practical">Practical</option>
                                        </select>
                                    </div>

                                    <div className="dropdown-container">
                                        <label>Is Online:</label>
                                        <select
                                            value={newClass.is_online ? 'true' : 'false'}
                                            onChange={(e) => handleNewClassChange(index, 'is_online', e.target.value === 'true')}
                                        >
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    </div>
                                </div>

                                <label>Start Time:</label>
                                <input
                                    type="text"
                                    value={newClass.start_time}
                                    onChange={(e) => handleNewClassChange(index, 'start_time', e.target.value)}
                                />

                                <label>Duration (in 30-minute intervals):</label>
                                <input
                                    type="number"
                                    value={newClass.duration_30mins}
                                    onChange={(e) => handleNewClassChange(index, 'duration_30mins', e.target.value)}
                                />

                                <label>Location ID:</label>
                                <input
                                    type="text"
                                    value={newClass.location_id}
                                    onChange={(e) => handleNewClassChange(index, 'location_id', e.target.value)}
                                />

                                <label>Staff:</label>
                                <select
                                    value={newClass.staff_id}
                                    onChange={(e) => handleNewClassChange(index, 'staff_id', e.target.value)}
                                >
                                    <option value="" disabled hidden>Select Staff</option>
                                    {staffList.map((staff) => (
                                        <option key={staff.id} value={staff.id}>
                                            {staff.name}
                                        </option>
                                    ))}
                                </select>
                                <hr />
                            </div>
                        ))}

                        <button onClick={handleAddClass}>Add Class</button>

                        <div className="popup-buttons">
                            <button onClick={handleSubmit}>Save</button>
                            <button onClick={onClose}>Close</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditSubjectClassPopup;




