/**
 * Generic Prisma update script.
 *
 * Dry-run by default: it reports what WOULD change and exits without writing.
 * Pass --apply to actually commit the update.
 *
 * Single update:
 *   ts-node scripts/update-records.ts \
 *     --model=school \
 *     --where='{"district":{"in":["trichy","Trichy "]}}' \
 *     --data='{"district":"Trichy"}'
 *
 * Batch from a JSON file (array of { model, where, data, description? }),
 * applied inside one transaction so either all or none land:
 *   ts-node scripts/update-records.ts --file=scripts/data/my-updates.json --apply
 *
 * Flags:
 *   --model=<PrismaModel>  model name, case-insensitive (school, User, midDayMeal...)
 *   --where='<json>'       Prisma where filter. Required. Use '{}' to target every row.
 *   --data='<json>'        fields to set. Required.
 *   --file=<path>          batch mode; ignores --model/--where/--data
 *   --apply                commit the changes (otherwise dry-run)
 *   --preview=<n>          rows to print in the dry-run preview (default 5)
 *   --max=<n>              refuse to run if more than n rows match (default 1000)
 */

import { PrismaClient, Prisma } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

type UpdateOp = {
  model: string;
  where: Record<string, unknown>;
  data: Record<string, unknown>;
  description?: string;
};

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const eq = arg.indexOf("=");
    if (eq === -1) out[arg.slice(2)] = "true";
    else out[arg.slice(2, eq)] = arg.slice(eq + 1);
  }
  return out;
}

function parseJsonFlag(name: string, raw: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(
      `--${name} is not valid JSON: ${(e as Error).message}\n  received: ${raw}`
    );
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`--${name} must be a JSON object, got: ${raw}`);
  }
  return parsed as Record<string, unknown>;
}

/** Map a user-supplied model name to the delegate key on PrismaClient. */
function resolveModel(name: string): string {
  const models = Prisma.dmmf.datamodel.models.map((m) => m.name);
  const match = models.find((m) => m.toLowerCase() === name.toLowerCase());
  if (!match) {
    const hint = models
      .filter((m) => m.toLowerCase().includes(name.toLowerCase()))
      .slice(0, 8);
    throw new Error(
      `Unknown model "${name}".` +
        (hint.length ? ` Did you mean: ${hint.join(", ")}?` : "") +
        `\n  Run with --list-models to see all ${models.length} models.`
    );
  }
  return match.charAt(0).toLowerCase() + match.slice(1);
}

function delegateFor(modelKey: string): any {
  const delegate = (prisma as any)[modelKey];
  if (!delegate || typeof delegate.updateMany !== "function") {
    throw new Error(`Model "${modelKey}" has no updateMany delegate.`);
  }
  return delegate;
}

function loadBatchFile(file: string): UpdateOp[] {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) throw new Error(`Batch file not found: ${abs}`);
  const parsed = JSON.parse(fs.readFileSync(abs, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error(`Batch file must contain a JSON array of updates: ${abs}`);
  }
  parsed.forEach((op: any, i: number) => {
    if (!op || typeof op !== "object") {
      throw new Error(`Batch entry #${i} is not an object`);
    }
    for (const key of ["model", "where", "data"]) {
      if (!(key in op)) throw new Error(`Batch entry #${i} is missing "${key}"`);
    }
  });
  return parsed as UpdateOp[];
}

/** Inspect an op without writing: match count + a sample of affected rows. */
async function preview(op: UpdateOp, previewRows: number, max: number) {
  const modelKey = resolveModel(op.model);
  const delegate = delegateFor(modelKey);

  const count: number = await delegate.count({ where: op.where });
  const label = op.description ? ` — ${op.description}` : "";
  console.log(`\n[${modelKey}]${label}`);
  console.log(`  where: ${JSON.stringify(op.where)}`);
  console.log(`  data:  ${JSON.stringify(op.data)}`);
  console.log(`  matches: ${count} row(s)`);

  if (count > max) {
    throw new Error(
      `${count} rows match on ${modelKey}, above the --max limit of ${max}. ` +
        `Narrow the filter or raise --max deliberately.`
    );
  }

  if (count > 0 && previewRows > 0) {
    const sample = await delegate.findMany({
      where: op.where,
      take: previewRows,
    });
    const fields = Object.keys(op.data);
    console.log(`  sample (first ${sample.length}):`);
    for (const row of sample) {
      const id = row.id ?? row.dise ?? "(no id)";
      const before = fields
        .map((f) => `${f}=${JSON.stringify(row[f])}`)
        .join(", ");
      const after = fields
        .map((f) => `${f}=${JSON.stringify((op.data as any)[f])}`)
        .join(", ");
      console.log(`    ${id}: ${before}  ->  ${after}`);
    }
  }

  return { modelKey, count };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args["list-models"]) {
    const models = Prisma.dmmf.datamodel.models.map((m) => m.name).sort();
    console.log(models.join("\n"));
    return;
  }

  const apply = args.apply === "true";
  const previewRows = args.preview ? Number(args.preview) : 5;
  const max = args.max ? Number(args.max) : 1000;
  if (Number.isNaN(previewRows) || Number.isNaN(max)) {
    throw new Error("--preview and --max must be numbers");
  }

  let ops: UpdateOp[];
  if (args.file) {
    ops = loadBatchFile(args.file);
    console.log(`Loaded ${ops.length} update(s) from ${args.file}`);
  } else {
    if (!args.model || !args.where || !args.data) {
      throw new Error(
        "Provide --model, --where and --data (or --file for batch mode). " +
          "See the header comment in this file for examples."
      );
    }
    ops = [
      {
        model: args.model,
        where: parseJsonFlag("where", args.where),
        data: parseJsonFlag("data", args.data),
      },
    ];
  }

  console.log(apply ? "\n=== APPLY MODE ===" : "\n=== DRY RUN (no writes) ===");

  const planned: Array<{ op: UpdateOp; modelKey: string; count: number }> = [];
  for (const op of ops) {
    const { modelKey, count } = await preview(op, previewRows, max);
    planned.push({ op, modelKey, count });
  }

  const total = planned.reduce((sum, p) => sum + p.count, 0);

  if (!apply) {
    console.log(
      `\nDry run complete. ${total} row(s) would be updated across ` +
        `${planned.length} operation(s). Re-run with --apply to commit.`
    );
    return;
  }

  if (total === 0) {
    console.log("\nNothing matches — no writes performed.");
    return;
  }

  const results = await prisma.$transaction(
    planned.map(({ op, modelKey }) =>
      delegateFor(modelKey).updateMany({ where: op.where, data: op.data })
    )
  );

  console.log("");
  results.forEach((r: { count: number }, i: number) => {
    console.log(`  ${planned[i].modelKey}: updated ${r.count} row(s)`);
  });
  console.log(
    `\nDone. ${results.reduce(
      (sum: number, r: { count: number }) => sum + r.count,
      0
    )} row(s) updated.`
  );
}

main()
  .catch((e) => {
    console.error(`\nError: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
