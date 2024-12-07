"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface UploadDocumentFormProps {
  onCancel: () => void
  onSubmit: (
    file: File,
    title: string,
    description?: string
  ) => void
}

export function UploadDocumentForm({ onCancel, onSubmit }: UploadDocumentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && title) {
      onSubmit(file, title, description);
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      setFile(e.dataTransfer.files[0]);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  }

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
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter document description"
            className="resize-none"
          />
        </div>

        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer",
            isDragging ? "border-primary bg-accent" : "border-muted-foreground/25"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          {file ? (
            <p className="text-sm text-muted-foreground">
              Selected file: {file.name}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click here to select a file
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={!title || !file}
        >
          Upload
        </Button>
      </DialogFooter>
    </form>
  )
}