import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return NextResponse.json({
      connected: false,
      error: "DATABASE_URL environment variable is missing",
      projectName: process.env.NEON_PROJECT_NAME || "WEB_kesararamwithdigital",
      host: "eastus2.azure.neon.tech",
    });
  }

  try {
    const sql = neon(dbUrl);
    const startTime = Date.now();
    const result = await sql`SELECT NOW() as current_time, version() as pg_version;`;
    const latency = Date.now() - startTime;

    // Fetch existing public tables
    let tables: string[] = [];
    try {
      const tablesResult = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        LIMIT 10;
      `;
      tables = tablesResult.map((t: { table_name?: string }) => t.table_name || "").filter(Boolean);
    } catch {}

    return NextResponse.json({
      connected: true,
      latencyMs: latency,
      serverTime: result[0]?.current_time,
      pgVersion: "PostgreSQL 17 (Serverless)",
      projectName: process.env.NEON_PROJECT_NAME || "WEB_kesararamwithdigital",
      region: process.env.NEON_REGION || "azure-eastus2",
      host: "ep-tiny-water-a8u6wsj2-pooler.eastus2.azure.neon.tech",
      database: "neondb",
      tablesCount: tables.length,
      tables,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown database connection error";
    return NextResponse.json({
      connected: false,
      error: errMsg,
      projectName: process.env.NEON_PROJECT_NAME || "WEB_kesararamwithdigital",
      host: "eastus2.azure.neon.tech",
    });
  }
}
