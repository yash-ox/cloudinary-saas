import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in",
  "/sign-up",
  "/login",
  "/",
]);

const isPublicApiRoute = createRouteMatcher(["/api/videos"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const currentURL = new URL(req.url);
  const isHomePage = currentURL.pathname === "/home";
  const isApiRequest = currentURL.pathname.startsWith("/api");

  if (userId && isPublicRoute(req) && !isHomePage) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  if (!userId) {
    if (!isPublicApiRoute(req) && !isPublicRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    if (isApiRequest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trcp)(.*)"],
};
