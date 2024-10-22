"use client";

import React, {
  useState,
  ChangeEvent,
  FormEvent,
  MouseEventHandler,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormData, signup, login } from "./actions";

const SignInPage = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);

    try {
      console.log(`Attempting sign in with:`, formData);
      // Here you would call your specific endpoint
      await signup(formData);
      console.log(`sign in successful!`);
    } catch (error) {
      console.error(`sign in failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);

    try {
      console.log("Attempt login for: " + formData);
      await login(formData);
      console.log("Log in successful");
    } catch (error) {
      console.error(`log in failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <form className="flex flex-col gap-4 w-full max-w-xs">
        <div className="flex flex-col gap-2">
          <p className="font-bold text-left">Username or Email</p>
          <Input
            type="email"
            name="email"
            placeholder="email"
            value={formData.email}
            onChange={handleInputChange}
            className="bg-gray-700 text-white border-gray-600"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <p>Password</p>
          <Input
            type="password"
            name="password"
            placeholder="password"
            value={formData.password}
            onChange={handleInputChange}
            className="bg-gray-700 text-white border-gray-600"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleSignup}
            className="bg-purple-600 hover:bg-purple-500 text-white flex-1"
            disabled={isLoading}
          >
            Sign In
          </Button>
          <Button
            type="button"
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-500 text-white flex-1"
            disabled={isLoading}
          >
            Login
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SignInPage;
