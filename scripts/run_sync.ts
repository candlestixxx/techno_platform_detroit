import { syncEvents } from "../src/lib/aggregator/sync";

async function run() {
  try {
    await syncEvents();
    console.log("Sync script finished successfully.");
  } catch (error) {
    console.error("Sync script failed:", error);
    process.exit(1);
  }
}

run();
