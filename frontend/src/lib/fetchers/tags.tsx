import { getApiUrl } from "@/utils/helpers";

export async function getTags(id: string, token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/courses/${id}/tags`, {
      cache: "force-cache",
      next: {
        revalidate: 3600,
        tags: [`course-${id}-tags`],
      },
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.status}`);
    }

    const resp = await res.json();
    return resp.tags;
  } catch (e) {
    console.error("Error fetching posts:", e);
    return [];
  }
}
