export function getLink(
  type: "document" | "post",
  id: string,
  courseId: string,
) {
  if (type === "document") {
    return `/forum/courses/${courseId}/resources/${id}`;
  } else {
    return `/forum/courses/${courseId}/posts/${id}`;
  }
}
