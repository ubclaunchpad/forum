"use server";

import { getApiUrl } from "@/utils/helpers";

export async function signup(user_data: Record<string, unknown>) {
  const res = await fetch(`${getApiUrl()}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user_data),
  });

  const response_data = await res.json();

  if (!res.ok) {
    return { ok: false, error: response_data.detail };
  }

  return { ok: true };
}
