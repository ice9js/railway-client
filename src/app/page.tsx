"use client";

import Project from "~/components/project";
import Welcome from "~/components/welcome";

export default function RailwayClient() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-white pt-10 text-black">
      <Welcome />
      <Project />
    </main>
  );
}
