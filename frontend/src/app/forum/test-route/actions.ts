"use server";

import { getApiUrl } from "@/utils/helpers";

export async function fetchUserData(userId: string) {
  try {
    const res = await fetch(
      `${getApiUrl()}/chat/userChannels?user_id=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await res.json();

    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return [];
  }
}
