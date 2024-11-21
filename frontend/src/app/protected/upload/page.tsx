"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChangeEvent, useState } from "react";

const maxSizeBytes: number = 15728640; // 15MB
const acceptedMimeTypes: string[] = ["application/pdf", "application/json", "text/plain", "text/csv", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template", "application/vnd.ms-powerpoint", 
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", 
    "application/vnd.openxmlformats-officedocument.presentationml.template", 
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    "application/vnd.ms-powerpoint.presentation.macroEnabled.12", "application/vnd.ms-word.document.macroEnabled.12"];
const acceptedMimeTypesString = acceptedMimeTypes.join(",");    

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const upload = event.target.files[0];
            if (upload.size > maxSizeBytes) {
                alert("File exceeds size limit. Please upload files smaller than 15MB.");
                setFile(null);
                return;
            }
            if (!acceptedMimeTypes.includes(upload.type)) {
                alert("Unsupported file type.");
                setFile(null);
                return;
            }
            setFile(upload);
        }
    }

    const handleSubmit = () => {
        const fetchData = async () => {
            if (file) {
                const link = `${process.env.NEXT_PUBLIC_BACKEND_URL}/courses/${1}/documents/upload/`;
                console.log(link);
                var data = new FormData()
                data.append('file', file);

                const response = await fetch(link, {
                    method: 'POST',
                    body: data               
                });
                const result = await response.json();
                console.log(response);
                alert(result);
            } else {
                console.log("no file");
            }
        };
        fetchData();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <Input type="file"
                    id="document" name="document" accept="application/pdf, application/json, text/plain, text/csv, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.wordprocessingml.template, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.openxmlformats-officedocument.presentationml.template, application/vnd.openxmlformats-officedocument.presentationml.slideshow, application/vnd.ms-powerpoint.presentation.macroEnabled.12, application/vnd.ms-word.document.macroEnabled.12"
                    onChange={handleFileChange}>
                </Input>
                <Button type="button" disabled={!Boolean(file)} onClick={handleSubmit}>
                    Submit
                </Button>
            </div>
        </div>
    );
}