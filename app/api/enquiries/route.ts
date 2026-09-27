import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { enquiries, media } from "@/db/schema";

const owner = (req: NextRequest) => req.headers.get("oai-authenticated-user-id");
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
export async function GET(req: NextRequest) {
  const id = owner(req); if (!id) return fail("Sign in to view enquiries.", 401);
  try {
    const db = getDb();
    const rows = await db.select().from(enquiries).where(eq(enquiries.ownerId, id)).orderBy(desc(enquiries.createdAt)).limit(250);
    const photos = await db.select().from(media).where(eq(media.ownerId, id));
    return NextResponse.json({ enquiries: rows.map(row => ({ ...row, quote: JSON.parse(row.quoteJson), media: photos.filter(m => m.enquiryId === row.id).map(({key, ownerId, ...rest}) => rest) })) });
  } catch { return fail("The enquiry log is unavailable. Please try again.", 503); }
}
export async function POST(req: NextRequest) {
  const id = owner(req); if (!id) return fail("Sign in to save enquiries.", 401);
  let data: any; try { data = await req.json(); } catch { return fail("Invalid enquiry.", 400); }
  const name = String(data.customerName || "").trim().slice(0,160), email = String(data.email || "").trim().slice(0,254);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter the customer's name and a valid email.", 400);
  const quote = data.quote;
  if (!quote || !Number.isFinite(quote.total) || quote.total < 0 || !Number.isFinite(quote.area) || quote.area <= 0) return fail("Calculate a valid quote first.", 400);
  const now = new Date().toISOString(), recordId = crypto.randomUUID(), consent = data.marketingConsent === true;
  try {
    await getDb().insert(enquiries).values({ id:recordId, ownerId:id, createdAt:now, updatedAt:now, customerName:name, email, phone:String(data.phone||"").slice(0,80), address:String(data.address||"").slice(0,300), postcode:String(data.postcode||"").slice(0,30), notes:String(data.notes||"").slice(0,2000), service:String(quote.service||"").slice(0,120), quoteJson:JSON.stringify(quote), status:"enquiry", marketingConsent:consent?1:0, consentAt:consent?now:null, consentText:consent?"I would like to receive occasional email offers and service updates from Eden GMC. I can opt out at any time.":null });
    return NextResponse.json({ id:recordId });
  } catch { return fail("Could not save the enquiry. Your form is still open; please retry.", 503); }
}
export async function PATCH(req: NextRequest) {
  const id=owner(req); if(!id) return fail("Sign in to edit enquiries.",401);
  let data:any; try{data=await req.json()}catch{return fail("Invalid update.",400)}
  if(typeof data.id!=="string")return fail("Missing enquiry ID.",400);
  const changes:any={updatedAt:new Date().toISOString()};
  if(["enquiry","quoted","nudged","booked","in progress","completed","invoiced","paid","lost"].includes(data.status))changes.status=data.status;
  if(typeof data.appointment==="string")changes.appointment=data.appointment||null;
  if(typeof data.notes==="string")changes.notes=data.notes.slice(0,2000);
  if(data.invoiceNumber===true)changes.invoiceNumber=`EG-${new Date().getUTCFullYear()}-${data.id.slice(0,8).toUpperCase()}`;
  if(typeof data.paid==="boolean")changes.paid=data.paid?1:0;
  if(typeof data.marketingConsent==="boolean") { changes.marketingConsent=data.marketingConsent?1:0; changes.consentAt=data.marketingConsent?new Date().toISOString():null; changes.consentText=data.marketingConsent?"I would like to receive occasional email offers and service updates from Eden GMC. I can opt out at any time.":null; }
  try { const result=await getDb().update(enquiries).set(changes).where(and(eq(enquiries.id,data.id),eq(enquiries.ownerId,id))).returning({id:enquiries.id}); if(!result.length)return fail("Enquiry not found.",404);return NextResponse.json({ok:true}); }catch{return fail("Could not update this enquiry.",503)}
}
