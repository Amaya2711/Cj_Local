"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);
    if (!usuario || !clave) {
      setMensaje("Por favor, ingrese usuario y clave.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/sqlserver-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `SELECT * FROM USUARIO WHERE ID_USUARIO = '${usuario}' AND CLAVE = '${clave}'`
        })
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMensaje("¡Acceso exitoso! Redirigiendo...");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setMensaje("Usuario o clave incorrectos.");
      }
    } catch (err) {
      setMensaje("Error de conexión o sistema.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <form onSubmit={handleSubmit} style={{ background: "white", padding: 32, borderRadius: 12, boxShadow: "0 4px 24px #0001", minWidth: 320 }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>Inicio de Sesión</h2>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Usuario</label>
          <input
            type="text"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #e5e7eb", marginTop: 4 }}
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Clave</label>
          <input
            type="password"
            value={clave}
            onChange={e => setClave(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #e5e7eb", marginTop: 4 }}
            disabled={loading}
          />
        </div>
        {mensaje && <div style={{ color: mensaje.includes("exitoso") ? "#059669" : "#dc2626", marginBottom: 16 }}>{mensaje}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10, background: "#2563eb", color: "white", border: "none", borderRadius: 4, fontWeight: 600, fontSize: 16, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Verificando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
