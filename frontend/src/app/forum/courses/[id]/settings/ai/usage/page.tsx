"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MicroscopeIcon,
  BookIcon,
  RocketIcon,
  BrainIcon,
  HeartIcon,
  UserIcon,
  Settings2Icon,
} from "lucide-react";

// Types
interface QuotaConfig {
  used: number;
  total: number;
}

interface RoleSettings {
  showTokens: boolean;
  quota: {
    questions: QuotaConfig;
    tokens: QuotaConfig;
  };
  selectedStyle: string;
  allowStyleChoice: boolean;
  systemPrompt: string;
}

const agentStyles = [
  {
    id: "analytical",
    label: "Analytical",
    icon: <MicroscopeIcon className="w-4 h-4" />,
    description: "Structured, methodical approach with step-by-step analysis",
  },
  {
    id: "academic",
    label: "Academic",
    icon: <BookIcon className="w-4 h-4" />,
    description: "Scholarly tone with detailed explanations and references",
  },
  {
    id: "innovative",
    label: "Innovative",
    icon: <RocketIcon className="w-4 h-4" />,
    description: "Creative problem-solving with modern approaches",
  },
  {
    id: "cognitive",
    label: "Cognitive",
    icon: <BrainIcon className="w-4 h-4" />,
    description: "Focus on learning psychology and student engagement",
  },
  {
    id: "supportive",
    label: "Supportive",
    icon: <HeartIcon className="w-4 h-4" />,
    description: "Encouraging and student-centered approach",
  },
  {
    id: "adaptive",
    label: "Adaptive",
    icon: <UserIcon className="w-4 h-4" />,
    description: "Personalizes approach based on student needs",
  },
];

