import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect,
} from "react-router";

import type { Route } from "./+types/root";
import { Header } from "~/components/Header";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

/**
 * Taobaoまたは1688のURLから商品IDを抽出
 */
function extractItemId(url: string): { id: string; site: 'taobao' | '1688' } | null {
  try {
    const urlObj = new URL(url);

    // Taobao: https://item.taobao.com/item.htm?id=123456789
    if (urlObj.hostname.includes('taobao.com')) {
      const id = urlObj.searchParams.get('id');
      if (id) {
        return { id, site: 'taobao' };
      }
    }

    // 1688: https://detail.1688.com/offer/123456789.html
    if (urlObj.hostname.includes('1688.com')) {
      const match = urlObj.pathname.match(/\/offer\/(\d+)\.html/);
      if (match && match[1]) {
        return { id: match[1], site: '1688' };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get('url');

  if (typeof url !== 'string' || !url.trim()) {
    return {
      error: 'URLを入力してください',
    };
  }

  const extracted = extractItemId(url.trim());

  if (!extracted) {
    return {
      error: '有効なタオバオまたは1688の商品URLを入力してください',
    };
  }

  return redirect(`/product/${extracted.id}?site=${extracted.site}`);
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
