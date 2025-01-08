import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { courseId, type } = await request.json();

    const tagType = type || "posts";
    const tag = `course-${courseId}-${tagType}`;

    revalidateTag(tag);

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      tag,
    });
  } catch (error) {
    console.error("Error revalidating:", error);
    return NextResponse.json({ error: "Error revalidating" }, { status: 500 });
  }
}
