"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpSchema, SignUpFormValues } from "@/lib/schemas/auth";
import Link from "next/link";
import { signup } from "./actions";
import { convertObjectToSnakeCase } from "@/utils/helpers";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const signupInputStyle =
  " rounded-full w-full px-3 py-4 h-12 border border-neutral-200   focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed";

export default function SignUp() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    const res = await signup(convertObjectToSnakeCase(data));
    if (res.ok) {
      toast({
        title: "Account created",
        description: "Welcome to the Forum Community",
      });
      router.push("/forum/courses");
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-lg px-12 py-3 bg-neutral-50 rounded-xl [&_label]:pl-1">
      <CardHeader className="pl-0">
        <h2 className="text-2xl pl-0">Sign Up</h2>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className=" w-full">
              <Label htmlFor="email">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                className={signupInputStyle}
                {...register("firstName")}
                aria-invalid={errors.firstName ? "true" : "false"}
              />
              <div className="mt-1 h-6 pl-2 w-full">
                {errors.firstName && (
                  <p className="text-xs text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full">
              <Label htmlFor="email">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                className={signupInputStyle}
                {...register("lastName")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              <div className="mt-1 h-6 pl-2 w-full">
                {errors.lastName && (
                  <p className="text-xs text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="john@doe.com"
              className={signupInputStyle}
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            <div className="mt-1 h-6 pl-2 w-full">
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Strong password"
              className={signupInputStyle}
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <div className="mt-1 h-6 pl-2 w-full">
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
          <div className="">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className={signupInputStyle}
              {...register("confirmPassword")}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
            />
            <div className="h-6 pl-2 w-full">
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword.message}
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
          {isLoading ? "Creating your account..." : "Create Account"}
        </Button>
      </form>
      <div className="w-full pl-2 flex-1 pt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="underline" href="/auth/signin">
          Sign in
        </Link>
      </div>
    </Card>
  );
}
