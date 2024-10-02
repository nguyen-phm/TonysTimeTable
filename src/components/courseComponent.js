import React, { useState } from 'react';
import AddCoursePopup from './popups/addCoursePopup';
import '../styles/adminPage.css'; // Your existing CSS for the admin page

const CourseComponent = () => {
  const [courses, setCourses] = useState([]); // Manage the list of courses
  const [showPopup, setShowPopup] = useState(false); // Toggle popup visibility

  // Handle adding a course
  const addCourse = (courseName) => {
    setCourses([...courses, courseName]); // Add course to the list
  };

  return (
    <div className="admin-section">
      <h2>Courses</h2>

      {/* Display the list of courses */}
      <ul>
        {courses.map((course, index) => (
          <li key={index}>{course}</li>
        ))}
      </ul>

      {/* Add button */}
      <button type="button" onClick={() => setShowPopup(true)}>
        Add Course
      </button>

      {/* Render the popup when showPopup is true */}
      {showPopup && (
        <AddCoursePopup
          onClose={() => setShowPopup(false)} // Close the popup
          onSubmit={addCourse}               // Submit the new course
        />
      )}
    </div>
  );
};

export default CourseComponent;