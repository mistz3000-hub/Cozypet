import { ShelterDetail } from '@/features/shelters/ShelterDetail';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <ShelterDetail id={id}/>;}
