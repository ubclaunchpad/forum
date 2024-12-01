import { Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Star, MessageSquare, FolderOpen, MoreVertical, Upload } from 'lucide-react'
import { useState, useEffect } from "react"
import FileUpload from '@/components/course/fileUpload'

export default function ResourcesTab() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const getFiles = async () => {
      
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
          {/* File List */}
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">filename</span>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <FileUpload />
          </div>

          {/* Empty State */}
          <div className="flex h-[500px] items-center justify-center rounded-lg border">
            <div className="text-center">
              <div className="mx-auto mb-4 h-20 w-20 text-muted-foreground">
                <FileText className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium">Select a file to view</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}