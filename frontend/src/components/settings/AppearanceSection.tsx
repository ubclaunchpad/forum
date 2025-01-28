import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { courseContext } from "@/contexts/courseContext";
import { userContext } from "@/contexts/userContext";
import { getApiUrl } from "@/utils/helpers";
import { useContext, useState } from "react";

export function AppearanceSection() {
  const course = useContext(courseContext);
  const { token } = useContext(userContext);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({
    theme_colour: course.config?.theme_colour || "#000000",
    font: course.config?.font || "default",
  });

  const fontOptions = [
    { value: "default", className: "font-quicksand" },
    { value: "space-grotesk", className: "font-space-grotesk" },
    { value: "inter", className: "font-inter" },
    { value: "playfair-display", className: "font-playfair-display" },
    { value: "roboto-mono", className: "font-roboto-mono" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/courses/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: course.name,
          code: course.code,
          c_group: course.c_group,
          section: course.section,
          config: config,
          //   start_date: course.start_date,
          //   end_date: course.end_date
        }),
      });

      if (!response.ok) throw new Error("Failed to update appearance");

      toast({
        title: "Success",
        description: "Course appearance updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appearance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Look and Feel</h1>
        <p className="text-sm text-neutral-500">
          Customize your course appearance
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="theme_colour" className="text-sm font-medium">
              Theme Color
            </label>
            <Input
              id="theme_colour"
              type="color"
              value={config.theme_colour}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, theme_colour: e.target.value }))
              }
              className="w-20 h-10"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Font</label>
            <div className="flex flex-wrap gap-2">
              {fontOptions.map((font) => (
                <Button
                  key={font.value}
                  type="button"
                  variant={config.font === font.value ? "solid" : "outline"}
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, font: font.value }))
                  }
                  className={font.className}
                >
                  {font.value}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
