"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { courseContext } from "@/contexts/courseContext";
import { userContext } from "@/contexts/userContext";
import { getApiUrl } from "@/utils/helpers";
import {
  MicroscopeIcon,
  BookIcon,
  RocketIcon,
  BrainIcon,
  HeartIcon,
  UserIcon,
  Settings2Icon,
  FileTextIcon,
  UsersIcon,
  BookOpenIcon,
  TagIcon,
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

interface Tag {
  id: string;
  name: string;
}

interface VectorizationConfig {
  enabled: boolean;
  autoLearn: boolean;
  excludeTags?: string[];
  excludeTagged?: boolean;
}

interface VectorizationSettings {
  posts: VectorizationConfig;
  documents: VectorizationConfig;
  people: VectorizationConfig;
}

// Constants
const models = [
  {
    id: "gpt-4",
    name: "GPT-4",
    description: "Most capable model, best for complex tasks",
  },
  {
    id: "gpt-3.5",
    name: "GPT-3.5",
    description: "Fast and efficient for simpler tasks",
  },
  {
    id: "claude-3",
    name: "Claude 3",
    description: "Balanced performance and capabilities",
  },
];

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

const availableTags: Tag[] = [
  { id: "private", name: "Private" },
  { id: "sensitive", name: "Sensitive" },
  { id: "confidential", name: "Confidential" },
  { id: "draft", name: "Draft" },
  { id: "internal", name: "Internal" },
];

export function AISettingsSection() {
  const course = useContext(courseContext);
  const { token } = useContext(userContext);
  const { toast } = useToast();

  // Core state
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4");

  // Vectorization settings
  const [vectorizationSettings, setVectorizationSettings] =
    useState<VectorizationSettings>({
      posts: {
        enabled: true,
        autoLearn: true,
        excludeTags: [],
        excludeTagged: false,
      },
      documents: {
        enabled: true,
        autoLearn: false,
        excludeTags: [],
        excludeTagged: false,
      },
      people: {
        enabled: true,
        autoLearn: true,
      },
    });

  // Role-specific settings
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

  // Event Handlers
  const handleVectorizationChange = (
    type: keyof VectorizationSettings,
    field: keyof VectorizationConfig,
    value: boolean | string[],
  ) => {
    setVectorizationSettings((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleQuotaChange = (role: string, type: string, value: number) => {
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

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${getApiUrl()}/courses/${course.id}/ai-settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            vectorization: vectorizationSettings,
            roleSettings,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update AI settings");
      }

      toast({
        title: "Success",
        description: "AI settings updated successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update AI settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Component for vectorization settings tab content
  const VectorizationTabContent = ({
    type,
  }: {
    type: keyof VectorizationSettings;
  }) => {
    const settings = vectorizationSettings[type];
    const hasTagSupport = type !== "people";

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between py-4 px-2 bg-neutral-50 rounded-lg">
          <div className="space-y-0.5">
            <h3 className="font-medium">Enable Vectorization</h3>
            <p className="text-sm text-neutral-600">
              {type === "posts" && "Index posts for AI learning and retrieval"}
              {type === "documents" && "Process documents for AI context"}
              {type === "people" && "Learn from user interactions and profiles"}
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) =>
              handleVectorizationChange(type, "enabled", checked)
            }
          />
        </div>

        {settings.enabled && (
          <>
            <div className="flex items-center justify-between py-4 px-2 bg-neutral-50 rounded-lg">
              <div className="space-y-0.5">
                <h3 className="font-medium">Learning Mode</h3>
                <p className="text-sm text-neutral-600">
                  {type === "posts" &&
                    "Choose how posts are processed for learning"}
                  {type === "documents" &&
                    "Choose how documents are processed for learning"}
                  {type === "people" &&
                    "Choose how user data is processed for learning"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">Manual</span>
                <Switch
                  checked={settings.autoLearn}
                  onCheckedChange={(checked) =>
                    handleVectorizationChange(type, "autoLearn", checked)
                  }
                />
                <span className="text-sm text-neutral-600">Auto</span>
              </div>
            </div>

            {hasTagSupport && (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 px-2 bg-neutral-50 rounded-lg">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Tagged Content</h3>
                    <p className="text-sm text-neutral-600">
                      Choose how to handle tagged content
                    </p>
                  </div>
                  <Switch
                    checked={settings.excludeTagged}
                    onCheckedChange={(checked) =>
                      handleVectorizationChange(type, "excludeTagged", checked)
                    }
                  />
                </div>

                {!settings.excludeTagged && settings.excludeTags && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Exclude Specific Tags
                    </label>
                    <Select
                      value={settings.excludeTags.join(",")}
                      onValueChange={(value) =>
                        handleVectorizationChange(
                          type,
                          "excludeTags",
                          value.split(","),
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select tags to exclude" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
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
        <h1 className="text-2xl font-semibold">AI Settings</h1>
        <p className="text-neutral-700">
          Manage how your course incorporates AI.
        </p>
      </div>

      {/* Vectorization Settings */}
      <section className="flex flex-col w-full">
        <h2 className="text-lg font-semibold pb-4">Learning & Indexing</h2>
        <Tabs defaultValue="posts" className="w-full border rounded-xl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileTextIcon className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              People
            </TabsTrigger>
          </TabsList>

          {["posts", "documents", "people"].map((type) => (
            <TabsContent key={type} value={type} className="p-4 space-y-4">
              <VectorizationTabContent
                type={type as keyof VectorizationSettings}
              />
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Model Selection */}
      <section className="flex flex-col w-full rounded-lg">
        <h2 className="text-lg font-semibold pb-4">Model Selection</h2>
        <div className="py-4 space-y-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-sm text-neutral-500">
                      {model.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-neutral-600">
            Select the AI model that will be used for processing course content
            and interactions.
          </p>
        </div>
      </section>

      {/* Role Settings */}
      <section className="flex flex-col w-full">
        <h2 className="text-lg font-semibold pb-4">Role-specific Settings</h2>
        <Tabs defaultValue="admin" className="w-full border rounded-xl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="admin">
              <div className="flex items-center gap-2">
                <Settings2Icon className="w-4 h-4" />
                Admin
              </div>
            </TabsTrigger>
            <TabsTrigger value="staff">
              <div className="flex items-center gap-2">
                <BookIcon className="w-4 h-4" />
                Staff
              </div>
            </TabsTrigger>
            <TabsTrigger value="student">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Student
              </div>
            </TabsTrigger>
          </TabsList>

          {["admin", "staff", "student"].map((role) => (
            <TabsContent key={role} value={role} className="space-y-6 p-4">
              {/* Usage Limits */}
              <section className="flex flex-col w-full border rounded-lg p-4">
                <h2 className="text-lg font-semibold py-2">Usage Limits</h2>
                <QuotaDisplay role={role} />
              </section>

              {/* AI Agent Style */}
              <section className="flex flex-col w-full border rounded-lg p-4">
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
              <section className="flex flex-col w-full border rounded-lg p-4">
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

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
