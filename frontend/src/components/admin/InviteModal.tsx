"use client";

import { useState } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface InviteModalProps {
  onSubmit: (email: string) => Promise<void>;
  onClose: () => void;
}

export default function InviteModal({ onSubmit, onClose }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(email);
      onClose();
    } catch (err) {
      console.log(err);
      setError("Failed to send invite. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">
          Invite New User
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            <Mail className="w-4 h-4" />
            {isSubmitting ? "Sending..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
