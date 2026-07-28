#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AUTH_MODELS = ["User", "Account", "Session", "VerificationToken"];

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, "..");
const serviceSchemaPath = path.resolve(webRoot, "../hockey-app-service/prisma/schema.prisma");
const targetSchemaPath = path.resolve(webRoot, "prisma/schema.prisma");
const checkMode = process.argv.includes("--check");

function extractBlock(schema, kind, name) {
  const match = new RegExp(`(^|\\n)${kind}\\s+${name}\\s*\\{`, "m").exec(schema);

  if (!match) {
    throw new Error(`Could not find ${kind} ${name} in ${serviceSchemaPath}`);
  }

  const start = match.index + match[1].length;
  const openBrace = schema.indexOf("{", start);
  let depth = 0;

  for (let index = openBrace; index < schema.length; index += 1) {
    const character = schema[index];

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return schema.slice(start, index + 1).trim();
      }
    }
  }

  throw new Error(`Could not find the closing brace for ${kind} ${name}`);
}

function stripAppOnlyRelations(modelBlock) {
  if (!modelBlock.startsWith("model User ")) {
    return modelBlock;
  }

  return modelBlock
    .split("\n")
    .filter((line) => !/^\s*appUser\s+AppUser\??\s*$/.test(line))
    .join("\n");
}

function buildAuthSchema(serviceSchema) {
  const generator = extractBlock(serviceSchema, "generator", "client");
  const datasource = extractBlock(serviceSchema, "datasource", "db");
  const authModels = AUTH_MODELS.map((modelName) =>
    stripAppOnlyRelations(extractBlock(serviceSchema, "model", modelName)),
  );

  return [
    "// This file is generated from ../hockey-app-service/prisma/schema.prisma.",
    "// Run `yarn db:sync-schema` to update it.",
    "// It intentionally contains only the Auth.js models needed by the web app.",
    "",
    generator,
    "",
    datasource,
    "",
    ...authModels.flatMap((modelBlock) => [modelBlock, ""]),
  ].join("\n");
}

if (!existsSync(serviceSchemaPath)) {
  console.error(`Service Prisma schema not found: ${serviceSchemaPath}`);
  process.exit(1);
}

const nextSchema = buildAuthSchema(readFileSync(serviceSchemaPath, "utf8"));

if (checkMode) {
  const currentSchema = existsSync(targetSchemaPath) ? readFileSync(targetSchemaPath, "utf8") : "";

  if (currentSchema !== nextSchema) {
    console.error("Web Prisma schema is out of sync with hockey-app-service.");
    console.error("Run `yarn db:sync-schema` from hockey-app-web.");
    process.exit(1);
  }

  console.log("Web Prisma schema is in sync.");
} else {
  writeFileSync(targetSchemaPath, nextSchema);
  console.log(`Updated ${path.relative(webRoot, targetSchemaPath)}`);
}
