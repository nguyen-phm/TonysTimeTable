import { supabase } from "./supabaseClient";

const TestComponent = () => {
  return (
    <div className="test-component">
      <button onClick={myFunction}>Test Button</button> 
    </div>
  );
};

async function myFunction() {
    console.log('My function');
    const { data, error } = await supabase.functions.invoke('generate-timetable');
    if (error) console.log(error.message);
    console.log('Done????');
}

export default TestComponent;