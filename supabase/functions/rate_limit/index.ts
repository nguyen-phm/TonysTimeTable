// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis connection with Upstash
const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
});

// Set up rate limiter: Allow 5 requests per 10 minutes per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(2, "10m"), // 2 requests per 10 minutes
  analytics: true,
});

serve(async (req) => {
  // Get the client IP address
  const ip = req.headers.get("x-forwarded-for") || Deno.env.get("REMOTE_ADDR") || "unknown";

  // Apply rate limiting
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response(JSON.stringify({ message: "Rate limit exceeded. Try again later." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Actual function logic
  return new Response(JSON.stringify({ message: "You are within the rate limit." }), {
    headers: { "Content-Type": "application/json" },
  });
});