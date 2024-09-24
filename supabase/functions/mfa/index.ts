import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as speakeasy from "npm:speakeasy"; // Import speakeasy
//mfa logic implemented
const supabase = createClient(
  Deno.env.get("MY_SUPABASE_URL")!,
  Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  let body;

  // Safely parse JSON from the request body
  try {
    body = await req.json();
  } catch (err) {
    console.error("Invalid JSON input:", err);
    return new Response(JSON.stringify({ error: "Invalid JSON input" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { action, user_id, token } = body;

  if (!user_id) {
    return new Response(JSON.stringify({ error: "Missing user_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "generateSecret") {
    try {
      const secret = speakeasy.generateSecret({
        name: "Tony's Timetable",
        length: 20,
      });

      const { data, error } = await supabase
        .from("Users")
        .update({ mfa_secret: secret.base32 })
        .eq("id", user_id);

      if (error) {
        console.error("Database error during update:", error);
        return new Response(JSON.stringify({ error: "Error saving secret" }), {
          status: 500,
        });
      }

      return new Response(
        JSON.stringify({
          otpauth_url: secret.otpauth_url,
          base32: secret.base32,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (err) {
      console.error("Unexpected error during secret generation:", err);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
      });
    }
  }

  if (action === "verifyToken") {
    try {
      const { data: user, error } = await supabase
        .from("Users")
        .select("mfa_secret")
        .eq("id", user_id)
        .single();

      if (error || !user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfa_secret,
        encoding: "base32",
        token: token,
      });

      return new Response(JSON.stringify({ success: verified }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Unexpected error during token verification:", err);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
});
