import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  await destroyAdminSession();

  const loginUrl = new URL("/admin/login", request.url);

  return NextResponse.redirect(loginUrl);
}