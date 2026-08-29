import cobaltTheme from "@/preview/cobalt/cobalt-theme.css?url";
import { Link, Outlet, type LinksFunction } from "react-router";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: cobaltTheme },
];

export default function CobaltPreviewLayout() {
  return (
    <div className="cobalt-preview fixed inset-0 z-50 flex flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-4">
        <div className="cobalt-badge mt-3 self-start">Visual experiment — not production</div>
        <div className="flex flex-1 flex-col items-center justify-center py-8">
          <Outlet />
        </div>
        <footer className="cobalt-footer flex w-full items-center justify-between">
          <span>WAYF</span>
          <nav className="flex gap-3 text-xs font-normal normal-case tracking-normal">
            <Link to="/preview/cobalt" className="underline underline-offset-2">
              Home
            </Link>
            <Link to="/preview/cobalt/meet" className="underline underline-offset-2">
              Meet
            </Link>
            <Link to="/preview/cobalt/avails" className="underline underline-offset-2">
              Avails
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
