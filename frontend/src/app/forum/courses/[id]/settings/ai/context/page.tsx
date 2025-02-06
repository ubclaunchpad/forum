"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTextIcon, UsersIcon, BookOpenIcon } from "lucide-react";

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

const availableTags: Tag[] = [
  { id: "private", name: "Private" },
  { id: "sensitive", name: "Sensitive" },
  { id: "confidential", name: "Confidential" },
  { id: "draft", name: "Draft" },
  { id: "internal", name: "Internal" },
];

export default function AISettingsSection() {
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

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="pb-2 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Memory and Context</h1>
        <p className="text-neutral-700">
          Manage what content is included in AI learning and context.
        </p>
      </div>

      {/* Vectorization Settings */}
      <section className="flex flex-col w-full  ">
        <Tabs defaultValue="posts" className="w-full  ">
          <TabsList className="grid w-full grid-cols-3 h-fit ">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <div className="flex justify-center gap-2 py-1">
                <FileTextIcon className="w-4 h-4" />
                Posts
              </div>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <div className="flex justify-center gap-2 py-1">
                <BookOpenIcon className="w-4 h-4" />
                Documents
              </div>
            </TabsTrigger>

            <TabsTrigger value="people" className="flex items-center gap-2">
              <div className="flex justify-center gap-2 py-1">
                <UsersIcon className="w-4 h-4" />
                People
              </div>
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
    </div>
  );
}
