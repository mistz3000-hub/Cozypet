import { NextResponse } from 'next/server';
import { randomInt } from 'node:crypto';
import pets from '@/data/qr-pets.json';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(req:Request){
  const previous=new URL(req.url).searchParams.get('previous');
  const candidates=pets.filter(p=>p.sourceHash!==previous);const pool=candidates.length?candidates:pets;
  if(!pool.length)return NextResponse.json({ok:false},{status:503});
  return NextResponse.json({ok:true,pet:pool[randomInt(pool.length)]},{headers:{'Cache-Control':'no-store'}});
}
