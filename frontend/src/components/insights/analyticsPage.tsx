"use client";

import { useContext, useState } from "react";
import {
  BarChart,
  PieChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Pie,
} from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  FileText,
  Globe,
  HelpCircle,
  Languages,
  Lightbulb,
  MessageSquare,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChartContainer } from "@/components/ui/chart";
import { AnalyticsOutput } from "@forum/shared";
// Helper function to get severity color
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "low":
      return "bg-[#D8AAB5]";
    case "medium":
      return "bg-[#F5D17D]";
    case "high":
      return "bg-red-400";
    case "critical":
      return "bg-red-400";
    default:
      return "bg-gray-500";
  }
};

// Format data for charts
const formatQuestionsForChart = (questions: any[]) => {
  return questions.map((q) => ({
    name:
      q.question.length > 30 ? q.question.substring(0, 30) + "..." : q.question,
    value: q.count,
  }));
};

const formatIntentionsForChart = (intentions: string[]) => {
  const counts: Record<string, number> = {};
  intentions.forEach((intent) => {
    counts[intent] = (counts[intent] || 0) + 1;
  });

  return Object.entries(counts).map(([name, value]) => ({
    name: name
      .replace("performing task: ", "")
      .replace("clarification on", "clarify")
      .replace("elaboration on", "elaborate"),
    value,
  }));
};

const formatSourcesForChart = (sources: any[]) => {
  return sources.map((source) => ({
    name: source.type === "document" ? source.id : source.id,
    value: source.count,
    type: source.type,
  }));
};

const COLORS = ["#F5D17D", "#FCDABA", "#D8AAB5", "#B3DCD6", "#418b86"];

