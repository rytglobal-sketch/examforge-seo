import "server-only";
import postgres from "postgres";

let sqlClient: postgres.Sql | null | undefined;

export function getSql() {
  if (sqlClient !== undefined) {
    return sqlClient;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    sqlClient = null;
    return sqlClient;
  }

  sqlClient = postgres(databaseUrl, {
    max: 10,
    ssl: databaseUrl.includes("localhost") ? false : "prefer",
  });

  return sqlClient;
}

export function vectorLiteral(values: number[]) {
  const safeValues = values.map((value) =>
    Number.isFinite(value) ? Number(value).toFixed(8) : "0",
  );

  return `[${safeValues.join(",")}]`;
}
