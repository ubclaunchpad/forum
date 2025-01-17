"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { userContext } from "@/contexts/userContext";
import { getApiUrl } from "@/utils/helpers";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { Check, Trash2, Pencil, Settings, X } from "lucide-react";

interface Course {
  id: number;
  c_group: string;
  code: string;
  section: string;
  name: string;
}

export default function CoursesPage() {
  const { token } = useContext(userContext);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Course | null>(null);

  useEffect(() => {
    if (!token) return;
    const getCourses = async () => {
      const res = await fetch(`${getApiUrl()}/courses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const { courses } = await res.json();

      return courses;
    };
    getCourses().then((courses) => setCourses(courses));
  }, [token]);

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setEditForm(course);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSave = async () => {
    if (!editForm) return;
    
    try {
      const courseToUpdate = {
        c_group: editForm.c_group,
        code: parseInt(editForm.code),
        section: parseInt(editForm.section),
        name: editForm.name
      };

      const res = await fetch(`${getApiUrl()}/courses/${editForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseToUpdate),
      });

      if (res.ok) {
        const updatedCourse = await res.json();
        setCourses(courses.map(course => 
          course.id === editForm.id ? updatedCourse : course
        ));
        setEditingId(null);
        setEditForm(null);
      } else {
        const errorData = await res.json();
        console.error("Failed to update course:", errorData);
      }
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const res = await fetch(`${getApiUrl()}/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Remove the course from the local state
        setCourses(courses.filter(course => course.id !== courseId));
      } else {
        const errorData = await res.json();
        console.error("Failed to delete course:", errorData);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen items-center bg-primary-900 justify-center">
      <Card className="w-full max-w-2xl rounded-xl p-4 py-8 h-full bg-neutral-50 max-h-[600px] ">
        <div className="flex items-center pb-4 justify-between">
          <h3 className="font-semibold">Your Courses</h3>
          <Link href="/forum/courses/new">
            <Button variant="solid" size="sm">
              Add Course
            </Button>
          </Link>
        </div>
        <ul className="bg-neutral-100 rounded-lg border border-neutral-200 overflow-hidden">
          {courses.map((course) => (
            <li key={course.id}>
              <div className="flex no-underline items-center justify-between gap-2 p-2 rounded-lg bg-neutral-100 hover:bg-primary-100">
                {editingId === course.id ? (
                  <>
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        className="w-20"
                        value={editForm?.c_group}
                        onChange={(e) => setEditForm(prev => ({ ...prev!, c_group: e.target.value }))}
                      />
                      <Input
                        className="w-20"
                        value={editForm?.code}
                        onChange={(e) => setEditForm(prev => ({ ...prev!, code: e.target.value }))}
                      />
                      <Input
                        className="w-20"
                        value={editForm?.section}
                        onChange={(e) => setEditForm(prev => ({ ...prev!, section: e.target.value }))}
                      />
                      <Input
                        className="flex-1"
                        value={editForm?.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev!, name: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="p-2 hover:text-green-600 transition-colors"
                        onClick={handleSave}
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        className="p-2 hover:text-red-600 transition-colors"
                        onClick={handleCancel}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      className="flex flex-1 no-underline items-center gap-2"
                      href={`/forum/courses/${course.id}`}
                    >
                      <span className="w-20">{course.c_group}</span>
                      <span className="w-20">{course.code}</span>
                      <span className="w-20">{course.section}</span>
                      <span className="w-full">{course.name}</span>
                    </Link>
                    <div className="flex gap-2">
                      <button 
                        className="p-2 hover:text-blue-600 transition-colors"
                        onClick={() => handleEdit(course)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button className="p-2 hover:text-gray-600 transition-colors">
                        <Settings size={18} />
                      </button>
                      <button 
                        className="p-2 hover:text-red-600 transition-colors"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
