"use server";

import { getApiUrl } from "@/utils/helpers";

export async function signup(data: Record<string, unknown>) {

  return await fetch(`${getApiUrl()}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

}
