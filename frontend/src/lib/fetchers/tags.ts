import { getApiUrl } from "@/utils/helpers";

export async function getTags(id: string, token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/courses/${id}/tags`, {
      next: {
        tags: [`course-${id}-tags`],
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch tags: ${res.status}`);
    }

    const resp = await res.json();
    return resp.tags;
  } catch (e) {
    console.error("Error fetching tags:", e);
    return [];
  }
}
