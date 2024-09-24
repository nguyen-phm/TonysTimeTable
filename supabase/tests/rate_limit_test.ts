import { assertEquals } from "https://deno.land/std@0.131.0/testing/asserts.ts";
//test script for rate limit

async function testRateLimit() {
  const url = "http://127.0.0.1:54321/functions/v1/rate_limit";

  console.log("Starting testRateLimit...");

  // Make 5 requests (within the allowed limit)
  for (let i = 0; i < 15; i++) {
    console.log(`Sending request ${i + 1}`);
    const res = await fetch(url);

    console.log(`Received response for request ${i + 1}`);

    if (!res.ok) {
      console.error(`Error: Status ${res.status} for request ${i + 1}`);
    }

    const data = await res.json();
    assertEquals(res.status, 200, "Expected 200 status for allowed requests.");
    console.log(data.message);
  }

  console.log("Sending additional request to exceed rate limit...");

  // Make an additional request that should be rate limited
  const res = await fetch(url);
  const data = await res.json();
  console.log(`Received response for request 6`);
  assertEquals(
    res.status,
    429,
    "Expected 429 status when rate limit is exceeded.",
  );
  console.log(data.message);
}

testRateLimit().then(() => {
  console.log("Test completed");
}).catch((error) => {
  console.error("Test failed:", error);
});
