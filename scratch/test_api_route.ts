import { GET } from "../src/app/api/upload/[filename]/route";

// We mock next/headers cookies by overriding next/headers or just setting the admin cookie using setAdminSession before executing GET!
// Since setAdminSession uses Next.js `cookies()`, and we are in a non-Next.js CLI environment, Next.js cookies might fail because there's no AsyncLocalStorage request store.
// Let's see if we can run it.

async function main() {
  console.log("Mocking next/headers");
  // Let's try calling GET directly with a fake request.
  const req = new Request("http://localhost:3000/api/upload/2f9faf52-af31-41df-8ae2-d29eac2d9bcb.png");
  const params = Promise.resolve({ filename: "2f9faf52-af31-41df-8ae2-d29eac2d9bcb.png" });

  try {
    const res = await GET(req, { params });
    console.log("Response status:", res.status);
    const json = await res.json();
    console.log("Response JSON:", json);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error executing GET:", message);
  }
}

main();
