import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("product/:id", "routes/product.$id.tsx"),
] satisfies RouteConfig;
