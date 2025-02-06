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

export function TagsSidebar() {
  const [isEditing, setIsEditing] = useState(false);
  const tags = useCourseStore((state) => state.tags);
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
            {isEditing ? (
              <NewTagMode setIsEditing={setIsEditing} />
            ) : (
              <>
                <ul className="flex flex-col gap-4 ">
                  {tags.map((tag) => (
                    <li
                      className="w-full flex capitalize gap-4 text-sm items-center"
                      key={tag.id}
                    >
                      <div className="w-4 h-4 bg-primary-100 rounded"></div>
                      <span className="flex-1 truncate">{tag.name}</span>

                      <span className="text-sm flex-shrink-0 text-neutral-400 h-4 min-w-4 ml-auto">
                        {0}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => setIsEditing(true)}
                  size={"none"}
                  variant={"unstyled"}
                  className="w-full flex gap-4 justify-start  items-center text-sm"
                  key={"create"}
                >
                  <PlusIcon className="w-4 h-4 text-primary rounded" />
                  <span className="text-sm">Create New</span>
                </Button>

                <Button
                  disabled
                  size={"none"}
                  variant={"unstyled"}
                  className="w-full flex justify-start  gap-4 items-center "
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
      />
      <div className="flex flex-col gap-4">
        <label className="text-sm">Access:</label>
        <Select
          value={tagEdit.visibility}
          onValueChange={(value) =>
            setTagEdit({ ...tagEdit, visibility: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {tagEdit.visibility === "public" ? "Everyone" : "Restricted"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="public">Everyone</SelectItem>
              {/* <SelectItem value="restricted">Restricted</SelectItem> */}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={() => {
          addTagRequest({ tagToAdd: tagEdit });
          setIsEditing(false);
        }}
        className="w-full flex gap-4 justify-start h-fit py-2 items-center text-sm"
        key={"create"}
        variant={"solid"}
        size={"sm"}
        icon={"none"}
      >
        <PlusIcon className="w-4 h-4 text-primary rounded" />
        <span className="text-sm">Create Tag</span>
      </Button>

      <Button
        onClick={() => setIsEditing(false)}
        size={"none"}
        variant={"unstyled"}
        className="w-full flex justify-start   gap-4 items-center "
        key={"manage"}
      >
        <ArrowLeft className="w-4 h-4 text-primary rounded" />
        <span className="text-sm">All tags</span>
      </Button>
    </form>
  );
}
