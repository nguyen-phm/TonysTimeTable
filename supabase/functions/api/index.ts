import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.16.0?target=deno";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Define structure for storing GPT's JSON changes
let suggestedChanges: any = null;  // The proposed JSON changes by GPT
let gptResponseText: string | null = null;  // The human-readable description

serve(async (req) => {
  try {
    if (req.method === "POST") {
      const { query, action } = await req.json();  // Read the request content from frontend

      // Connect to your Supabase instance
      const supabaseUrl = Deno.env.get("MY_SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      if (action === "fetch_suggestions") {
        // Step 1: Get GPT suggestions

        // Query your database for necessary data
        const { data: classesData, error: classesError } = await supabase.from("Classes").select("*");
        const { data: usersData, error: usersError } = await supabase.from("Users").select("*");
        const { data: staffData, error: staffError } = await supabase.from("Staff").select("*");

        if (classesError || usersError || staffError) throw new Error("Error querying database");

        const dbData = {
          Classes: classesData,
          Users: usersData,
          Staff: staffData,
        };

        // GPT API request to get suggestions based on the database content
        const messages = [
          {
            role: "system",
            content: "You are an expert admin assistant. When admin ask for help in changes, optimisations, provide two paragraph in output: a json format of changes made base on the specific table or multiple tables they asked in database, then in another paragraph provide words describtion on changes made"
          },
          {
            role: "user",
            content: `Here is the database content:\n${JSON.stringify(dbData, null, 2)}. \n\n Users queries: ${query}`
          }
        ];

        const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;
        const openaiResponse = await fetch(OPENAI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (!openaiResponse.ok) {
          const errorDetails = await openaiResponse.json();
          throw new Error(`OpenAI API error: ${errorDetails.error.message}`);
        }

        const openaiOptimizedData = await openaiResponse.json();
        gptResponseText = openaiOptimizedData.choices[0].message.content.trim();

        // GPT response should contain two parts: description and JSON changes

        if (gptResponseText !== null) {
          // Find the first occurrence of the opening '{' of the JSON and the closing '}' to locate the JSON block
          const jsonStartIndex = gptResponseText.indexOf("{");
          const jsonEndIndex = gptResponseText.lastIndexOf("}") + 1;
          if (jsonStartIndex === -1 || jsonEndIndex === -1) {
            throw new Error("No JSON found in GPT response.");
          }
        
          // Extract the JSON part using substring
          const jsonPart = gptResponseText.substring(jsonStartIndex, jsonEndIndex).trim();
        
          // Extract the explanation text that follows the JSON
          const textPart = gptResponseText.substring(jsonEndIndex).trim();
        
          console.log("JSON Part: ", jsonPart); // Log JSON part
          console.log("Text Part: ", textPart); // Log text part
        
      
          if (!jsonPart) {
              throw new Error("No JSON changes found in GPT response.");
          }
      
          try {
              // Parse the JSON part and store the changes
              suggestedChanges = JSON.parse(jsonPart);
          } catch (err) {
              throw new Error("Error parsing the JSON changes from GPT response.");
          }
      
          // Return both the human-readable description and the JSON changes to the frontend
          return new Response(
              JSON.stringify({ description: textPart.trim(), jsonChanges: suggestedChanges }),
              {
                  headers: { "Content-Type": "application/json" },
              }
          );
      } else {
          throw new Error("GPT response is null.");
      }
      } else if (action === "approve") {
        // Step 2: If the user approves, apply the stored JSON changes to the database
        if (!suggestedChanges) {
          throw new Error("No suggestions to approve.");
        }

        // Apply the changes from the proposed JSON to the database
        for (const tableName of Object.keys(suggestedChanges)) {
          const changesForTable = suggestedChanges[tableName];

          for (const change of changesForTable) {
            const { id, ...updatedFields } = change;  // Extract 'id' and the fields to update

            const { error } = await supabase
              .from(tableName)
              .update(updatedFields)
              .eq("id", id);

            if (error) throw new Error(`Error updating ${tableName}: ` + error.message);
          }
        }

        // Clear the stored changes after they are applied
        suggestedChanges = null;

        return new Response(
          JSON.stringify({ message: "Changes approved and database updated successfully" }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        throw new Error("Invalid action.");
      }
    } else {
      // If request is not POST, return a method not allowed response
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { "Content-Type": "application/json" },
        status: 405,
      });
    }
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
