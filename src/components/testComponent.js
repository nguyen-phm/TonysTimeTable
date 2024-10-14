import exportTimetable from "./exportTimetable";
import { supabase } from './supabaseClient';

const TestComponent = () => {
  return (
    <div className="test-component">
      <button onClick={() => foo(1)}>Test Button</button> 
    </div>
  );
};

const foo =  async (courseId) => {
  // Attempt to fetch course
  const { data: course, error } = await supabase
  .from('Courses')
  .select(`
      id, name,
      Campuses(venue_name)
  `)
  .eq('id', courseId)
  .limit(1)
  .single();
  if (error) {
      throw new Error('Error fetching course: ', error.message);
  }
  exportTimetable(course);
}

export default TestComponent;