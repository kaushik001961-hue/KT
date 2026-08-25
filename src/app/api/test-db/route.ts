import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.adminUser.count();

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      adminUsers: result,
    });
  } catch (error) {
    console.error("DATABASE TEST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}