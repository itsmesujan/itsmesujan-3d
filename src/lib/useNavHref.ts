"use client";

import { usePathname } from "next/navigation";

/**
 * Resolve home-page hash targets from any route.
 *
 * Content stores navigation as plain hash targets ("#work") because that is
 * where the content actually lives. This turns them into a native in-page
 * anchor on `/` — instant, no router involved — and a real navigation back
 * home from any other route.
 */
export function useNavHref() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  return (href: string) => (!href.startsWith("#") || onHome ? href : `/${href}`);
}