export default function AnalyticsDashboard({
  analytics,
}: {
  analytics: AnalyticsOutput | null;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  if (!analytics) {
    return (
      <div className="flex flex-col flex-1 overflow-auto ">
        <header className="  border-b">
          <div className="container flex items-center justify-between h-16 px-4">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <Button disabled size="sm" className="disabled">
                Export Data
              </Button>
              <Button disabled size="sm" className="disabled">
                Print Report
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-col flex-1 w-full text-neutral-500  justify-center items-center">
          <p>No analytics data available for this course</p>
        </div>
      </div>
    );
  }
  const data = analytics;
  const questionsChartData = formatQuestionsForChart(
    data.aiInsights.popularQuestions,
  );
  const intentionsChartData = formatIntentionsForChart(
    data.aiInsights.general.userIntentions,
  );
  const sourcesChartData = formatSourcesForChart(data.popularSources);

  return (
    <div className="flex flex-col flex-1 overflow-auto ">
      <header className="  border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <Button disabled size="sm" className="disabled">
              Export Data
            </Button>
            <Button disabled size="sm" className="disabled">
              Print Report
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai-insights"
                className="flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span>AI Insights</span>
              </TabsTrigger>
              <TabsTrigger
                value="engagement"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>User Engagement</span>
              </TabsTrigger>
              {/* <TabsTrigger value="sources" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Popular Sources</span>
              </TabsTrigger> */}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.userEngagement.totalUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active learners
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Threads
                  </CardTitle>
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.userEngagement.userInsights.threads}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Discussion threads
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Questions
                  </CardTitle>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.userEngagement.userInsights.questions}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Questions asked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Questions per User
                  </CardTitle>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(
                      data.userEngagement.userInsights.questions /
                      data.userEngagement.totalUsers
                    ).toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average questions per user
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Popular Questions</CardTitle>
                  <CardDescription>
                    Top questions asked by students
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ChartContainer
                    config={{
                      questions: {
                        label: "Questions",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={questionsChartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />
                        <XAxis type="number" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={150}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Bar dataKey="value" fill="#418b86" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>User Intentions</CardTitle>
                  <CardDescription>
                    Why students are using the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] px-10">
                  <ChartContainer
                    config={{
                      intentions: {
                        label: "Intentions",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={intentionsChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          labelLine={false}
                        >
                          {intentionsChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                          layout="vertical"
                          verticalAlign="middle"
                          align="left"
                          formatter={(value) => (
                            <span className="text-neutral-700 py-4 text-sm font-medium">
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
                <CardDescription>
                  Recommended actions based on analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="students">
                  <TabsList className="mb-4">
                    <TabsTrigger value="students">For Students</TabsTrigger>
                    <TabsTrigger value="instructors">
                      For Instructors
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="students" className="space-y-4">
                    {data.aiInsights.actionItems[0].students.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-full ${getSeverityColor(item.severity)}`}
                        >
                          <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {item.severity}
                        </Badge>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="instructors" className="space-y-4">
                    {data.aiInsights.actionItems[0].instructors.map(
                      (item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-4 border rounded-lg"
                        >
                          <div
                            className={`p-2 rounded-full ${getSeverityColor(item.severity)}`}
                          >
                            <AlertTriangle className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                            {item.details && (
                              <p className="mt-2 text-sm italic">
                                {item.details}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="ml-auto">
                            {item.severity}
                          </Badge>
                        </div>
                      ),
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Popular Questions</CardTitle>
                  <CardDescription>
                    Questions frequently asked by students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.aiInsights.popularQuestions.map((question, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{question.question}</h4>
                          <Badge variant="secondary">
                            {question.count} times
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {question.topics.map((topic, j) => (
                            <Badge key={j} variant="outline">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                  <CardDescription>Languages used by students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.aiInsights.general.language.map((lang, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Languages className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span>{lang}</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(100 - i * 20)}%
                            </span>
                          </div>
                          <Progress value={100 - i * 20} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Insights</CardTitle>
                  <CardDescription>
                    How students are using the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm">
                      {data.aiInsights.general.learning}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h4 className="mb-4 font-medium">User Intentions</h4>
                    <div className="space-y-2">
                      {data.aiInsights.general.userIntentions.map(
                        (intention, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{intention}</span>
                            <Progress value={100 - i * 15} className="w-1/2" />
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Engagement metrics per user</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ChartContainer
                    config={{
                      threads: {
                        label: "Threads",
                        color: "#418b86",
                      },
                      questions: {
                        label: "Questions",
                        color: "#F5D17D",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: "Per User Average",
                            threads: (
                              data.userEngagement.userInsights.threads /
                              data.userEngagement.totalUsers
                            ).toFixed(1),
                            questions: (
                              data.userEngagement.userInsights.questions /
                              data.userEngagement.totalUsers
                            ).toFixed(1),
                          },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="threads" fill="var(--color-threads)" />
                        <Bar
                          dataKey="questions"
                          fill="var(--color-questions)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Statistics</CardTitle>
                  <CardDescription>Key engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Total Users</h4>
                        <span className="text-2xl font-bold">
                          {data.userEngagement.totalUsers}
                        </span>
                      </div>
                      <Progress value={100} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Total Threads</h4>
                        <span className="text-2xl font-bold">
                          {data.userEngagement.userInsights.threads}
                        </span>
                      </div>
                      <Progress value={80} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Total Questions</h4>
                        <span className="text-2xl font-bold">
                          {data.userEngagement.userInsights.questions}
                        </span>
                      </div>
                      <Progress value={65} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">
                          Questions per Thread
                        </h4>
                        <span className="text-2xl font-bold">
                          {(
                            data.userEngagement.userInsights.questions /
                            data.userEngagement.userInsights.threads
                          ).toFixed(1)}
                        </span>
                      </div>
                      <Progress value={50} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Popular Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Sources</CardTitle>
                <CardDescription>Most referenced materials</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ChartContainer
                  config={{
                    sources: {
                      label: "Sources",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sourcesChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="References"
                        fill="var(--color-sources)"
                      >
                        {sourcesChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.type === "document" ? "#0088FE" : "#00C49F"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    Most referenced course materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.popularSources
                      .filter((source) => source.type === "document")
                      .map((source, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <span>{source.id}</span>
                          </div>
                          <Badge variant="secondary">{source.count} refs</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Webpages</CardTitle>
                  <CardDescription>
                    Most referenced external resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.popularSources
                      .filter((source) => source.type === "webpage")
                      .map((source, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-green-500" />
                            <span>{source.id}</span>
                          </div>
                          <Badge variant="secondary">{source.count} refs</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
