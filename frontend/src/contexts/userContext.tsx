"use client";

import { createContext, ReactNode } from "react";
import { User } from "@supabase/auth-js";

export const userContext = createContext({} as User);

export function UserContextProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: User;
}) {
  return <userContext.Provider value={user}>{children}</userContext.Provider>;
}
