import { encryptAdmin } from "../src/server/auth/admin-session";

async function main() {
  const payload = { username: "admin", role: "admin" };
  const encrypted = encryptAdmin(JSON.stringify(payload));
  const cookieHeader = `dpst_admin_session=${encrypted}`;

  const filename = "2f9faf52-af31-41df-8ae2-d29eac2d9bcb.png";
  const url = `http://localhost:3000/api/upload/${filename}`;

  console.log("Requesting URL:", url);
  console.log("Cookie Header:", cookieHeader);

  try {
    const res = await fetch(url, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    console.log("Response Status:", res.status);
    console.log("Response Headers:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("Response Body Length:", text.length);
    if (res.status !== 200) {
      console.log("Response Body Snippet:", text.substring(0, 500));
    }
  } catch (err) {
    console.error("HTTP Fetch Error:", err);
  }
}

main().catch(console.error);
