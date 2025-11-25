'use client';
import React from "react";
import ValidarForm from "@/components/ValidarForm";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <ValidarForm onSuccess={() => window.location.reload()} />
    </div>
  );
}
