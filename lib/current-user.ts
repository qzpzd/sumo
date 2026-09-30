import { cookies } from "next/headers";
import { sessionSecret, verifySession } from "./session";

export async function isAdmin() {
  const secret = sessionSecret();
  if (!secret) return false;
  const jar = await cookies();
  return verifySession(jar.get("ink_session")?.value, secret);
}
