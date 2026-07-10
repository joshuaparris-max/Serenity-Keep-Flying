import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import GamePage from "@/pages/GamePage";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

function AppRouter() {
  const { user, isLoading, isOffline } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0a0908] flex items-center justify-center font-mono text-[#d4944c]">
        LOADING CORTEX...
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/game">
        {user || isOffline ? <GamePage /> : <LandingPage />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const rawBase = import.meta.env.BASE_URL ?? "/";
  const base = rawBase.endsWith("/") ? rawBase.slice(0, -1) || "/" : rawBase;
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { pathname, search, hash } = window.location;
    if (pathname.endsWith("/index.html")) {
      const clean = pathname.replace(/\/index\.html$/, "/");
      window.history.replaceState({}, "", `${clean}${search}${hash}`);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={base}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
