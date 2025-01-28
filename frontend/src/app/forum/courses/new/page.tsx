"use client";
import { z } from "zod";
import { useState, useRef, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { getApiUrl } from "@/utils/helpers";
// import { useRouter } from "next/navigation";
import { userContext } from "@/contexts/userContext";

const inputStyle =
  "rounded-full w-full px-3 py-4 h-12 border border-neutral-200 focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed";

const formSchema = z.object({
  name: z.string().min(6, {
    message: "Course name must be at least 6 characters long",
  }),
  code: z.coerce.number().int().positive(),
  c_group: z.string(),
  section: z.coerce.number().int().positive(),
});

// Add these constants at the top of the file
const DEFAULT_CONFIG = {
  theme_colour: "#000000",
  font: "default"
};

export default function CoursesNewPage() {
  const { token } = useContext(userContext);

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  // const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const dataToValidate = Object.fromEntries(formData.entries());
      const validatedData = formSchema.parse(dataToValidate);

      // Add the default config to the request body
      const requestBody = {
        ...validatedData,
        config: DEFAULT_CONFIG
      };

      const res = await fetch(`${getApiUrl()}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error("Failed to create course");
      }

      // const body = await res.json();
      // const { id } = body;

      toast({
        title: "Course created",
        description: "The course has been created successfully.",
        action: <ToastAction altText="View course"
         >View course</ToastAction>,
      });

      formRef.current?.reset();
    } catch (e) {
      if (e instanceof z.ZodError) {
        toast({
          title: e.errors[0].message,
          description:
            "Form validation failed. Please check the form and try again.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } else {
        toast({
          title: (e as Error).message,
          description: "Please check the form and try again.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-dvw h-dvh items-center justify-center">
      <section className="max-w-xl bg-neutral-50 flex flex-col w-full border rounded-lg gap-10 shadow p-8">
        <h3 className="font-semibold">New Course</h3>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={inputStyle}
              placeholder="Course name"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="code" className="text-sm font-medium">
              Code
            </label>
            <input
              id="code"
              name="code"
              type="number"
              className={inputStyle}
              placeholder="Course code"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="c_group" className="text-sm font-medium">
              Course Group
            </label>
            <input
              id="c_group"
              name="c_group"
              type="text"
              className={inputStyle}
              placeholder="Course group"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="section" className="text-sm font-medium">
              Section
            </label>
            <input
              id="section"
              name="section"
              type="number"
              className={inputStyle}
              placeholder="Course section"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-primary text-white rounded-full px-4 py-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
        </form>
      </section>
    </div>
  );
}
