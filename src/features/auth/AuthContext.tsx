'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface ClientUser {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  emailMasked: string;
  providers: string[];
  runNumber: number | null;
  accountRole: 'supporter'|'shelter';
}

export interface AuthState {
  enabled: boolean;
  user: ClientUser | null;
  resetEnabled: boolean;
  googleEnabled: boolean;
}

const AuthContext = createContext<AuthState>({ enabled: false, user: null, resetEnabled: false, googleEnabled: false });

export function AuthProvider({ value, children }: { value: AuthState; children: ReactNode }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
