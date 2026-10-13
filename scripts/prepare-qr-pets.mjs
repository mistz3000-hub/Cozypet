/** Prepare web previews; original user files are never changed or committed. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
const source=process.argv[2];
if(!source)throw new Error('Usage: node scripts/prepare-qr-pets.mjs <image-folder>');
const files=(await fs.readdir(source,{withFileTypes:true})).filter(f=>f.isFile()&&/\.(jpe?g|png|webp|gif)$/i.test(f.name)).map(f=>f.name).sort();
const dir=path.resolve('public/media/qr-pets');await fs.mkdir(dir,{recursive:true});
const manifest=[];
for(const [i,file] of files.entries()){
  const raw=await fs.readFile(path.join(source,file));const id=`pet-${String(i+1).padStart(3,'0')}`;
  // GIF uses its first frame, allowing the complete folder to fit the free hosting budget.
  const output=await sharp(raw,{animated:false}).rotate().resize({width:640,height:640,fit:'inside',withoutEnlargement:true}).webp({quality:76}).toBuffer();
  const meta=await sharp(output).metadata();await fs.writeFile(path.join(dir,`${id}.webp`),output);
  manifest.push({id,src:`/media/qr-pets/${id}.webp`,width:meta.width,height:meta.height,sourceHash:createHash('sha256').update(raw).digest('hex'),sourceExtension:path.extname(file).toLowerCase()});
}
await fs.writeFile('src/data/qr-pets.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Prepared ${manifest.length} previews. Original files unchanged.`);
