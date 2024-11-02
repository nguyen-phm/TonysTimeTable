import { supabase } from "./supabaseClient";

const TestComponent = () => {
  return (
    <div className="test-component">
      <button onClick={myFunction}>Test Button</button> 
    </div>
  );
};

async function myFunction() {
    const { data, error } = await supabase.functions.invoke('generate-timetable');
    if (error) console.error(error.message);
    else if (data.error) console.error(data.error);
    else console.log(data.message);
}

export default TestComponent;