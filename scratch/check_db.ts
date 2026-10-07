import { db } from "../src/db";

async function main() {
  console.log("Fetching applications...");
  const apps = await db.query.applications.findMany({
    with: {
      attachments: true,
    }
  });
  console.log("Applications and attachments:");
  console.log(JSON.stringify(apps, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
