"use client";

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Course } from "@/lib/types/course";
import { useState } from "react";

interface CourseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onSave: (config: CourseConfig) => void;
}

interface CourseConfig {
  theme_colour?: string;
  font?: string;
}

export function CourseSettingsModal({ isOpen, onClose, course, onSave }: CourseSettingsModalProps) {
  const [config, setConfig] = useState<CourseConfig>({
    theme_colour: course?.config?.theme_colour ?? "#000000",
    font: course?.config?.font ?? "default"
  });

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Course Settings"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme_colour">Theme Color</Label>
          <Input
            id="theme_colour"
            type="color"
            value={config.theme_colour}
            onChange={(e) => setConfig(prev => ({ ...prev, theme_colour: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="font" className="text-primary-min">Font</Label>
          <div className={`flex gap-2`}>
            {["default", "space-grotesk", "inter", "playfair-display", "roboto-mono"].map((font) => (
              <Button
                key={font}
                variant={config.font === font ? "solid" : "outline"}
                onClick={() => setConfig(prev => ({ ...prev, font }))}
                className={font === "default" ? "font-quicksand" : font === "space-grotesk" ? "font-space-grotesk" : font === "inter" ? "font-inter" : font === "playfair-display" ? "font-playfair-display" : "font-roboto-mono"}
              >
                {font}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
} 