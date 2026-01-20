/* eslint-disable */
/**
 * Generated data model types.
 * Run `npx convex dev` to regenerate.
 */

import type { DataModelFromSchemaDefinition } from "convex/server";
import type { DocumentByName, TableNamesInDataModel } from "convex/server";
import type schema from "../schema.js";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;

export type Doc<TableName extends TableNamesInDataModel<DataModel>> =
  DocumentByName<DataModel, TableName>;
