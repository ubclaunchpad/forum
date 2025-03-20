import { emptyDatabase, setupDevSeedData } from "./setup.ts";

emptyDatabase().then(() => {
  console.log("Database emptied");
  setupDevSeedData().then(() => {
    console.log("Database setup complete");
  });
});
