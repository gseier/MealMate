"use client";

import React, { createContext, useContext } from "react";
import { Session, User } from "@prisma/client";

interface SessionContext {
  user: User;
  session: Session;
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContext {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      "[useSession] must be used within a <SessionProvider>."
    );
  }

  return context;
}
