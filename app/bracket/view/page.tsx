import { Suspense } from "react";
import ViewBracketClient from "./view-client";

export const dynamic = "force-dynamic"; // prevents static prerender
export const revalidate = 0;

export default function ViewBracketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020617] text-white p-6">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
              Loading bracket...
            </div>
          </div>
        </div>
      }
    >
      <ViewBracketClient />
    </Suspense>
  );
}
