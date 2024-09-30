import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.16.0?target=deno";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

serve(async (req) => {
  try {
    const { query } = await req.json();

    // Connect to your Supabase instance
    const supabaseUrl = Deno.env.get("MY_SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query your Supabase 'Classes' table
    const { data: timetableData, error } = await supabase
      .from("Classes")
      .select("*");

    if (error) throw new Error("Error querying database: " + error.message);

    // Prepare data for OpenAI API (or any optimization logic)
    const dbData = timetableData.map((item) => ({
      id: item.id,
      classType: item.class_type,
      isOnline: item.is_online,
      subjectId: item.subject_id,
      locationId: item.location_id || "N/A", // Handle NULL location_id
      startTime: item.start_time || "N/A",  // Handle NULL start_time
      endTime: item.end_time || "N/A",      // Handle NULL end_time
      staffId: item.staff_id,
    }));

    // Construct the messages structure for OpenAI API
    const messages = [
      {
        role: "system",
        content: "You are an expert admin assistant, please help user to solve their problem or provide suggestion otherwise"
      },
      {
        role: "user",
        content: `Here is the timetable data:\n${JSON.stringify(dbData, null, 2)}, what is inside this table and currently not available`
      }
    ];

    // Call OpenAI API for chat completion
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;
    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",  // or "gpt-4"
        messages: messages,  // Using messages instead of prompt
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorDetails = await openaiResponse.json();
      throw new Error(`OpenAI API error: ${errorDetails.error.message}`);
    }

    const openaiOptimizedData = await openaiResponse.json();

    // Return the optimized data from OpenAI API to the client
    return new Response(
      JSON.stringify({ response: openaiOptimizedData.choices[0].message.content }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
