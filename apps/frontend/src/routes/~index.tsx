import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="text-center text-2xl font-bold">
      <p>
        Standart fullstack project template! For more information see the
        README.md file or visit the site:
      </p>
      <a
        href="https://github.com/Aleksey-Danchin/standard-fullstack-project"
        className="text-blue-500 hover:text-blue-700"
      >
        https://github.com/Aleksey-Danchin/standard-fullstack-project
      </a>
    </div>
  );
}
