import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("create", "routes/create.ts"),
  route("m/:uuid", "routes/m.$uuid.tsx"),
  route("m/:uuid/avails", "routes/m.$uuid.avails.tsx"),
  route("preview/cobalt", "routes/preview.cobalt.tsx", [
    index("routes/preview.cobalt._index.tsx"),
    route("meet", "routes/preview.cobalt.meet.tsx"),
    route("avails", "routes/preview.cobalt.avails.tsx"),
  ]),
] satisfies RouteConfig;
