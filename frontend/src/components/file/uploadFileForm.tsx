"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface UploadDocumentFormProps {
  onCancel: () => void;
  onSubmit: (file: File, title: string, description?: string) => void;
}

export function UploadDocumentForm({
  onCancel,
  onSubmit,
}: UploadDocumentFormProps) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && title) {
      onSubmit(file, title);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            className="rounded-full w-full px-3 py-4 h-12 border border-neutral-200   focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
        </div>
        <div
          className={cn(
            "border rounded-2xl  bg-neutral-100 flex flex-col items-center justify-center p-12 text-center cursor-pointer min-h-80 min-w-xl duration-300",
            isDragging
              ? "border-primary bg-accent"
              : "border-neutral-200 border-dashed hover:border-primary hover:bg-primary-600 hover:bg-opacity-10",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          {file ? (
            <p className="text-base text-muted-foreground">
              Selected file: {file.name}
            </p>
          ) : (
            <p className="text-base text-muted-foreground">
              Click here to select a file
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title || !file}>
          Upload
        </Button>
      </DialogFooter>
    </form>
  );
}
