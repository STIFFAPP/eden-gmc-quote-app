import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { enquiries, media } from "@/db/schema";
const fail=(error:string,status:number)=>NextResponse.json({error},{status});
export async function POST(req:NextRequest){
 const owner=req.headers.get("oai-authenticated-user-id");if(!owner)return fail("Sign in first.",401);
 try {
  const form=await req.formData(), enquiryId=String(form.get("enquiryId")||""),kind=String(form.get("kind")||"");
  if(!["before","after","timelapse"].includes(kind))return fail("Choose before, after or timelapse.",400);
  const file=form.get("file");if(!(file instanceof File))return fail("Choose a file.",400);
  const allowed=kind==="timelapse"?["video/mp4","video/quicktime","video/webm"]:["image/jpeg","image/png","image/webp","image/heic"];
  if(!allowed.includes(file.type)||file.size>(kind==="timelapse"?25:8)*1024*1024)return fail("Unsupported file or too large (images 8 MB, video 25 MB).",400);
  const db=getDb(), rows=await db.select({id:enquiries.id}).from(enquiries).where(and(eq(enquiries.id,enquiryId),eq(enquiries.ownerId,owner)));
  if(!rows.length)return fail("Enquiry not found.",404);
  if(!env.BUCKET)return fail("Media storage is unavailable.",503);
  const mediaId=crypto.randomUUID(),key=`${owner}/${enquiryId}/${mediaId}`;
  await env.BUCKET.put(key,file.stream(),{httpMetadata:{contentType:file.type}});
  try{await db.insert(media).values({id:mediaId,enquiryId,ownerId:owner,kind,key,filename:file.name.slice(0,180),mimeType:file.type,sizeBytes:file.size,createdAt:new Date().toISOString()})}catch{await env.BUCKET.delete(key);throw new Error("Metadata save failed")}
  return NextResponse.json({id:mediaId});
 }catch{return fail("Upload failed. Try again with a smaller file.",503)}
}
