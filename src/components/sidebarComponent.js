const SidebarComponent = ({ courses }) => {
    return (
        <div className="sidebar">
            <h3>Courses</h3>
            {courses.map(course => (
                <div className="course-box" key={course.id}>
                    <h4>{course.name}</h4>
                    <p>{course.details}</p>
                </div>
            ))}
        </div>
    );
};

export default SidebarComponent;