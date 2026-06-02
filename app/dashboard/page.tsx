import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/signin");

  return <Dashboard user={session.user} />;
}
