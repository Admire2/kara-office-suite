import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "FounderPilot AI",
  description: "AI tools for entrepreneurs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="min-h-screen flex"
        style={{ backgroundColor: "#020617", color: "#f8fafc" }}
      >
        <Sidebar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </body>
    </html>
  );
}
