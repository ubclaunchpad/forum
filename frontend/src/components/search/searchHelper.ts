export function getLink(
  type: "document" | "post",
  id: string,
  courseId: string,
) {
  if (type === "document") {
    return `/forum/courses/${courseId}/resources?fileId=${id}`;
  } else {
    return `/forum/courses/${courseId}/posts/${id}`;
  }
}
