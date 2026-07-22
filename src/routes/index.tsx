import { createFileRoute } from "@tanstack/react-router";

import { ChessGame } from "../components/chess/ChessGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amber Chess — Play 3D chess against a smart AI" },
      {
        name: "description",
        content:
          "A premium dark 3D chess experience with a smart adjustable AI, a straight front-facing board, move history, captured pieces, and hints.",
      },
      {
        property: "og:title",
        content: "Amber Chess — Play 3D chess against a smart AI",
      },
      {
        property: "og:description",
        content:
          "Premium dark 3D chess with an adjustable AI opponent, move history, captured pieces, and hints.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <ChessGame />;
}
