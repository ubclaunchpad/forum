"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { User } from "@supabase/auth-js";
import { getApiUrl } from "@/utils/helpers";

type Account = {
  user: User;
  profile: Record<string, unknown>;
  token: string;
};

export const userContext = createContext({} as Account);

export function UserContextProvider({
  children,
  user,
  token,
}: {
  children: ReactNode;
  user: User;
  token: string;
}) {
  const [account, setAccount] = useState<Account>({} as Account);

  const getProfile = useCallback(async () => {
    const res = await fetch(`${getApiUrl()}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const profile = await res.json();
    setAccount({
      user,
      profile,
      token,
    });
  }, [user, token]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  if (!account.user) {
    return <div></div>;
  }

  return (
    <userContext.Provider value={account}>{children}</userContext.Provider>
  );
}
