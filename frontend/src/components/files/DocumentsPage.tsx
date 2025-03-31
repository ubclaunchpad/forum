"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SettingsIcon, ChevronLeftIcon, BookmarkIcon } from "lucide-react";
import { DocumentListSidebar } from "./DocumentListSidebar";
import { getApiUrl } from "@/utils/helpers";
import FileViewer from "./FileViewer";
import { userContext } from "@/providers/userContext";
import { MainListPanel, MainSidebar } from "../general/FourmTabs";
import { NewDocumentButton } from "./NewDocumentButton";
import { cn, getRelativeTimeString } from "@/lib/utils";
import { GetDocument } from "@forum/shared";
import { TagsSidebar } from "../tags/TagsSidebar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCourseStore } from "@/providers/courseStoreProvider";
import {
  DocumentPopoverOptions,
  DocumentViewHeaderWrapper,
} from "./document-sections";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const DocumentsPageWrapper = ({
  initialDocument,
}: {
  initialDocument?: string;
}) => {
  const setDocuments = useCourseStore((state) => state.setDocuments);
  const documents = useCourseStore((state) => state.documents);
  const { token } = useContext(userContext);
  const course = useCourseStore((state) => state.course);
  const { data } = useQuery({
    queryKey: ["documents", course.id],
    queryFn: () => getDocuments(course.id, token),
  });
  const docsToPass = documents ? documents : [];
  useEffect(() => {
    if (data) {
      setDocuments(data.documents);
    }
  }, [data]);

  return <DocumentsPage documents={docsToPass} selectedId={initialDocument} />;
};

async function getDocuments(id: string, token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/documents/courses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return {
        documents: [],
        error: `Failed to fetch documents: ${res.status}`,
      };
    }

    const body = await res.json();
    return {
      documents: (body?.documents || []) as GetDocument[],
      error: null,
    };
  } catch (e) {
    console.error("Error fetching documents:", e);
    return {
      documents: [],
      error: (e as Error).message,
    };
  }
}

function DocumentsPage({
  documents,
  selectedId,
}: {
  documents: GetDocument[];
  selectedId?: string;
}) {
  const courseId = useCourseStore((state) => state.course.id);
  const { token } = useContext(userContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GetDocument | null>(
    selectedId
      ? documents.find((file) => file.id === selectedId) || null
      : null,
  );
  useEffect(() => {
    setSelectedFile(documents.find((file) => file.id === selectedId) || null);
  }, [selectedId]);

  async function handleDelete() {
    if (!selectedFile) return;
    setIsDeleting(true);
    const res = await fetch(
      `${getApiUrl()}/documents/document/${selectedFile.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      toast.error("Failed to delete document");
    } else {
      await queryClient.invalidateQueries({
        queryKey: ["documents", courseId],
      });
      toast.success("Document deleted");
      router.push(`/forum/courses/${courseId}/resources`);
    }
    setIsDeleting(false);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex flex-row w-full relative flex-1">
        <MainSidebar className={selectedFile ? "hidden xl:flex" : ""}>
          <NewDocumentButton />
          <TagsSidebar />
          <div className="flex flex-col text-primary-600 gap-2 p-2 px-3 justify-end font-semibold flex-1 items-stretch">
            <Button variant="ghost" className="w-full">
              <div className="flex flex-1 flex-row items-center gap-2">
                Saved Documents
                <BookmarkIcon className="min-h-3 min-w-3" />
              </div>
              <span className="text-xs text-neutral-500">0</span>
            </Button>

            <Button variant="ghost" className="w-full">
              <div className="flex flex-1 flex-row items-center gap-2">
                Course Settings
              </div>
              <SettingsIcon className="min-h-3 min-w-3" />
            </Button>
            <Button variant="ghost" className="w-full">
              <div className="flex flex-1 flex-row items-center gap-2">
                Collapse Sidebar
              </div>
              <ChevronLeftIcon className="min-h-3 min-w-3" />
            </Button>
          </div>
        </MainSidebar>
        <MainListPanel
          className={cn(selectedFile ? "hidden  xl:flex" : "", "bg-white")}
        >
          <DocumentListSidebar files={documents} selectedFile={selectedFile} />
        </MainListPanel>

        <div
          className={cn(
            "flex relative flex-col flex-1 overflow-hidden border-l border-neutral-200",
            selectedFile ? "" : "xl:flex hidden",
          )}
        >
          {isDeleting && (
            <div className="flex flex-col z-20    h-full w-full absolute left-0  blur-to-max border-primary-muted  ">
              <div className="flex flex-col border-primary-muted flex-1  w-full">
                <div className="flex flex-col border-primary-muted flex-1 justify-center items-center  w-full">
                  <span className="text-md text-primary-900 font-medium">
                    Deleting...
                  </span>
                </div>
              </div>
            </div>
          )}
          {selectedFile ? (
            <>
              <DocumentViewHeaderWrapper
                options={{
                  canNavigateBack: true,
                  navigateBackUrl: `/forum/courses/${courseId}/resources`,
                }}
              >
                <div className="flex justify-end  items-center gap-0.5 text-neutral-700 flex-1">
                  <h2 className=" font-medium text-sm h-full text-center align-middle">
                    {selectedFile.updated_at &&
                      getRelativeTimeString(
                        new Date(selectedFile.updated_at).getTime(),
                        "en",
                        30,
                      )}
                  </h2>
                  <DocumentPopoverOptions
                    document={selectedFile}
                    actions={{
                      handleDelete: handleDelete,
                    }}
                  />
                </div>
              </DocumentViewHeaderWrapper>

              <div className="flex flex-col flex-1 overflow-hidden">
                <FileViewer document={selectedFile} />
              </div>
            </>
          ) : (
            <div className="xl:flex hidden justify-center flex-1 items-center text-neutral-500 shrink-0 w-full transition-all duration-300 ">
              Select a document to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