export default function AISUsageSettingsSection() {
  const [roleSettings, setRoleSettings] = useState<
    Record<string, RoleSettings>
  >({
    admin: {
      showTokens: false,
      quota: {
        questions: { used: 0, total: -1 },
        tokens: { used: 0, total: -1 },
      },
      selectedStyle: "analytical",
      allowStyleChoice: true,
      systemPrompt:
        "You are an AI teaching assistant focused on helping administrators manage educational content.",
    },
    staff: {
      showTokens: false,
      quota: {
        questions: { used: 15, total: 100 },
        tokens: { used: 7500, total: 50000 },
      },
      selectedStyle: "academic",
      allowStyleChoice: true,
      systemPrompt:
        "You are an AI teaching assistant focused on helping teachers create and manage course content.",
    },
    student: {
      showTokens: false,
      quota: {
        questions: { used: 15, total: 50 },
        tokens: { used: 7500, total: 25000 },
      },
      selectedStyle: "supportive",
      allowStyleChoice: false,
      systemPrompt:
        "You are an AI teaching assistant focused on helping students learn and understand course materials.",
    },
  });

  const handleQuotaChange = (role: string, type: "questions" | "tokens", value: number) => {
    setRoleSettings((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        quota: {
          ...prev[role].quota,
          [type]: {
            ...prev[role].quota[type],
            total: value,
          },
        },
      },
    }));
  };

  const handleSystemPromptChange = (role: string, value: string) => {
    setRoleSettings((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        systemPrompt: value,
      },
    }));
  };

  // Component for quota display in role settings
  const QuotaDisplay = ({ role }: { role: string }) => {
    const settings = roleSettings[role];
    const showTokens = settings.showTokens;
    const quota = settings.quota;
    const isAdmin = role === "admin";

    return (
      <div className="flex flex-col gap-4 rounded-lg p-4">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setRoleSettings((prev) => ({
                ...prev,
                [role]: {
                  ...prev[role],
                  showTokens: !prev[role].showTokens,
                },
              }));
            }}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <span className="font-medium">Daily Limit:</span>
            {showTokens ? (
              <span>
                {quota.tokens.used}/
                {quota.tokens.total === -1 ? "∞" : quota.tokens.total} tokens
              </span>
            ) : (
              <span>
                {quota.questions.used}/
                {quota.questions.total === -1 ? "∞" : quota.questions.total}{" "}
                questions
              </span>
            )}
          </button>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-700 h-2 rounded-full transition-all"
              style={{
                width: `${
                  quota[showTokens ? "tokens" : "questions"].total === -1
                    ? 50
                    : (quota[showTokens ? "tokens" : "questions"].used /
                        quota[showTokens ? "tokens" : "questions"].total) *
                      100
                }%`,
              }}
            />
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Question Limit</label>
                <Input
                  type="number"
                  value={
                    quota.questions.total === -1 ? "" : quota.questions.total
                  }
                  placeholder="No limit"
                  onChange={(e) =>
                    handleQuotaChange(
                      role,
                      "questions",
                      parseInt(e.target.value) || -1,
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Token Limit</label>
                <Input
                  type="number"
                  value={quota.tokens.total === -1 ? "" : quota.tokens.total}
                  placeholder="No limit"
                  onChange={(e) =>
                    handleQuotaChange(
                      role,
                      "tokens",
                      parseInt(e.target.value) || -1,
                    )
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="pb-2 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">User Groups</h1>
        <p className="text-neutral-700">
          Manage how your course members experience AI.
        </p>
      </div>

      <section className="flex flex-col w-full">
        <Tabs defaultValue="admin" className="w-full ">
          <TabsList className="grid w-full grid-cols-3 h-fit">
            <TabsTrigger value="admin">
              <div className="flex justify-center gap-2 py-1">
                <Settings2Icon className="w-4 h-4" />
                Admin
              </div>
            </TabsTrigger>
            <TabsTrigger value="staff">
              <div className="flex justify-center gap-2 py-1">
                <BookIcon className="w-4 h-4" />
                Staff
              </div>
            </TabsTrigger>
            <TabsTrigger value="student">
              <div className="flex justify-center gap-2 py-1">
                {" "}
                <UserIcon className="w-4 h-4" />
                Student
              </div>
            </TabsTrigger>
          </TabsList>

          {["admin", "staff", "student"].map((role) => (
            <TabsContent key={role} value={role} className="space-y-6 p-4">
              {/* Usage Limits */}
              <section className="flex flex-col w-full ">
                <h2 className="text-lg font-semibold py-2">Usage Limits</h2>
                <QuotaDisplay role={role} />
              </section>

              {/* AI Agent Style */}
              <section className="flex flex-col w-full ">
                <h2 className="text-lg font-semibold py-2">AI Agent Style</h2>
                <div className="flex flex-col gap-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agentStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setRoleSettings((prev) => ({
                            ...prev,
                            [role]: {
                              ...prev[role],
                              selectedStyle: style.id,
                            },
                          }));
                        }}
                        className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                          roleSettings[role].selectedStyle === style.id
                            ? "border-primary-500 bg-primary-50"
                            : "border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <div className="mt-1">{style.icon}</div>
                        <div className="text-left">
                          <h3 className="font-medium">{style.label}</h3>
                          <p className="text-sm text-neutral-600">
                            {style.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between py-4 px-2 bg-neutral-50 rounded-lg">
                    <div className="space-y-0.5">
                      <h3 className="font-medium">Allow Style Choice</h3>
                      <p className="text-sm text-neutral-600">
                        Let {role}s select their preferred AI interaction style
                      </p>
                    </div>
                    <Switch
                      checked={roleSettings[role].allowStyleChoice}
                      onCheckedChange={(checked) => {
                        setRoleSettings((prev) => ({
                          ...prev,
                          [role]: {
                            ...prev[role],
                            allowStyleChoice: checked,
                          },
                        }));
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* System Prompt */}
              <section className="flex flex-col w-full ">
                <h2 className="text-lg font-semibold py-2">System Prompt</h2>
                <div className="py-4 space-y-4">
                  <p className="text-sm text-neutral-600">
                    Customize the AI's base behavior and knowledge for this
                    role.
                  </p>
                  <Textarea
                    value={roleSettings[role].systemPrompt}
                    onChange={(e) =>
                      handleSystemPromptChange(role, e.target.value)
                    }
                    placeholder={`Enter system prompt for ${role}s...`}
                    className="min-h-[100px]"
                  />
                </div>
              </section>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
