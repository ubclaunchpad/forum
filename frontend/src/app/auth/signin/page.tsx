"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signin } from "./actions";
import { convertObjectToSnakeCase } from "@/utils/helpers";
import { signInSchema, SignInFormValues } from "@/lib/schemas/auth";

const signinInputStyle =
  "rounded-full w-full px-3 py-4 h-12 border border-neutral-200 focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    const res = await signin(convertObjectToSnakeCase(data));
    if (res.ok) {
      alert("Signed in successfully");
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-lg min-h-[450px] px-12 py-3 flex flex-col bg-neutral-50 rounded-xl [&_label]:pl-1">
      <CardHeader className="pl-0">
        <h2 className="text-2xl pl-0 pb-2">Sign In</h2>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="space-y-0">
          <div className="">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="john@doe.com"
              className={signinInputStyle}
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            <div className="h-6 pl-2 w-full">
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className={signinInputStyle}
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <div className="h-6 pl-2 w-full">
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
        </div>
        <Button
          className="w-full h-12"
          size="lg"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <div className="w-full pl-2 flex-1 h-full   items-end flex pt-4 text-sm text-muted-foreground">
        {"Don't have an account? "}
        <Link className="underline" href="/auth/signup">
          Sign up
        </Link>
      </div>
    </Card>
  );
}
