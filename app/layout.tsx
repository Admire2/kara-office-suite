import AskBox from "@/app/components/AskBox";
import Footer from "@/app/components/Footer";
import Orchestrator from "./components/Orchestrator";
import PromptLogger from "./components/PromptLogger";
import ErrorCatcher from "./components/ErrorCatcher";
import SessionTracker from './components/SessionTracker';
import AffiliateWidget from './components/AffiliateWidget';
import ReferralTracker from './components/ReferralTracker';
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
        <PromptLogger />
        <ErrorCatcher />
        <ReferralTracker />
        <AffiliateWidget />
        <SessionTracker />
        <Sidebar />
        <div className="flex-1 overflow-y-auto">{children}
        <Footer />
        </div>
            <Orchestrator />
          
    <AskBox />
    </body>
    </html>
  );
}
