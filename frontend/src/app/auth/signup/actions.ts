"use server";

import { getApiUrl } from "@/utils/helpers";

export async function signup(data: Record<string, unknown>) {

  const res = await fetch(`${getApiUrl()}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    return { ok: false, error: await res.json() };
  }

  return { ok: true };

}
