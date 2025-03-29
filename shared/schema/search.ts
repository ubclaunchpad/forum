import { z } from "../deps.ts";

export const AnalyticsOutput = z.object({
    courseId: z.string().describe(
      "The id of the course that the thread belongs to",
    ),
    aiInsights: z.object({
      popularQuestions: z.array(z.object({
        question: z.string().describe(
          "The question cluster that captures a group of questions",
        ),
        count: z.number().describe("The number of times the question was asked"),
        topics: z.array(z.string()).describe(
          "The topics that the question belongs to",
        ),
      })).describe("The popular questions that the students/searchers asked"),
      general: z.object({
        language: z.array(z.string()).describe(
          "The languages that the users asked the question in sorted by frequency",
        ),
        learning: z.string().describe(
          "Describe as a group/collecitve if the AI/searches have  been used to learn something from the thread or if it was just used to answer questions or worse, their queries wanted to do their work/assignments",
        ),
  
        userIntentions: z.array(
          z.enum([
            "clarification on a specific point",
            "elaboration on a specific point",
            "other",
            "performing task: code",
            "performing task: spelling and grammar",
            "performing task: other",
            "performing task: writing",
          ]),
        ).describe(
          "The intentions of the users that asked the question sorted by frequency",
        ),
      }).describe("The general insights of the question that the user asked"),
      actionItems: z.array(z.object({
        students: z.array(z.object({
          title: z.string().describe("The title of the action item"),
          description: z.string().describe(
            "In more detail what the action item is",
          ),
          severity: z.enum(["low", "medium", "high"]).describe(
            "The severity of the action item",
          ),
        })).describe(
          "Takeaways and points from the data/queries that all students can benefit from",
        ),
        instructors: z.array(z.object({
          title: z.string().describe("The title of the action item"),
          description: z.string().describe(
            "In more detail what the action item is",
          ),
          details: z.string().optional().describe(
            "Explain if something is wrong with course content or material exposed from the data/queries",
          ),
          severity: z.enum(["low", "medium", "high", "critical"]).describe(
            "The severity of the action item",
          ),
        })).describe(
          "Takeaways and points from the data/queries that instructors can benefit from. This should be a list of actions that instructors can take to improve their teaching or what is already known to be effective.",
        ),
      })).describe(
        "The action items that the user can take to improve their learning",
      ),
    }),
  
    userEngagement: z.object({
      userInsights: z.object({
        threads: z.number().describe("The number of threads that the user has"),
        questions: z.number().describe(
          "The number of questions that the user has asked",
        ),
      }).describe("The user engagement insights averaged on users"),
      totalUsers: z.number().describe(
        "The total number of unique users that their threads were analyzed",
      ),
    }).describe("The user engagement insights"),
  
    popularSources: z.array(z.object({
      type: z.enum(["document", "webpage"]).describe("The type of the source"),
      id: z.string().describe("The id of the source"),
      count: z.number().describe("The number of times the source was used"),
    })).describe("The popular sources that the user used to answer the question"),
  });

  export type AnalyticsOutput = z.infer<typeof AnalyticsOutput>;
  