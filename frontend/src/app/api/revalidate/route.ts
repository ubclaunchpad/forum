import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json();
    revalidateTag(`course-${courseId}-posts`);

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    console.error("Error revalidating:", error);
    return NextResponse.json({ error: "Error revalidating" }, { status: 500 });
  }
}
