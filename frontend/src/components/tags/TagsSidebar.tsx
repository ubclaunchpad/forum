"use client";

import { userContext } from "@/contexts/userContext";
import { Tag } from "@/lib/types/tags";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { getApiUrl } from "@/utils/helpers";
import { useContext, useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Button } from "../ui/button";
import { ChevronDown, PlusIcon, Settings2Icon } from "lucide-react";

export function TagsSidebar() {
  const course = useCourseStore((state) => state.course);
  const { tags } = useTasks({ courseId: course.id });
  return (
    <div className="w-full p-4 px-6">
      <Collapsible defaultOpen className="group/collapsible">
        <CollapsibleTrigger className="w-full rounded-none px-0" asChild>
          <Button
            variant={"unstyled"}
            className="text-primary-600 w-full px-0 flex items-center justify-between font-semibold"
          >
            Tags
            <ChevronDown className=" h-4 w-4 transform transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
        <div className="flex flex-col gap-4 py-2">
          <ul className="flex flex-col gap-4 ">
            {tags.map((tag) => (
              <li className="w-full flex gap-4 text-sm items-center" key={tag.id}>
                <div className="w-4 h-4 bg-primary-100 rounded"></div>
                <span className="flex-1 truncate">{tag.name}</span>

                <span className="text-sm flex-shrink-0 text-neutral-400 h-4 min-w-4 ml-auto">
                  {0}
                </span>
              </li>
            ))}
           
          </ul>
          <Button disabled size={"none"} variant={"unstyled"} className="w-full flex gap-4 justify-start  items-center text-sm" key={"create"}>
                <PlusIcon className="w-4 h-4 text-primary rounded"/>
                <span className="text-sm" >Create New</span>
              </Button>

              <Button disabled  size={"none"} variant={"unstyled"}  className="w-full flex justify-start  gap-4 items-center " key={"manage"}>
                <Settings2Icon className="w-4 h-4 text-primary rounded"/>
                <span className="text-sm" >Manage Tags</span>
              </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function useTasks({ courseId }: { courseId: string }) {
  const [tags, setTags] = useState<Tag[]>([]);
  const { token } = useContext(userContext);

  useEffect(() => {
    getTags(courseId, token).then((res) => setTags(res));
  });

  return {
    tags,
  };
}

async function getTags(id: string, token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/courses/${id}/tags`, {
      cache: "force-cache",
      next: {
        revalidate: 3600,
        tags: [`course-${id}-tags`],
      },
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.status}`);
    }

    const resp = await res.json();
    return resp.tags;
  } catch (e) {
    console.error("Error fetching posts:", e);
    return [];
  }
}
