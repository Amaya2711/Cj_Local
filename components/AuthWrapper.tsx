"use client";
import React, { useState } from "react";
import LoginForm from "./LoginForm";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

  if (!user) {
    return <LoginForm onLogin={setUser} />;
  }

  return <>{children}</>;
}