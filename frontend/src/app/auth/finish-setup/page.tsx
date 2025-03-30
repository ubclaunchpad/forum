"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { checkUserStatus, finishSetup, type UserStatus } from "./actions";
import { cn } from "@/lib/utils";

const setupInputStyle =
  "rounded-full w-full px-3 py-4 h-12 border border-neutral-200 focus:outline-hidden focus:border-primary focus:ring-3 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed";

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  displayName: string;
  pronouns: string;
  timezone: string;
  bio: string;
}

export default function FinishSetup() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    username: "",
    displayName: "",
    pronouns: "",
    timezone: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<UserStatus | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeStatus = async () => {
      try {
        const userData = await checkUserStatus();
        setStatus(userData.status);
        setFormData((prev) => ({
          ...prev,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }));
      } catch (error) {
        console.error("Status check error:", error);
        toast.error("Failed to check user status");
      } finally {
        setLoading(false);
      }
    };

    initializeStatus();
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await finishSetup(formData);
      toast.success("Profile setup complete! Redirecting to courses...");

      // Set a timeout for navigation
      setTimeout(() => {
        router.push("/forum/courses");
      }, 1000);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to complete setup. Please try again.",
      );
      console.error("Setup error:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  if (loading) {
    return (
      <Card className="w-full max-w-lg min-h-[450px] px-12 py-3 flex shadow-lg flex-col rounded-xl items-center justify-center">
        <p>Loading...</p>
      </Card>
    );
  }

  if (status === null) {
    return (
      <Card className="w-full max-w-lg min-h-[450px] px-12 py-3 flex shadow-lg flex-col rounded-xl items-center justify-center">
        <CardHeader className="text-center">
          <h2 className="text-2xl font-semibold">Complete Setup</h2>
          <p className="text-muted-foreground mt-2"></p>
        </CardHeader>
      </Card>
    );
  }

  if (status === "waiting_for_approval") {
    return (
      <Card className="w-full max-w-lg min-h-[450px] px-12 py-3 flex shadow-lg flex-col rounded-xl items-center justify-center">
        <CardHeader className="text-center">
          <h2 className="text-2xl font-semibold">Waiting for Approval</h2>
          <p className="text-muted-foreground mt-2">
            Your account is waiting for approval. An administrator will review
            your account and approve it. Please check back later.
          </p>
        </CardHeader>
      </Card>
    );
  }

  if (status === "approve_on_login") {
    return (
      <Card className="w-full max-w-2xl min-h-[450px] px-12 py-3 flex shadow-lg flex-col rounded-xl [&_label]:pl-1">
        <CardHeader className="pl-0">
          <h2 className="text-2xl pl-0 pb-2">Complete Your Profile</h2>
        </CardHeader>
        <form onSubmit={handleSetup} className="space-y-5">
          <div className="space-y-0">
            <div className="">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                className={setupInputStyle}
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              <div className="mt-1 h-6 pl-2 w-full"></div>
            </div>
            <div className="">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                className={setupInputStyle}
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
              <div className="mt-1 h-6 pl-2 w-full"></div>
            </div>
            <div className="">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                className={setupInputStyle}
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <div className="mt-1 h-6 pl-2 w-full"></div>
            </div>
            <div className="">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="John Doe"
                className={setupInputStyle}
                value={formData.displayName}
                onChange={handleInputChange}
                required
              />
              <div className="mt-1 h-6 pl-2 w-full"></div>
            </div>
            <div className="">
              <Label htmlFor="pronouns">Pronouns</Label>
              <Input
                id="pronouns"
                placeholder="they/them"
                className={setupInputStyle}
                value={formData.pronouns}
                onChange={handleInputChange}
              />
              <div className="mt-1 h-6 pl-2 w-full"></div>
            </div>
            <div className="">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                placeholder="UTC-5"
                className={setupInputStyle}
                value={formData.timezone}
                onChange={handleInputChange}
                required
              />
              <div className="mt-1 h-6 pl-2 w-full"></div>
            </div>
            <div className="">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                className={cn(setupInputStyle, "resize-none rounded-3xl")}
                value={formData.bio}
                onChange={handleInputChange}
              />
              <div className="mt-1 h-6 pl-2 w-full"></div>
            </div>
          </div>
          <Button
            className="w-full h-12"
            size="lg"
            type="submit"
            disabled={loading}
          >
            {loading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg min-h-[450px] px-12 py-3 flex shadow-lg flex-col rounded-xl items-center justify-center">
      <CardHeader className="text-center">
        {status}
        <h2 className="text-2xl font-semibold">No Access</h2>
        <p className="text-muted-foreground mt-2">
          Cannot access this page. Please contact an administrator if you
          believe this is an error.
        </p>
      </CardHeader>
    </Card>
  );
}
