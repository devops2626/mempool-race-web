import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/landing";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Landing />;
}
