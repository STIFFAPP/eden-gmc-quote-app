import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { and,eq } from "drizzle-orm";
import { getDb } from "@/db";
import { media } from "@/db/schema";
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const owner=req.headers.get("oai-authenticated-user-id");if(!owner)return new NextResponse("Sign in first",{status:401});
 const id=(await params).id;
 try{const rows=await getDb().select().from(media).where(and(eq(media.id,id),eq(media.ownerId,owner)));if(!rows.length)return new NextResponse("Not found",{status:404});const object=await env.BUCKET?.get(rows[0].key);if(!object)return new NextResponse("File unavailable",{status:404});const disposition=req.nextUrl.searchParams.has("download")?"attachment":"inline";return new NextResponse(object.body,{headers:{"Content-Type":rows[0].mimeType,"Content-Disposition":`${disposition}; filename="${rows[0].filename.replace(/["\r\n]/g,"_")}"`,"Cache-Control":"private, no-store"}})}catch{return new NextResponse("File unavailable",{status:503})}
}
