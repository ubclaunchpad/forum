import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SignInPage = () => {
  return (
    <div className = "flex flex-col justify-center items-center h-screen">

        <div className = "flex flex-col "> 
            <p className = "font-bold text-left">Username or Email</p>
            <Input
                    type="email"
                    placeholder="email"
                    className="max-w-xs bg-gray-700 text-white border-gray-600"
                />
            <p >Password</p>
            <Input type="password"
                    placeholder="password"
                    className="max-w-xs bg-gray-700 text-white border-gray-600"
                />
            
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                    Sign In
            </Button>
        </div>
        
    </div>
  
  );
};

export default SignInPage;
