export function headers() {
  return { "X-Robots-Tag": "noindex, nofollow" };
}

export function loader() {
  throw new Response("Not found", { status: 404 });
}

export default function NotFound() {
  return null;
}
