"use client";

import { useCourseStore } from "@/providers/courseStoreProvider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Button } from "../ui/button";
import { ArrowLeft, ChevronDown, PlusIcon, Settings2Icon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Input } from "../ui/input";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useTagsConfig from "@/hooks/useTagConfig";
import { Tag } from "@/lib/types/tags";

export function TagsSidebar() {
  const [isEditing, setIsEditing] = useState(false);
  const tags = useCourseStore((state) => state.tags);
  return (
    <div className="w-full p-4 pt-0 ">
      <Collapsible defaultOpen className="group/collapsible">
        <CollapsibleTrigger className="w-full rounded-none px-0" asChild>
          <Button
            variant={"ghost"}
            className="text-primary-600 w-full px-2 flex items-center justify-between text-md font-semibold"
          >
            Tags
            <ChevronDown className=" h-4 w-4 transform transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-0 py-2 ">
            {isEditing ? (
              <NewTagMode setIsEditing={setIsEditing} />
            ) : (
              <>
                <TagList tags={tags} level={1} />
                <Button
                  onClick={() => setIsEditing(true)}
                  variant={"ghost"}
                  className="w-full flex gap-4 justify-start px-2   items-center text-sm"
                  key={"create"}
                >
                  <PlusIcon className="w-4 h-4 text-primary rounded" />
                  <span className="text-sm">Create New</span>
                </Button>

                <Button
                  disabled
                  variant={"ghost"}
                  className="w-full flex justify-start px-2   gap-4 items-center "
                  key={"manage"}
                >
                  <Settings2Icon className="w-4 h-4 text-primary rounded" />
                  <span className="text-sm">Manage Tags</span>
                </Button>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function NewTagMode({
  setIsEditing,
}: {
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}) {
  const { addTagRequest } = useTagsConfig();

  const [tagEdit, setTagEdit] = useState({
    name: "",
    visibility: "public",
  });

  return (
    <form className="flex flex-col gap-4 ">
      <Input
        value={tagEdit.name}
        onChange={(e) => setTagEdit({ ...tagEdit, name: e.target.value })}
        placeholder="Tag Name"
        className="bg-white border-primary-muted"
      />
      <div className="flex flex-col gap-4">
        <label className="text-sm">Access:</label>
        <Select
          value={tagEdit.visibility}
          onValueChange={(value) =>
            setTagEdit({ ...tagEdit, visibility: value })
          }
        >
          <SelectTrigger className="w-full bg-white border-primary-muted">
            <SelectValue className="">
              {tagEdit.visibility === "public" ? "Everyone" : "Restricted"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="public">Everyone</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={() => {
          addTagRequest({ tagToAdd: tagEdit });
          setIsEditing(false);
        }}
        className="w-fit px-4 flex gap-2 justify-start h-fit py-2 items-center text-sm"
        key={"create"}
        variant={"outline"}
        size={"sm"}
      >
        <PlusIcon className="w-4 h-4 rounded" />
        <span className="text-sm">Create Tag</span>
      </Button>

      <Button
        onClick={() => setIsEditing(false)}
        size={"sm"}
        variant={"ghost"}
        className="w-full flex justify-start   gap-4 items-center "
        key={"manage"}
      >
        <ArrowLeft className="w-4 h-4 text-primary rounded" />
        <span className="text-sm">All tags</span>
      </Button>
    </form>
  );
}

function TagList({ tags, level }: { tags: Tag[]; level: number }) {
  return (
    <ul className="flex flex-col gap-2 pb-4 px-3 *:text-sm *:capitalize">
      {tags.map((tag) => (
        <li key={tag.id}>
          <Collapsible
            defaultOpen={level == 1}
            className={`p-0 m-0 min-h-0 w-full group/tl`}
          >
            <CollapsibleTrigger className="w-full rounded-none px-0" asChild>
              <button className="w-full flex gap-4 text-left items-center">
                {level === 1 && (
                  <div className="w-3 h-3 bg-primary-100 rounded-[2px]"></div>
                )}
                <span className="flex-1 truncate">{tag.name}</span>
                <span className="text-sm shrink-0 text-neutral-400 h-4 min-w-4 ml-auto ">
                  {tag.count?.total}
                </span>
              </button>
            </CollapsibleTrigger>
            {tag.subtags && tag.subtags.length > 0 && (
              <CollapsibleContent className="pl-1 pt-2">
                <div className="pl-6 border-l">
                  <TagList tags={tag.subtags ?? []} level={level + 1} />
                </div>
              </CollapsibleContent>
            )}
          </Collapsible>
        </li>
      ))}
    </ul>
  );
}
