"use client";
import { useEffect } from "react";

export default function GoogleMapsScriptLoader() {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBmtiE0jWFGUFAZXoBgF3XyXmBmJit6m6U";
    if (!apiKey || apiKey === "undefined") {
      console.error("❌ Google Maps API Key no encontrada en variables de entorno");
      return;
    }
    if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,visualization&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("✅ Google Maps JS API cargado correctamente en GoogleMapsScriptLoader");
      };
      script.onerror = (error) => {
        console.error("❌ Error cargando Google Maps script en GoogleMapsScriptLoader:", error);
      };
      document.head.appendChild(script);
    } else {
      console.log("ℹ️ Google Maps JS API ya estaba cargado en GoogleMapsScriptLoader");
    }
  }, []);
  return null;
}
