import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { siteUrl } from '@/server/supabase/config';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(req:Request){
  const nonce=new URL(req.url).searchParams.get('t');if(!nonce||!/^[0-9a-f-]{36}$/.test(nonce))return NextResponse.json({ok:false},{status:400});
  const url=`${siteUrl()}/demo/qr?t=${nonce}`;
  const svg=await QRCode.toString(url,{type:'svg',errorCorrectionLevel:'M',margin:4,width:260});
  return NextResponse.json({ok:true,url,image:`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`},{headers:{'Cache-Control':'no-store'}});
}
