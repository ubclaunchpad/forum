"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signin, signInWithGoogle } from "./actions";
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const res = await signInWithGoogle();
    if (res?.url) {
      window.location.href = res.url;
    } else {
      alert("Google sign-in failed");
    }
  };

  return (
    <Card className="w-full max-w-lg min-h-[450px] px-12 py-3 flex flex-col rounded-xl [&_label]:pl-1">
      <CardHeader className="pl-0">
        <h2 className="text-2xl pl-0 pb-2">Sign In</h2>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              placeholder="Enter your password"
              className={signinInputStyle}
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
      <div className="flex pt-4 justify-center">
        <Button
          onClick={handleGoogleSignIn}
          className="relative flex w-[250px] h-10 items-center justify-center rounded-[20px] border border-[#747775] bg-white text-[#1f1f1f] font-roboto text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none active:bg-gray-200"
        >
          <div className="absolute inset-0 opacity-0 transition-opacity duration-200 group-active:opacity-10 group-focus:opacity-10 bg-grey"></div>
          <div className="flex items-center">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5 mr-3"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              ></path>
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              ></path>
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              ></path>
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              ></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span>Sign in with Google</span>
          </div>
        </Button>
      </div>
      <div className="w-full pl-2 flex-1 pt-4 text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link className="underline" href="/auth/signup">
          Sign up
        </Link>
      </div>
    </Card>
  );
}
