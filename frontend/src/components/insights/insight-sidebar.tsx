"use client";

import { useToast } from "@/hooks/use-toast";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { userContext } from "@/providers/userContext";
import { getApiUrl } from "@/utils/helpers";
import { PlusIcon } from "lucide-react";
import { useContext } from "react";
import { MainSidebar } from "../general/FourmTabs";
import { Button } from "../ui/button";

export function InsightSidebar() {
  const { token } = useContext(userContext);
  const { toast } = useToast();
  const course = useCourseStore((state) => state.course);
  async function generateReport() {
    const res = await fetch(
      `${getApiUrl()}/search/courses/${course.id}/searches/report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (res.ok) {
      toast({
        title: "Generating a new report",
        description:
          "Working hard to generate a new report; check back in a few minutes",
      });
    } else {
      toast({
        title: "Failed to generate report",
        description: "Please try again",
      });
    }
  }

  return (
    <MainSidebar className={false ? "hidden xl:block" : "flex flex-col"}>
      <div className="flex flex-row justify-center items-center w-full h-16 px-2">
        <Button
          size="lg"
          className="w-fit font-semibold px-4 min-h-none h-fit py-2"
          onClick={generateReport}
        >
          <PlusIcon className="min-h-5 min-w-5" />
          Generate Report
        </Button>
      </div>
    </MainSidebar>
  );
}
