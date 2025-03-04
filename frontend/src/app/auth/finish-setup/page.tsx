"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
<<<<<<< Updated upstream
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { checkUserStatus, finishSetup, type UserStatus } from "./actions";
=======
import { getApiUrl } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
>>>>>>> Stashed changes

const setupInputStyle =
  "rounded-full w-full px-3 py-4 h-12 border border-neutral-200 focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed";

<<<<<<< Updated upstream
=======
type UserStatus = "pending_invite" | "pending_setup" | "active";

>>>>>>> Stashed changes
export default function FinishSetup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<UserStatus | null>(null);
  const router = useRouter();
<<<<<<< Updated upstream

  useEffect(() => {
    const initializeStatus = async () => {
      try {
        const userData = await checkUserStatus();
        setStatus(userData.status);
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
=======
  const supabase = createClient();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/auth/signin");
          return;
        }

        const response = await fetch(`${getApiUrl()}/users/user/status`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user status");
        }

        const data = await response.json();
        setStatus(data.status);

        // If user is active, redirect to home
        if (data.status === "active") {
          router.push("/");
          return;
        }

        // If we need to show the setup form, fetch user data
        if (data.status === "pending_setup") {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user?.user_metadata?.full_name) {
            const fullName = user.user_metadata.full_name;
            setFirstName(fullName.split(" ")[0] || "");
            setLastName(fullName.split(" ").slice(1).join(" ") || "");
          }
        }
>>>>>>> Stashed changes
      } catch (error) {
        console.error("Status check error:", error);
        toast.error("Failed to check user status");
      } finally {
        setLoading(false);
      }
    };

<<<<<<< Updated upstream
    initializeStatus();
  }, []);
=======
    checkUserStatus();
  }, [router, supabase]);
>>>>>>> Stashed changes

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
<<<<<<< Updated upstream
      await finishSetup({ firstName, lastName });
      toast.success("Profile setup complete! Redirecting to courses...");

      // Set a timeout for navigation
      setTimeout(() => {
        router.push("/forum/courses");
      }, 5000);
=======
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("No session found. Please sign in again.");
        router.push("/auth/signin");
        return;
      }

      const response = await fetch(`${getApiUrl()}/users/user/finish-setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to complete setup");
      }

      toast.success("Profile setup complete!");
      router.push("/");
>>>>>>> Stashed changes
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to complete setup. Please try again.",
      );
      console.error("Setup error:", error);
<<<<<<< Updated upstream
=======
    } finally {
>>>>>>> Stashed changes
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-lg min-h-[450px] px-12 py-3 flex shadow-lg flex-col rounded-xl items-center justify-center">
        <p>Loading...</p>
      </Card>
    );
  }

  if (status === "pending_invite") {
    return (
      <Card className="w-full max-w-lg min-h-[450px] px-12 py-3 flex shadow-lg flex-col rounded-xl items-center justify-center">
        <CardHeader className="text-center">
          <h2 className="text-2xl font-semibold">Waiting for Invitation</h2>
          <p className="text-muted-foreground mt-2">
            You need an invitation to join this platform. Please contact an
            administrator to request access.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg min-h-[450px] px-12 py-3 flex shadow-lg flex-col rounded-xl [&_label]:pl-1">
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
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
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
