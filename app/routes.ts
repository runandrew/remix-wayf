import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("m/:uuid", "routes/m.$uuid.tsx"),
  route("m/:uuid/avails", "routes/m.$uuid.avails.tsx"),
] satisfies RouteConfig;
