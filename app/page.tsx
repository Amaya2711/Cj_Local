"use client";
import React, { useState } from "react";
import ValidarForm from "@/components/ValidarForm";
import MainForm from "@/components/MainForm";

export default function Home() {
  const [autenticado, setAutenticado] = useState(false);
  console.log("Home montado, autenticado:", autenticado);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
      }}
    >
      {autenticado ? (
        <MainForm />
      ) : (
        <ValidarForm onSuccess={() => setAutenticado(true)} />
      )}
    </div>
  );
}
