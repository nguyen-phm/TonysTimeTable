import React, { useState, useEffect } from 'react';
import AddStaffPopup from './popups/addStaffPopup';
import EditStaffPopup from './popups/editStaffPopup';
import { supabase } from './supabaseClient';
import '../styles/adminPage.css';

const StaffComponent = () => {
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddStaffPopup, setShowAddStaffPopup] = useState(false);
    const [showEditStaffPopup, setShowEditStaffPopup] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null); // To store selected staff for editing

    // Fetch staff from Supabase when the component mounts
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('Staff')
                    .select('*');

                if (error) {
                    console.error('Error fetching staff:', error);
                } else {
                    setStaff(data); // Store the staff data
                }
            } finally {
                setIsLoading(false); // Loading state ends
            }
        };

        fetchStaff();
    }, []);

    const addStaff = (newStaff) => {
        setStaff([...staff, newStaff]); // Add new staff to the list
    };

    const handleDeleteStaff = async (staffId) => {
        try {
            const { error } = await supabase
                .from('Staff')
                .delete()
                .eq('id', staffId);

            if (error) {
                console.error('Error deleting staff:', error);
            } else {
                setStaff(staff.filter((member) => member.id !== staffId)); // Remove staff from the list
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
        }
    };

    const handleEditStaff = (staff) => {
        setSelectedStaff(staff); // Store the selected staff
        setShowEditStaffPopup(true); // Show the edit popup
    };

    const updateStaff = (updatedStaff) => {
        setStaff(staff.map((member) => (member.id === updatedStaff.id ? updatedStaff : member)));
    };

    return (
        <div className="admin-section">
            {isLoading ? (
                <p>Loading staff...</p>
            ) : (
                <>
                    <div className="courses-list">
                        {staff.map((member, index) => (
                            <div key={index} className="course-row">
                                <div className="course-info">
                                    <div className="course-name">{member.name}</div>
                                    <div className="course-code">{member.university_email}</div>
                                </div>
                                <div className="course-actions">
                                    <button className="more-options" onClick={() => handleEditStaff(member)}>
                                        Edit
                                    </button>
                                    <button className="more-options" onClick={() => handleDeleteStaff(member.id)}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <br />

            <button className="more-options" type="button" onClick={() => setShowAddStaffPopup(true)}>
                Add Staff
            </button>

            {showAddStaffPopup && (
                <AddStaffPopup
                    onClose={() => setShowAddStaffPopup(false)}
                    onSubmit={addStaff}
                />
            )}

            {showEditStaffPopup && selectedStaff && (
                <EditStaffPopup
                    staff={selectedStaff}
                    onClose={() => setShowEditStaffPopup(false)}
                    onSubmit={updateStaff}
                />
            )}
        </div>
    );
};

export default StaffComponent;
