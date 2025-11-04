// src/app/api/instagram/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const res = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp,thumbnail_url&access_token=${token}`
  );
  const data = await res.json();
  return NextResponse.json(data);
}
