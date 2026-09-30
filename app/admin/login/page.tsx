import { LoginForm } from "@/components/LoginForm";
import { isAdmin } from "@/lib/current-user";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "登录", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="wrap">
      <LoginForm />
    </div>
  );
}
