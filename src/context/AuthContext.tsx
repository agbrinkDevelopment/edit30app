import React, { createContext, useContext } from 'react';

export type Role = 'admin' | 'player';

export interface Session {
  team: string;
  role: Role;
  // Set once /players/sign-in has resolved (role === 'player' only). Absent
  // for admins and, briefly, for a player whose sign-in request is in flight.
  playerId?: string;
}

interface AuthContextType extends Session {
  isAdmin: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ session, signOut, children }: {
  session: Session;
  signOut: () => void;
  children: React.ReactNode;
}) {
  return (
    <AuthContext.Provider value={{ ...session, isAdmin: session.role === 'admin', signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
