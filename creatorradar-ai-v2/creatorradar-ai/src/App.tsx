import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import Dashboard from "./pages/Dashboard/Dashboard";
import Discovery from "./pages/Discovery/Discovery";
import Leads from "./pages/Leads/Leads";
import QuickReview from "./pages/QuickReview/QuickReview";
import DMGenerator from "./pages/DMGenerator/DMGenerator";
import Exports from "./pages/Exports/Exports";
import Settings from "./pages/Settings/Settings";
import Help from "./pages/Help/Help";

export type Page =
  | "dashboard"
  | "discovery"
  | "leads"
  | "quick-review"
  | "dm-generator"
  | "exports"
  | "settings"
  | "help";

export default function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [selectedCreatorId, setSelectedCreatorId] = useState<number | null>(null);

  function navigate(page: Page, creatorId?: number) {
    setActivePage(page);
    if (creatorId !== undefined) setSelectedCreatorId(creatorId);
  }

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return <Dashboard onNavigate={navigate} />;
      case "discovery":
        return <Discovery onCreatorAdded={() => navigate("leads")} />;
      case "leads":
        return (
          <Leads
            onOpenDM={(id) => navigate("dm-generator", id)}
            onOpenReview={() => navigate("quick-review")}
          />
        );
      case "quick-review":
        return <QuickReview />;
      case "dm-generator":
        return <DMGenerator initialCreatorId={selectedCreatorId} />;
      case "exports":
        return <Exports />;
      case "settings":
        return <Settings />;
      case "help":
        return <Help />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "var(--cr-bg)" }}>
      <Sidebar activePage={activePage} onNavigate={navigate} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar activePage={activePage} onNavigate={navigate} />
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 animate-fade-in"
          style={{ background: "var(--cr-bg)" }}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
