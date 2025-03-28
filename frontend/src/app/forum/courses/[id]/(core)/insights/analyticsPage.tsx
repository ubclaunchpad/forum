"use client";

import { AnalyticsOutput } from "@forum/shared";
import {
  TrendingUpIcon,
  Users,
  FileText,
  MessageCircle,
  AlertTriangle,
  BookOpen,
  BarChart3,
  Languages,
  BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Separator } from "@/components/ui/separator";
import { useContext } from "react";
import { userContext } from "@/providers/userContext";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { getApiUrl } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function PopularQuestionItem({
  question,
  count,
  topics,
}: {
  question: string;
  count: number;
  topics: string[];
}) {
  return (
    <div className="flex flex-col gap-1 py-2 border-b border-neutral-100 last:border-0">
      <div className="flex flex-row gap-2 items-center">
        <TrendingUpIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
        <p className="text-neutral-800">{question}</p>
        <Badge
          variant="outline"
          className="ml-auto bg-primary-100 text-primary-600 border-primary-200"
        >
          {count}×
        </Badge>
      </div>
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1 ml-7">
          {topics.map((topic, i) => (
            <Badge
              key={i}
              variant="outline"
              className="bg-neutral-100 text-neutral-600 px-2 py-0.5 border-neutral-200"
            >
              {topic}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: "low" | "medium" | "high" | "critical";
}) {
  const variants = {
    low: "bg-blue-100 text-blue-600 border-blue-200",
    medium: "bg-yellow-100 text-yellow-600 border-yellow-200",
    high: "bg-orange-100 text-orange-600 border-orange-200",
    critical: "bg-red-100 text-red-600 border-red-200",
  };

  return (
    <Badge variant="outline" className={cn("px-2 py-0.5", variants[severity])}>
      {severity}
    </Badge>
  );
}

function ActionItem({
  title,
  description,
  severity,
  details,
}: {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  details?: string;
}) {
  return (
    <div className="flex flex-col gap-2 py-3 border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-2">
        <AlertTriangle
          className={cn(
            "w-5 h-5",
            severity === "low"
              ? "text-blue-500"
              : severity === "medium"
                ? "text-yellow-500"
                : severity === "high"
                  ? "text-orange-500"
                  : "text-red-500",
          )}
        />
        <h4 className="font-medium text-neutral-800">{title}</h4>
        <div className="ml-auto">
          <SeverityBadge severity={severity} />
        </div>
      </div>
      <p className="text-sm text-neutral-600 ml-7">{description}</p>
      {details && (
        <p className="text-sm text-neutral-600 ml-7 italic">{details}</p>
      )}
    </div>
  );
}

function PopularSourceItem({
  type,
  id,
  count,
}: {
  type: "document" | "webpage";
  id: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-neutral-100 last:border-0">
      {type === "document" ? (
        <FileText className="w-5 h-5 text-primary-600" />
      ) : (
        <BookOpen className="w-5 h-5 text-primary-600" />
      )}
      <span className="text-neutral-800 truncate" title={id}>
        {id}
      </span>
      <Badge
        variant="outline"
        className="ml-auto bg-primary-100 text-primary-600 border-primary-200"
      >
        {count}
      </Badge>
    </div>
  );
}

export default function AnalyticsPage({
  analytics,
  loading,
}: {
  analytics: AnalyticsOutput | null;
  loading: boolean;
}) {
  const { token } = useContext(userContext);
  const { toast } = useToast();
  const course = useCourseStore((state) => state.course);
  async function generateReport() {
    const res = await fetch(
      `${getApiUrl()}/search/courses/${course.id}/searches/report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (res.ok) {
      toast({
        title: "Report generated successfully",
        description:
          "The report has been generated and is available in the reports section",
      });
    } else {
      toast({
        title: "Failed to generate report",
        description: "Please try again",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex w-full relative flex-1 justify-center items-center">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-medium text-neutral-600">Loading...</h2>
        </div>
        <div className="loading-shimmer-fast bg-neutral-100 border absolute flex-1 h-full w-full" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex justify-center items-center p-8">
        <Button onClick={generateReport}>Generate Report</Button>
        <h1 className="text-2xl font-medium text-neutral-600">
          No analytics data available
        </h1>
      </div>
    );
  }

  const { aiInsights, userEngagement, popularSources } = analytics;

  return (
    <div className="flex flex-col gap-6 w-full pb-10 flex-1 overflow-y-auto px-10 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-neutral-800">Insights</h1>
        <p className="text-neutral-600">
          Course insights and user engagement metrics
        </p>
        <Button onClick={generateReport}>Generate Report</Button>
      </div>

      {/* Summary Cards */}
      <div className="flex flex-row gap-10 justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-36 h-36 rounded-full bg-primary-100 animate-pulse opacity-50"></div>
            <div className="w-32 h-32 rounded-full bg-primary-50 border-2 border-primary-200 flex items-center justify-center shadow-md">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary-600">
                  {aiInsights.popularQuestions.length}
                </span>
                <span className="text-sm font-medium text-primary-700">
                  Questions
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            <span className="text-sm">Unique question clusters</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-36 h-36 rounded-full bg-primary-100 animate-pulse opacity-50"></div>
            <div className="w-32 h-32 rounded-full bg-primary-50 border-2 border-primary-200 flex items-center justify-center shadow-md">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary-600">
                  {userEngagement.totalUsers}
                </span>
                <span className="text-sm font-medium text-primary-700">
                  Users
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Users className="w-5 h-5 text-primary-600" />
            <span className="text-sm">Active unique users</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-36 h-36 rounded-full bg-primary-100 animate-pulse opacity-50"></div>
            <div className="w-32 h-32 rounded-full bg-primary-50 border-2 border-primary-200 flex items-center justify-center shadow-md">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary-600">
                  {popularSources.length}
                </span>
                <span className="text-sm font-medium text-primary-700">
                  Sources
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <span className="text-sm">Learning resources</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Popular Questions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5 text-primary-600" />
                Popular Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="flex flex-col pr-1">
                  {aiInsights.popularQuestions.length > 0 ? (
                    aiInsights.popularQuestions.map((item, index) => (
                      <PopularQuestionItem
                        key={index}
                        question={item.question}
                        count={item.count}
                        topics={item.topics}
                      />
                    ))
                  ) : (
                    <p className="text-neutral-600 text-sm py-2">
                      No popular questions recorded yet
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary-600" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {aiInsights.actionItems.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-neutral-700 mb-2">
                      For Instructors
                    </h4>
                    <ScrollArea className="h-60">
                      <div className="flex flex-col pr-1">
                        {aiInsights.actionItems.flatMap((item) =>
                          item.instructors.map((action, idx) => (
                            <ActionItem
                              key={`instructor-${idx}`}
                              title={action.title}
                              description={action.description}
                              severity={action.severity}
                              details={action.details}
                            />
                          )),
                        )}
                      </div>
                    </ScrollArea>

                    <Separator className="my-4" />

                    <h4 className="font-medium text-neutral-700 mb-2">
                      For Students
                    </h4>
                    <ScrollArea className="h-60">
                      <div className="flex flex-col pr-1">
                        {aiInsights.actionItems.flatMap((item) =>
                          item.students.map((action, idx) => (
                            <ActionItem
                              key={`student-${idx}`}
                              title={action.title}
                              description={action.description}
                              severity={action.severity}
                            />
                          )),
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <p className="text-neutral-600 text-sm py-2">
                    No action items available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* User Insights */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                User Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Total Users</span>
                  <span className="font-medium text-neutral-800">
                    {userEngagement.totalUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">
                    Avg. Threads per User
                  </span>
                  <span className="font-medium text-neutral-800">
                    {userEngagement.userInsights.threads}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-600">
                    Avg. Questions per User
                  </span>
                  <span className="font-medium text-neutral-800">
                    {userEngagement.userInsights.questions}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Insights */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary-600" />
                General Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Languages */}
              <div>
                <h4 className="flex items-center gap-2 font-medium text-neutral-700 mb-2">
                  <Languages className="w-4 h-4 text-primary-600" />
                  Languages
                </h4>
                <div className="flex flex-wrap gap-1">
                  {aiInsights.general.language.map((lang, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-sm bg-neutral-100 text-neutral-600 border-neutral-200"
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Learning */}
              <div>
                <h4 className="flex items-center gap-2 font-medium text-neutral-700 mb-2">
                  <BookOpen className="w-4 h-4 text-primary-600" />
                  Learning Focus
                </h4>
                <p className="text-sm text-neutral-600">
                  {aiInsights.general.learning}
                </p>
              </div>

              <Separator />

              {/* User Intentions */}
              <div>
                <h4 className="flex items-center gap-2 font-medium text-neutral-700 mb-2">
                  <BarChart3 className="w-4 h-4 text-primary-600" />
                  User Intentions
                </h4>
                <div className="flex flex-wrap gap-1">
                  {aiInsights.general.userIntentions.map((intention, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-sm bg-neutral-100 text-neutral-600 border-neutral-200"
                    >
                      {intention}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Sources */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                Popular Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-60">
                <div className="flex flex-col pr-1">
                  {popularSources.length > 0 ? (
                    popularSources.map((source, index) => (
                      <PopularSourceItem
                        key={index}
                        type={source.type}
                        id={source.id}
                        count={source.count}
                      />
                    ))
                  ) : (
                    <p className="text-neutral-600 text-sm py-2">
                      No popular sources recorded yet
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
