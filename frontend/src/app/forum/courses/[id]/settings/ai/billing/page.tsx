"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function AISettingsSection() {
  const [selectedModel, setSelectedModel] = useState("gpt-4");

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="pb-2 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Billing and Payments</h1>
        <p className="text-neutral-700">
          Manage your billing information and payment methods for AI services.
        </p>
      </div>

      {/* Vectorization Settings */}

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
    </div>
  );
}
