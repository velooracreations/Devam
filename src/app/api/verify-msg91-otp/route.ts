import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobile, otp } = body;

    if (!mobile || !otp) {
      return NextResponse.json({ error: "Mobile number and OTP are required" }, { status: 400 });
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, "").slice(-10);
    const formattedMobile = `91${cleanMobile}`;
    const authKey = process.env.MSG91_AUTH_KEY || "571955Tlo4FjQXyN6aaaba7cP1";

    // Call MSG91 direct OTP verification API
    const response = await fetch(
      `https://control.msg91.com/api/v5/otp/verify?mobile=${formattedMobile}&otp=${otp.trim()}&authkey=${authKey}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      }
    );

    const data = await response.json();
    console.log("MSG91 Direct OTP Verification Response:", data);

    if (
      response.ok &&
      (data.type === "success" || data.status === "success" || (data.message && data.message.toLowerCase().includes("success")))
    ) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json(
        { success: false, error: data.message || "Invalid OTP code. Please check your SMS and try again.", data },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("MSG91 OTP verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
