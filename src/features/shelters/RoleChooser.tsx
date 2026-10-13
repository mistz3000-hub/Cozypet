'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/features/auth/AuthContext';
import { updateProfileRemote } from '@/features/auth/sync-client';
import { useDemoSession } from '@/lib/store';
import type { AccountRole } from '@/lib/types';
import { PetFrame } from '@/features/business/PetFrame';
import { Button,ButtonLink } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Badge';
import s from './shelters.module.css';
export function RoleChooser(){
  const {m}=useI18n();const c=m.community;const {user}=useAuth();const [{mascot}]=useDemoSession();const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState(false);
  async function choose(role:AccountRole){if(busy||!user)return;setBusy(true);setError(false);const ok=await updateProfileRemote({accountRole:role});setBusy(false);if(!ok){setError(true);return;}router.refresh();router.push(role==='shelter'?'/shelter/manage':'/dashboard');}
  return <PetFrame mascot={mascot}><h2>{c.role}</h2><div className={s.columns}>{(['supporter','shelter'] as const).map(role=><div key={role} className={`${s.item} ${s.roleCard}`}><h3>{c[role]}</h3><p>{role==='shelter'?c.shelterDesc:c.supporterDesc}</p>{user?<Button variant={user.accountRole===role?'primary':'secondary'} disabled={busy} onClick={()=>void choose(role)}>{role==='shelter'?c.manage:m.header.dashboard}</Button>:<ButtonLink variant="primary" href={role==='shelter'?'/login?next=/shelter/manage':'/scan'}>{role==='shelter'?c.login:m.nav.startHelping}</ButtonLink>}</div>)}</div><p className={s.muted}>{c.roleHint}</p>{error?<Notice tone="error">{c.errors.unavailable}</Notice>:null}</PetFrame>;
}
