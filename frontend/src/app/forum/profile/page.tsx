"use client";

import { userContext } from "@/contexts/userContext";
import { useContext } from "react";

export default function ProfilePage() {
  const { user } = useContext(userContext);
  return <div>{<p>{user.email}</p>}</div>;
}
