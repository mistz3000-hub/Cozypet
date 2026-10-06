'use client';

import type { ChatMessage, Conversation, PersonaRef, PetListing } from '@/lib/types';
import { getHelper, getOwner } from '@/data';
import { getValue, newId, updateValue } from '@/lib/store';

/** persona จาก id (owner-/shelter-/adopter-) — คืน null เมื่อไม่พบ */
export function personaRefFor(id: string | null | undefined): PersonaRef | null {
  if (!id) return null;
  if (getOwner(id)) return { kind: 'owner', id };
  const h = getHelper(id);
  if (!h) return null;
  return { kind: h.kind === 'shelter' ? 'shelter' : 'individual', id };
}

/** 1 บทสนทนา = 1 Run + 1 persona + 1 หัวข้อ */
export function conversationIdFor(run: number, persona: PersonaRef, listingId?: string | null): string {
  return `conv-${String(run).padStart(3, '0')}-${persona.id}-${listingId || 'general'}`;
}

export function getOrCreateConversation(run: number, persona: PersonaRef, listingId?: string | null): string {
  const id = conversationIdFor(run, persona, listingId);
  if (getValue('conversations').some((c) => c.id === id)) return id;
  const ts = new Date().toISOString();
  const conv: Conversation = {
    id, runNumber: run, persona, listingId: listingId || undefined, createdAt: ts, updatedAt: ts,
    messages: [{ id: newId('msg'), role: 'system', text: 'started', createdAt: ts, status: 'read' }],
  };
  updateValue('conversations', (prev) => (prev.some((c) => c.id === id) ? prev : [conv, ...prev]));
  return id;
}

export function patchConversation(id: string, fn: (c: Conversation) => Conversation) {
  return updateValue('conversations', (prev) => prev.map((c) => (c.id === id ? { ...fn(c), updatedAt: new Date().toISOString() } : c)));
}

export function patchMessage(convId: string, msgId: string, patch: Partial<ChatMessage>) {
  return patchConversation(convId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)) }));
}

/** ประวัติที่ส่งให้ server: เฉพาะ user/assistant ไม่รวมข้อความที่ส่งไม่สำเร็จ */
export function historyFor(c: Conversation, excludeId?: string) {
  return c.messages
    .filter((m) => m.id !== excludeId && (m.role === 'user' || m.role === 'assistant') && m.status !== 'failed' && m.status !== 'sending')
    .map((m) => ({ role: m.role as 'user' | 'assistant', text: m.text }));
}

/** ประกาศของผู้ทดลอง → ฟิลด์ที่ส่งในบล็อก USER_PROVIDED_DATA (ไม่ส่งรูป) */
export function userListingPayload(l: PetListing | undefined) {
  if (!l || l.source !== 'user') return null;
  return {
    type: l.type === 'adoption' ? undefined : l.type,
    species: l.species,
    speciesOther: l.speciesOther,
    name: l.name,
    colors: l.colors,
    markings: l.markings,
    districtId: l.districtId,
    description: l.description,
    urgency: l.urgency,
  };
}
