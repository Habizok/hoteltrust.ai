import { ImageResponse } from "next/og";

export const alt = "HotelTrust: Personalvermittlung für Hotellerie und Gastronomie in Österreich";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#EAF3E0",
          padding: 72,
          color: "#12301F",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "#1F7A45", display: "flex", alignItems: "center", justifyContent: "center", color: "#F6D96B", fontSize: 40, fontWeight: 700 }}>
            H
          </div>
          <div style={{ fontSize: 42, fontWeight: 700, display: "flex" }}>
            Hotel<span style={{ color: "#1F7A45" }}>Trust</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.05, display: "flex", flexWrap: "wrap" }}>
            Saisonkräfte, auf die Sie sich verlassen können.
          </div>
          <div style={{ fontSize: 32, marginTop: 28, color: "#3A5444", display: "flex" }}>
            Personalvermittlung für Hotellerie und Gastronomie in Österreich
          </div>
        </div>
        <div style={{ width: 220, height: 14, background: "#F6D96B", borderRadius: 7, display: "flex" }} />
      </div>
    ),
    size,
  );
}
