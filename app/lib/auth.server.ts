import { redirect } from "react-router";
import { getSession, commitSession, destroySession } from "./session.server";
import { prisma } from "./db.server";
import bcrypt from "bcryptjs";

export async function createUser(email: string, password: string, name?: string | null) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
  });
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return null;

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) return null;

  return user;
}

export async function createUserSession(userId: string, redirectTo: string, remember: boolean = false) {
  const session = await getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
      }),
    },
  });
}

export async function logoutUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/auth", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/auth?${searchParams}`);
  }
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserSession(request).then((session) =>
    session.get("userId")
  );
  if (typeof userId !== "string") return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    return user;
  } catch {
    throw logoutUser(request);
  }
}
