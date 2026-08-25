import "server-only";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

import { prisma } from "./prisma";

const COOKIE_NAME = "kt_admin_session";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing"
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSession(
  adminId: string
) {
  const token = await new SignJWT({
    adminId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();

  cookieStore.set(
    COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge:
        60 * 60 * 24 * 7,
    }
  );
}

export async function getAdminSession() {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        COOKIE_NAME
      )?.value;

    if (!token) {
      return null;
    }

    const { payload } =
      await jwtVerify(
        token,
        getSecret()
      );

    if (
      !payload.adminId ||
      typeof payload.adminId !==
        "string"
    ) {
      return null;
    }

    const admin =
      await prisma.adminUser.findUnique(
        {
          where: {
            id: payload.adminId,
          },
        }
      );

    if (
      !admin ||
      !admin.active
    ) {
      return null;
    }

    return admin;
  } catch {
    return null;
  }
}

export async function destroyAdminSession() {
  const cookieStore =
    await cookies();

  cookieStore.set(
    COOKIE_NAME,
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }
  );
}