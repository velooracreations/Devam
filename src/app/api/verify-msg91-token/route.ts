import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const accessToken = body["access-token"] || body.accessToken || body.token;

    if (!accessToken) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 });
    }

    const authKey = process.env.MSG91_AUTH_KEY || "571955Tlo4FjQXyN6aaaba7cP1";

    const response = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        authkey: authKey,
        "access-token": accessToken
      })
    });

    const data = await response.json();

    if (response.ok && (data.type === "success" || data.status === "success" || data.message === "Token verified")) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json({ success: false, error: data.message || "Token verification failed", data }, { status: 400 });
    }
  } catch (error: any) {
    console.error("MSG91 token verification error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
