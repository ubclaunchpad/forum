"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpSchema, SignUpFormValues } from "@/lib/schemas/auth";
import Link from "next/link";
import { signup, signUpWithGoogle } from "./actions";
import { convertObjectToSnakeCase } from "@/utils/helpers";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { isAuthProviderSupported, supportedAnyAuthProvider } from "@/lib/utils";

const signupInputStyle =
  " rounded-full w-full px-3 py-4 h-12 border border-neutral-200   focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed";

export default function SignUp() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    const res = await signup(convertObjectToSnakeCase(data));

    if (res.ok) {
      toast({
        title: "Account created",
        description: "Welcome to the Forum Community",
      });
      router.push("/auth/signin");
    } else {
      toast({
        title: "Sign Up Error",
        description: res.error,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    const res = await signUpWithGoogle();
    if (res?.url) {
      window.location.href = res.url;
    } else {
      toast({
        title: "Google sign-up failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-xl min-h-[450px] px-12 py-3 flex shadow-lg flex-col rounded-xl [&_label]:pl-1">
      <CardHeader className="pl-0">
        <h2 className="text-2xl pl-0 pb-2">Sign Up</h2>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-0">
          
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
            <div className="mt-1 h-6 pl-2 w-full">
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Controller
              control={control}
              name="acceptTerms"
              render={({ field }) => (
                <div className="flex flex-row gap-2 items-start px-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                    aria-invalid={errors.acceptTerms ? "true" : "false"}
                  />
                  <p className="text-xs">
                    By signing up you agree to our{" "}
                    <Link href="/terms" className="underline">
                      Terms and Conditions
                    </Link>{" "}
                    and acknowledge that you have read our{" "}
                    <Link href="/privacy" className="underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              )}
            />
            <div className="mt-1 h-6 pl-2 w-full">
              {errors.acceptTerms && (
                <p className="text-xs text-red-500">
                  {errors.acceptTerms.message}
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
      {supportedAnyAuthProvider() && (
        <div className="flex flex-col py-10 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-full h-[1px] bg-neutral-200"></div>
            <span className="text-neutral-500 text-sm">OR</span>
            <div className="w-full h-[1px] bg-neutral-200"></div>
          </div>
        </div>
      )}
      {isAuthProviderSupported("google") && (
        <div className="flex justify-center">
          <Button
            onClick={handleGoogleSignUp}
            className="relative flex min-w-[250px] w-full h-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-[#1f1f1f] text-md font-medium shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none active:bg-gray-200"
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
              <span>Sign Up with Google</span>
            </div>
          </Button>
        </div>
      )}
      <div className="w-full pl-2 flex-1 pt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="underline" href="/auth/signin">
          Sign in
        </Link>
      </div>
    </Card>
  );
}
