import { Spanner } from "@google-cloud/spanner";

const projectId = process.env.SPANNER_PROJECT_ID || "local-project";
const instanceId = process.env.SPANNER_INSTANCE || "local-instance";
const databaseId = process.env.SPANNER_DATABASE || "notes";

const spanner = new Spanner({ projectId });
const instance = spanner.instance(instanceId);
const database = instance.database(databaseId);

export const notesTable = database.table("notes");
export const runQuery = database.run.bind(database);