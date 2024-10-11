import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../../styles/scrollablePopup.css';

const EditSubjectClassPopup = ({ subject, onClose }) => {
    const [classes, setClasses] = useState([]);
    const [newClasses, setNewClasses] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data on component load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: classesData } = await supabase
                    .from('Classes')
                    .select('*')
                    .eq('subject_id', subject.id);
                setClasses(classesData);

                const { data: staffData } = await supabase
                    .from('Staff')
                    .select('id, name');
                setStaffList(staffData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [subject.id]);

    // Handle class change for existing classes
    const handleClassChange = (index, field, value) => {
        const updatedClasses = [...classes];
        updatedClasses[index][field] = value;
        setClasses(updatedClasses);
    };

    // Handle change for new classes
    const handleNewClassChange = (index, field, value) => {
        const updatedNewClasses = [...newClasses];
        updatedNewClasses[index][field] = value;
        setNewClasses(updatedNewClasses);
    };

    // Add a new class
    const handleAddClass = () => {
        setNewClasses([
            ...newClasses,
            { class_type: '', is_online: false, start_time: '', duration_30mins: '', location_id: '', staff_id: '' },
        ]);
    };

    // Remove an existing class
    const handleRemoveClass = (classId) => {
        setClasses(classes.filter((classItem) => classItem.id !== classId));
    };

    // Save changes to database
    const handleSubmit = async () => {
        // Update existing classes
        for (const classItem of classes) {
            await supabase
                .from('Classes')
                .update(classItem)
                .eq('id', classItem.id);
        }

        // Insert new classes
        for (const newClass of newClasses) {
            await supabase.from('Classes').insert({ subject_id: subject.id, ...newClass });
        }

        setNewClasses([]);
        onClose();
    };

    return (
        <div className="scrollpop-container">
            <div className="scrollpop">
                <div className="scrollpop-h2">{subject.code}</div>

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
                                                    onChange={(e) =>
                                                        handleClassChange(index, 'class_type', e.target.value)
                                                    }
                                                >
                                                    <option value="" disabled hidden>
                                                        Select Class Type
                                                    </option>
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
                                                    onChange={(e) =>
                                                        handleClassChange(index, 'staff_id', e.target.value)
                                                    }
                                                >
                                                    <option value="" disabled hidden>
                                                        Select Staff
                                                    </option>
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
                                                    onChange={(e) =>
                                                        handleClassChange(index, 'duration_30mins', e.target.value)
                                                    }
                                                />
                                            </label>
                                        </div>

                                        <div className="dropdown-container">
                                            <label>
                                                Is Online:
                                                <select
                                                    value={classItem.is_online ? 'true' : 'false'}
                                                    onChange={(e) =>
                                                        handleClassChange(index, 'is_online', e.target.value === 'true')
                                                    }
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
                                            onChange={(e) =>
                                                handleNewClassChange(index, 'class_type', e.target.value)
                                            }
                                        >
                                            <option value="" disabled hidden>
                                                Select Class Type
                                            </option>
                                            <option value="Tutorial">Tutorial</option>
                                            <option value="Lecture">Lecture</option>
                                            <option value="Practical">Practical</option>
                                        </select>
                                    </div>

                                    <div className="dropdown-container">
                                        <label>Is Online:</label>
                                        <select
                                            value={newClass.is_online ? 'true' : 'false'}
                                            onChange={(e) =>
                                                handleNewClassChange(index, 'is_online', e.target.value === 'true')
                                            }
                                        >
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    </div>
                                </div>

                                <label>Duration (in 30-minute intervals):</label>
                                <input
                                    type="number"
                                    value={newClass.duration_30mins}
                                    onChange={(e) => handleNewClassChange(index, 'duration_30mins', e.target.value)}
                                />

                                <label>Staff:</label>
                                <select
                                    value={newClass.staff_id}
                                    onChange={(e) => handleNewClassChange(index, 'staff_id', e.target.value)}
                                >
                                    <option value="" disabled hidden>
                                        Select Staff
                                    </option>
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

                        <div className="scrollpop-buttons">
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





