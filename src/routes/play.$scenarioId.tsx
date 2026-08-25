import { createFileRoute, redirect } from "@tanstack/react-router";
import { SimApp } from "@/components/sim/sim-app";
import { scenarioById } from "@/lib/sim/scenarios";

export const Route = createFileRoute("/play/$scenarioId")({
  beforeLoad: ({ params }) => {
    if (!scenarioById(params.scenarioId)) {
      throw redirect({
        to: "/play/$scenarioId",
        params: { scenarioId: "mempool-window" },
      });
    }
  },
  component: PlayPage,
});

function PlayPage() {
  const { scenarioId } = Route.useParams();
  return <SimApp scenarioId={scenarioId} />;
}
