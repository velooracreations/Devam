import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminToken";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : undefined;

  const result = await verifyAdminToken(token);
  if (result.valid) {
    return NextResponse.json({ authenticated: true, email: result.email });
  }

  return NextResponse.json({ authenticated: false, error: "Unauthorized session" }, { status: 401 });
}
