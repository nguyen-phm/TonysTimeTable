import exportTimetable from "./exportTimetable";

const TestComponent = () => {
  return (
    <div className="test-component">
      <button onClick={() => exportTimetable(100)}>Test Button</button> 
    </div>
  );
};

export default TestComponent;