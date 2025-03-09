import "dotenv/config";
import { upsertMeet as drizzleUpsertMeet } from "@/api/repositories/meetDrizzle";
import {
  find as supabaseFind,
  setMigrated as supabaseSetMigrated,
  listUnmigratedUuids as supabaseListUnmigratedUuids,
} from "@/api/repositories/meetSupabase";
import { promises as fs } from "fs";

async function migrateMeet(uuid: string) {
  console.log(`Migrating meet ${uuid}`);
  const meet = await supabaseFind(uuid);
  console.log(`Meet found in Supabase: ${meet.name}`);

  await drizzleUpsertMeet(meet);
  console.log(`Meet upserted into Drizzle: ${meet.name}`);

  await supabaseSetMigrated(uuid, true);
  console.log(`Meet set to migrated in Supabase: ${meet.name}`);
}

// To run this script: `npx tsx scripts/migrate.ts`
async function main() {
  let uuids = await supabaseListUnmigratedUuids(20);

  while (uuids.length > 0) {
    console.log(`Migrating ${uuids.length} meets`);
    const migratePromises = uuids.map(migrateMeet);

    const results = await Promise.allSettled(migratePromises);

    // append the results to a csv file
    const resultsCsv = results
      .map((r, i) => {
        if (r.status === "fulfilled") {
          return `${uuids[i]},success,${r.value}`;
        } else {
          return `${uuids[i]},error,${r.reason}`;
        }
      })
      .join("\n");
    await fs.appendFile("migration-results.csv", resultsCsv + "\n");

    uuids = await supabaseListUnmigratedUuids(20);
  }
}

main();
