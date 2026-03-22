import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Layout, { type Page } from "./components/Layout";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile, useIsCallerAdmin } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";
import JobQueuePage from "./pages/JobQueuePage";
import LoginPage from "./pages/LoginPage";
import MyJobsPage from "./pages/MyJobsPage";
import SubmitJobPage from "./pages/SubmitJobPage";

export default function App() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [submitInitialPrinter, setSubmitInitialPrinter] = useState<
    string | undefined
  >();

  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: Page, printerName?: string) => {
    if (page === "submit" && printerName) {
      setSubmitInitialPrinter(printerName);
    } else if (page !== "submit") {
      setSubmitInitialPrinter(undefined);
    }
    setCurrentPage(page);
  };

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.18 0.05 230), oklch(0.23 0.06 230))",
        }}
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-400 flex items-center justify-center mx-auto animate-pulse">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <title>CloudPrint</title>
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
          </div>
          <p className="text-teal-200 text-sm">Loading CloudPrint...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  const userName =
    userProfile?.name ??
    `${identity.getPrincipal().toString().slice(0, 12)}...`;

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onNavigate={handleNavigate} />;
      case "submit":
        return <SubmitJobPage initialPrinter={submitInitialPrinter} />;
      case "myjobs":
        return <MyJobsPage />;
      case "queue":
        return <JobQueuePage />;
      case "admin":
        return isAdmin ? (
          <AdminPage />
        ) : (
          <DashboardPage onNavigate={handleNavigate} />
        );
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isAdmin={!!isAdmin}
        userName={userName}
        onLogout={handleLogout}
      >
        {renderPage()}
        <footer className="px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </Layout>
      <ProfileSetupModal open={showProfileSetup} />
      <Toaster />
    </>
  );
}
