const urls = new Map<string,string>();
let pending: Promise<IDBDatabase>;
function db(){return pending ||= new Promise((resolve,reject)=>{const r=indexedDB.open('eden-gmc-pages-v1',1);r.onupgradeneeded=()=>{r.result.createObjectStore('enquiries',{keyPath:'id'});r.result.createObjectStore('media',{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(new Error('Browser storage unavailable. Use a regular browser window.'))})}
async function all(store:string){const d=await db();return new Promise<any[]>((resolve,reject)=>{const r=d.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function put(store:string,value:any){const d=await db();return new Promise<void>((resolve,reject)=>{const t=d.transaction(store,'readwrite');t.objectStore(store).put(value);t.oncomplete=()=>resolve();t.onerror=()=>reject(new Error('Could not save. Browser storage may be full; export a backup.'));t.onabort=()=>reject(new Error('Save failed. Browser storage may be full.'))})}
export function mediaUrl(id:string){return urls.get(id)||''}
async function hydrate(){for(const m of await all('media')){if(!urls.has(m.id))urls.set(m.id,URL.createObjectURL(m.blob))}}
export async function apiFetch(path:string,options:any={}){
 try{
 const method=options.method||'GET';let value:any={};
 if(path==='/api/enquiries'){
 const rows=await all('enquiries');
 if(method==='GET'){await hydrate();value={enquiries:rows.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))}}
 else if(method==='POST'){
 const b=JSON.parse(options.body);if(!b.customerName?.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))throw new Error('Enter a customer name and valid email.');
 const now=new Date().toISOString(),id=crypto.randomUUID();await put('enquiries',{...b,id,createdAt:now,status:'enquiry',appointment:null,invoiceNumber:null,paid:0,marketingConsent:b.marketingConsent?1:0,consentAt:b.marketingConsent?now:null,media:[]});value={id};
 }else if(method==='PATCH'){
 const b=JSON.parse(options.body),r=rows.find(x=>x.id===b.id);if(!r)throw new Error('Enquiry not found.');
 if(b.invoiceNumber===true)b.invoiceNumber='EDEN-'+new Date().getFullYear()+'-'+crypto.randomUUID().slice(0,8).toUpperCase();
 await put('enquiries',{...r,...b,marketingConsent:b.marketingConsent===undefined?r.marketingConsent:b.marketingConsent?1:0});value={success:true};
 }else throw new Error('Unsupported action.');
 }else if(path==='/api/media'&&method==='POST'){
 const f=options.body as FormData,file=f.get('file') as File;const rows=await all('enquiries'),r=rows.find(x=>x.id===f.get('enquiryId'));if(!r)throw new Error('Enquiry not found.');if(file.size>100*1024*1024)throw new Error('Choose a file smaller than 100 MB.');
 const id=crypto.randomUUID(),meta={id,filename:file.name,mimeType:file.type,kind:String(f.get('kind'))};await put('media',{...meta,blob:file});await put('enquiries',{...r,media:[...r.media,meta]});urls.set(id,URL.createObjectURL(file));value={id};
 }else throw new Error('Unsupported action.');
 return {ok:true,json:async()=>value};
 }catch(e){return {ok:false,json:async()=>({error:e instanceof Error?e.message:'Storage failed.'})}}
}
function dataURL(blob:Blob){return new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(r.error);r.readAsDataURL(blob)})}
export async function backup(){const media=[];for(const m of await all('media')){const {blob,...meta}=m;media.push({...meta,data:await dataURL(blob)})}const data={format:'eden-gmc-pages-backup',version:1,enquiries:await all('enquiries'),media};const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));a.href=url;a.download='eden-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export async function restore(file:File){const b=JSON.parse(await file.text());if(b.format!=='eden-gmc-pages-backup'||b.version!==1||!Array.isArray(b.enquiries)||!Array.isArray(b.media))throw new Error('Select a valid Eden backup.');for(const r of b.enquiries){if(typeof r.id!=='string'||typeof r.customerName!=='string'||!r.quote||!Array.isArray(r.media))throw new Error('Invalid customer record in backup.')}const files=[];for(const m of b.media){if(typeof m.id!=='string'||typeof m.data!=='string'||!m.data.startsWith('data:'))throw new Error('Invalid media in backup.');const {data,...meta}=m;files.push({...meta,blob:await(await fetch(data)).blob()})}const d=await db();await new Promise<void>((resolve,reject)=>{const t=d.transaction(['enquiries','media'],'readwrite');for(const m of files)t.objectStore('media').put(m);for(const r of b.enquiries)t.objectStore('enquiries').put(r);t.oncomplete=()=>resolve();t.onerror=()=>reject(new Error('Restore failed. Check available storage.'));t.onabort=()=>reject(new Error('Restore failed.'))});for(const m of files){const old=urls.get(m.id);if(old)URL.revokeObjectURL(old);urls.delete(m.id)}await hydrate()}
