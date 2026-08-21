import { redirect } from "next/navigation";

// The marketing homepage is parked at _archive/homepage-marketing.tsx (outside
// app/, so it isn't routed) — restore it there when ready. Until then, "/"
// just goes straight to admin login.
export default function Home() {
  redirect("/admin/login");
}
