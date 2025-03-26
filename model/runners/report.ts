import { zodResponseFormat } from "jsr:@openai/openai/helpers/zod";
import { AnalyticsOutput } from "@forum/shared";
import { getOpenAIClient, getSupabaseClient, sql } from "../util.ts";
import type { ThreadData } from "../type.ts";

const client = getOpenAIClient();
const supa = getSupabaseClient();

const AiOutput = AnalyticsOutput.pick({
  aiInsights: true,
});

export async function generateReportForAllCourses() {
  const courses = await sql`
    SELECT id FROM courses
  `;
  for (const course of courses) {
    await generateReport(course.id, { rangeInHours: 24 });
  }
}

export async function generateReport(courseId: string, options: {
  rangeInHours: number;
}) {
  const now = new Date();
  const cutoffDate = new Date(
    now.getTime() - options.rangeInHours * 60 * 60 * 1000,
  )
    .toISOString();

  const res = await sql`
    WITH MemberCount AS (
      SELECT COUNT(*) as member_count 
      FROM course_members 
      WHERE course_id = ${courseId}
    )
    SELECT 
      c.id,
      c.name,
      mc.member_count
    FROM courses c, MemberCount mc
    WHERE c.id = ${courseId}
  `;

  console.info(`Generating report for course ${courseId} - ${res[0].name}`);

  if (!res || res.length === 0) {
    throw new Error("Course not found");
  }

  const course = res[0];

  // Get all thread and history data in one optimized query
  const result = await sql`
          WITH ThreadQueries AS (
            SELECT
              st.id AS thread_id,
              st.name AS thread_name,
              st.created_at AS thread_created_at,
              st.user_id AS thread_user_id,
              sh.id AS history_id,
              sh.query,
              sh.answer,
              sh.created_at AS query_created_at,
              sh.sources
            FROM search_threads st
            JOIN search_history sh ON st.id = sh.thread_id
            WHERE st.course_id = ${course.id}
            AND sh.created_at > ${cutoffDate}
            ORDER BY st.id, sh.created_at
          )
          SELECT
            thread_id,
            thread_name,
            thread_created_at,
            thread_user_id,
            jsonb_agg(
              jsonb_build_object(
                'query', query,
                'answer', answer,
                'created_at', query_created_at,
                'sources', sources
              ) ORDER BY query_created_at
            ) AS queries
          FROM ThreadQueries
          GROUP BY thread_id, thread_name, thread_created_at, thread_user_id
        `;

  // Transform the data to match ThreadData structure
  const threadData: ThreadData[] = result.map((row) => ({
    thread_id: row.thread_id,
    thread_name: row.thread_name,
    created_at: row.thread_created_at,
    user_id: row.thread_user_id,
    queries: (row.queries || []).map((q: any) => ({
      query: q.query,
      answer: q.answer,
      created_at: q.created_at,
      sources: Array.isArray(q.sources)
        ? q.sources.map((s: any) => ({
          type: s.entity_type,
          id: s.entity_id,
        }))
        : [],
    })),
  }));

  if (threadData.length === 0) {
    return;
  }

  const resp = await client.beta.chat.completions.parse({
    model: "o3-mini-2025-01-31",
    messages: [
      {
        role: "system",
        content:
          "The following is a list of threads from a course. Analyze the threads and provide insights on the following: popular questions, general insights, action items, and user engagement. Analyze how a thread conversation has evolved to provide better insights. For example some searches might just be simple and does not require action items but there might be some that expose some issues that require action items. The course name is " +
          course.name + " and the number of members in the course is " +
          course.member_count + ".",
      },
      { role: "user", content: JSON.stringify(threadData) },
    ],
    response_format: zodResponseFormat(AiOutput, "aiInsights"),
  });

  const insights = resp.choices[0].message.parsed;
  // Skip if insights is null
  if (!insights || !insights.aiInsights) {
    console.warn("Failed to generate AI insights for course:", course.id);
    return;
  }

  // Calculate engagement metrics per user
  // Track threads and questions per user
  const userEngagementMap: Record<
    string,
    { threads: number; questions: number }
  > = {};

  threadData.forEach((thread) => {
    // Skip if no user_id
    if (!thread.user_id) return;

    // Initialize user data if not exists
    if (!userEngagementMap[thread.user_id]) {
      userEngagementMap[thread.user_id] = {
        threads: 0,
        questions: 0,
      };
    }

    // Increment thread count for this user
    userEngagementMap[thread.user_id].threads++;

    // Add question count
    userEngagementMap[thread.user_id].questions += thread.queries.length;
  });

  // Calculate total unique users
  const totalUsers = Object.keys(userEngagementMap).length;

  // Calculate average threads and questions per user
  let totalThreads = 0;
  let totalQuestions = 0;

  Object.values(userEngagementMap).forEach((data) => {
    totalThreads += data.threads;
    totalQuestions += data.questions;
  });

  const avgThreadsPerUser = totalUsers > 0 ? totalThreads / totalUsers : 0;
  const avgQuestionsPerUser = totalUsers > 0 ? totalQuestions / totalUsers : 0;

  // Find popular sources by entity_id
  const sourceMap: Record<string, { type: string; count: number }> = {};

  // Populate source map from all thread queries
  threadData.forEach((thread) => {
    thread.queries.forEach((query) => {
      if (query.sources && Array.isArray(query.sources)) {
        query.sources.forEach((source) => {
          if (!source.id) return; // Skip if no entity_id

          if (!sourceMap[source.id]) {
            sourceMap[source.id] = {
              type: source.type,
              count: 1,
            };
          } else {
            sourceMap[source.id].count++;
          }
        });
      }
    });
  });

  // Get top 10 sources with counts
  const popularSources = Object.entries(sourceMap)
    .map(([id, data]) => ({
      id,
      type: data.type,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Create a complete analysis object
  const analysisData = {
    courseId: course.id,
    courseName: course.name,
    memberCount: course.member_count,
    aiInsights: insights.aiInsights,
    userEngagement: {
      userInsights: {
        threads: avgThreadsPerUser,
        questions: avgQuestionsPerUser,
      },
      totalUsers,
    },
    popularSources,
  };

  // Save to the search_analysis table
  try {
    // First check if there's an existing analysis for this course
    const { data: existingAnalysis } = await supa
      .from("search_analysis")
      .select("id")
      .eq("course_id", course.id)
      .maybeSingle();

    if (existingAnalysis) {
      // Update existing analysis
      const { error: updateError } = await supa
        .from("search_analysis")
        .update({
          insights: analysisData,
          title: `Search Analytics for ${course.name}`,
          overview:
            `Analysis based on ${threadData.length} threads with ${totalQuestions} questions from ${totalUsers} users`,
          updated_at: new Date(),
        })
        .eq("course_id", course.id);

      if (updateError) {
        throw updateError;
      }
      // console.log(`Updated analysis for course ${course.name}`);
    } else {
      // Insert new analysis
      const { error: insertError } = await supa
        .from("search_analysis")
        .insert({
          course_id: course.id,
          title: `Search Analytics for ${course.name}`,
          overview:
            `Analysis based on ${threadData.length} threads with ${totalQuestions} questions from ${totalUsers} users`,
          insights: analysisData,
        });

      if (insertError) {
        throw insertError;
      }
      // console.log(`Created new analysis for course ${course.name}`);
    }
  } catch (error) {
    console.error("Error saving analysis:", error);
  }
}
