"use client";
import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const cache = new Map<string, { url: string; exp: number }>();
export async function signedUrl(path: string): Promise<string | null> {
  const hit = cache.get(path);
  if (hit && hit.exp > Date.now()) return hit.url;
  const { data } = await createClient().storage.from("product-images").createSignedUrl(path, 3600);
  if (!data?.signedUrl) return null;
  cache.set(path, { url: data.signedUrl, exp: Date.now() + 50 * 60 * 1000 });
  return data.signedUrl;
}
export default function ItemImage({ path, alt, className = "" }: { path: string | null; alt: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { let on = true; setUrl(null); if (path) signedUrl(path).then((u) => on && setUrl(u)); return () => { on = false; }; }, [path]);
  if (path && url) return /* eslint-disable-next-line @next/next/no-img-element */ <img src={url} alt={alt} className={`object-cover ${className}`} loading="lazy" />;
  return <div className={`flex items-center justify-center bg-sand-100 text-sand-400 ${className}`} aria-hidden><ImageIcon size={22} /></div>;
}
