"use client";

import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { User, Pencil, Trash2 } from "lucide-react";

type FormProps = {
  title: string;
  tagName: string;
  placeholder: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

const Form = ({ title, tagName, placeholder, value, onChange }: FormProps) => {
  return (
    <div className="flex flex-col items-start gap-[10px] flex-1">
      <p className="self-stretch">{title}</p>
      <Input
        type="text"
        name={tagName}
        placeholder={placeholder}
        className="bg-white text-white border-gray-600"
        required
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

type ProfileProps = {
  image_file?: string;
  name: string;
  email: string;
  pronouns: string;
};

const Profile = ({ image_file, name, email, pronouns }: ProfileProps) => {
  const handleUserType = async () => {
    // TODO: add invite functionality
  };

  return (
    <div className="flex justify-between items-center self-stretch">
      <div className="flex items-center gap-[29px]">
        {image_file ? (
          <>
            {/* TODO: image file upload */}
            <img
              src={image_file}
              alt="profile"
              className="h-14 w-14 rounded-full"
            />
          </>
        ) : (
          <User size={40} />
        )}
        <div className="flex flex-col items-start gap-2">
          <div className="flex justify-center items-center gap-4">
            {name}
            <p>{pronouns}</p>
          </div>
          <div>
            <p>{email}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <Button
          type="button"
          size="sm"
          onClick={handleUserType}
          className="bg-orange-400 hover:bg-blue-500 text-white flex-1"
        >
          Instructor
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleUserType}
          className="bg-transparent hover:bg-blue-500 text-white flex-1"
        >
          <Pencil size={20} color="black" />
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleUserType}
          className="bg-transparent hover:bg-blue-500 text-white flex-1"
        >
          <Trash2 size={20} color="black" />
        </Button>
      </div>
    </div>
  );
};

const CreateCoursePage = () => {
  const router = useRouter();

  const [courseGroup, setCourseGroup] = useState<string | undefined>("");
  const [courseCode, setCourseCode] = useState<string | undefined>("");
  const [courseSection, setCourseSection] = useState<string | undefined>("");
  const [courseName, setCourseName] = useState<string | undefined>("");

  // can refactor later to combine into one handler using a key-value pair
  const handleCourseGroupInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setCourseGroup(newValue);
  };
  const handleCourseCodeInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setCourseCode(newValue);
  };
  const handleCourseSectionInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setCourseSection(newValue);
  };
  const handleCourseNameInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setCourseName(newValue);
  };

  const handleInvite = async () => {
    // TODO: add invite functionality
  };

  const handlePublish = async () => {
    // TODO: add publish functionality
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col items-start gap-20 w-1/2 min-w-[200px]">
        <div className="flex flex-col items-start gap-12 self-stretch">
          <h1 className="self-stretch">Create a course</h1>
          <div className="flex flex-col items-start gap-[19px] self-stretch">
            <div className="flex items-center gap-[73px] self-stretch">
              <Form
                title="Course Group"
                tagName="courseGroup"
                placeholder="e.g. CPSC"
                onChange={handleCourseGroupInputChange}
              />
              <Form
                title="Course Code"
                tagName="courseCode"
                placeholder="e.g. 110"
                onChange={handleCourseCodeInputChange}
              />
              <Form
                title="Course Section (optional)"
                tagName="courseSection"
                placeholder="e.g. 101/103"
                onChange={handleCourseSectionInputChange}
              />
            </div>
            <div className="w-1/2">
              <Form
                title="Course Name"
                tagName="courseName"
                placeholder="e.g. Computation, programs, and programming"
                onChange={handleCourseNameInputChange}
              />
            </div>
            <div className="flex flex-col items-start gap-[30px] w-full">
              <div className="flex flex-col items-start gap-2 self-stretch">
                <p className="self-stretch">Add Administrators</p>
                <div className="flex items-start gap-2 self-stretch">
                  <Input
                    type="text"
                    name="addAdministrators"
                    placeholder="Add Administrators"
                    className="bg-white text-white border-gray-600"
                    required
                  />
                  <Button
                    type="button"
                    onClick={handleInvite}
                    className="bg-blue-600 hover:bg-blue-500 text-white flex-1"
                  >
                    Invite
                  </Button>
                </div>
              </div>
              {/* TODO: add logic for multiple profiles */}
              <Profile
                name="Gregor Kiczales"
                email="email@ubc.ca"
                pronouns="He/Him/His"
              />
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end">
          <Button
            type="button"
            onClick={handlePublish}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            Publish Course
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;
