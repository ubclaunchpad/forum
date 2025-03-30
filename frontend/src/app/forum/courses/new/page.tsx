"use client";
import { z } from "zod";
import { useState, useRef, useContext, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, PlusCircleIcon, UsersIcon } from "lucide-react";
import { getApiUrl } from "@/utils/helpers";
import { userContext } from "@/providers/userContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { courseSchema, CourseAccessOptions } from "@/lib/types/course";
import FindCoursesToJoin from "@/components/courses/FindCoursesToJoin";
import { checkPermissionInDomain, PERMISSIONS } from "@/lib/utils";

const inputStyle =
  "rounded-full w-full px-3 py-4 h-12 border border-neutral-200 focus:outline-hidden focus:border-primary focus:ring-3 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed";

const formSchema = courseSchema.omit({ id: true, config: true }).extend({
  name: z.string().min(4, {
    message: "Course name must be at least 4 characters long",
  }),
});

const DEFAULT_CONFIG = {
  theme_colour: "#347370",
  font: "default",
  feature_flags: {
    posts_enabled: true,
    documents_enabled: true,
    chat_enabled: false,
    ai_enabled: true,
    directory_enabled: true,
    dark_mode_enabled: false,
  },
};

export default function CoursesPage() {
  const { profile } = useContext(userContext);

  const hasCreatePermission = useMemo(() => {
    return checkPermissionInDomain(
      profile.permissions,
      PERMISSIONS.CREATE_COURSE,
    );
  }, [profile]);
  return (
    <div className="flex flex-col w-dvw h-dvh overflow-hidden bg-neutral-100 items-center justify-center">
      <section className="max-w-3xl flex flex-col  w-full">
        <Link
          className="flex flex-row items-center gap-2 py-2 hover:text-primary-500"
          href={"/forum/courses"}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to your courses
        </Link>
        <Tabs
          defaultValue="join"
          className="w-full border rounded-xl flex flex-col flex-1 min-h-[60dvh] overflow-y-scroll bg-neutral-50"
        >
          <TabsList
            className={`grid w-full  rounded-b-none rounded-t-xl min-h-12 ${hasCreatePermission ? "grid-cols-2" : "grid-cols-1"}`}
          >
            <TabsTrigger
              value="join"
              className="flex items-center h-full gap-2"
            >
              <UsersIcon className="w-4 h-4" />
              Join
            </TabsTrigger>

            {hasCreatePermission && (
              <TabsTrigger
                value="create"
                className="flex items-center h-full gap-2"
              >
                <PlusCircleIcon className="w-4 h-4" />
                Create
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="join" className="p-8">
            <FindCoursesToJoin />
          </TabsContent>

          {hasCreatePermission && (
            <TabsContent value="create" className="p-8  flex flex-col flex-1">
              <CoursesNewPage />
            </TabsContent>
          )}
        </Tabs>
      </section>
    </div>
  );
}

function CoursesNewPage() {
  const { token } = useContext(userContext);
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState<string>(
    CourseAccessOptions.unlisted.value,
  );
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const dataToValidate = {
        ...Object.fromEntries(formData.entries()),
        access: access,
      };

      const validatedData = formSchema.parse(dataToValidate);

      const requestBody = {
        ...validatedData,
        config: DEFAULT_CONFIG,
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

      const body = await res.json();
      const { id } = body;
      router.prefetch(`/forum/courses/${id}`);

      toast({
        title: "Course created",
        description: "The course has been created successfully.",
        action: (
          <ToastAction altText="View course">
            <Link href={`/forum/courses/${id}`}>View Course</Link>
          </ToastAction>
        ),
      });

      formRef.current?.reset();
      setAccess(CourseAccessOptions.unlisted.value);
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
    <div className="flex flex-col flex-1  gap-10">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 flex-1  "
      >
        <div className="flex flex-col  gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className={inputStyle}
            placeholder="Course name e.g. Introduction to AI"
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
            placeholder="Course code e.g. 123"
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
            placeholder="Course group e.g. CPSC"
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
            type="text"
            className={inputStyle}
            placeholder="Course section e.g. 1 or ALL"
            required
          />
        </div>
        <div className="flex flex-col flex-1 pt-4 border-t gap-1">
          <label htmlFor="access" className="text-sm font-medium">
            Access Level
          </label>
          <Select value={access} onValueChange={setAccess}>
            <SelectTrigger className={inputStyle}>
              <SelectValue>
                {
                  CourseAccessOptions[
                    access as keyof typeof CourseAccessOptions
                  ].label
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.values(CourseAccessOptions).map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={`${access === option.value ? "bg-primary/10" : ""}`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col justify-end   flex-1">
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-neutral-950 text-white rounded-full px-4 py-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
