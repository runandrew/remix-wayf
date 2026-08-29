import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("create", "routes/create.ts"),
  route("m/:uuid", "routes/m.$uuid.tsx"),
  route("m/:uuid/avails", "routes/m.$uuid.avails.tsx"),
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
