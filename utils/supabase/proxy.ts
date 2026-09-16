import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const PUBLIC_PATHS = ["/login", "/activar-cuenta"];

const CACHE_HEADERS = ["cache-control", "expires", "pragma"];

const redirectTo = (
  request: NextRequest,
  pathname: string,
  sessionResponse: NextResponse,
) => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;

  const response = NextResponse.redirect(url);

  sessionResponse.cookies
    .getAll()
    .forEach((cookie) => response.cookies.set(cookie));

  CACHE_HEADERS.forEach((header) => {
    const value = sessionResponse.headers.get(header);
    if (value) {
      response.headers.set(header, value);
    }
  });

  return response;
};

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();

  const hasSession = Boolean(data?.claims?.sub);
  const { pathname } = request.nextUrl;

  if (!hasSession && !PUBLIC_PATHS.includes(pathname)) {
    return redirectTo(request, "/login", supabaseResponse);
  }

  if (hasSession && pathname === "/login") {
    return redirectTo(request, "/", supabaseResponse);
  }

  return supabaseResponse;
};
