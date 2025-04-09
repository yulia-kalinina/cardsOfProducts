"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const slug = window.location.pathname.split("/").pop();
    if (slug) {
      router.replace(`/custom-cat?id=${slug}`);
    }
  }, [router]);

  return null;
}