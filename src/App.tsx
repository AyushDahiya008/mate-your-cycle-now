
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useFlowMateStore } from "./lib/store";
import SplashScreen from "./components/SplashScreen";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import CalendarView from "./components/CalendarView";
import LogPeriod from "./components/LogPeriod";
import Navigation from "./components/Navigation";
import Auth from "./components/Auth";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { 
    onboardingComplete, 
    currentView, 
    user, 
    isLoading,
    fetchUserData 
  } = useFlowMateStore();
  
  // Hydrate the store and check auth status when the app loads
  useEffect(() => {
    useFlowMateStore.persist.rehydrate();
    fetchUserData();
  }, [fetchUserData]);
  
  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const renderMainContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "calendar":
        return <CalendarView />;
      case "log":
        return <LogPeriod />;
      case "insights":
        return (
          <div className="p-4 h-full flex flex-col items-center justify-center">
            <h1 className="text-2xl font-medium">Coming Soon</h1>
            <p className="text-muted-foreground">Insights will be available in a future update</p>
          </div>
        );
      case "settings":
        return (
          <div className="p-4 h-full flex flex-col items-center justify-center">
            <h1 className="text-2xl font-medium">Coming Soon</h1>
            <p className="text-muted-foreground">Settings will be available in a future update</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  // Show loader if we're checking auth status
  if (isLoading && !showSplash) {
    return (
      <div className="min-h-screen flowmate-gradient flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {showSplash ? (
          <SplashScreen onComplete={handleSplashComplete} />
        ) : !onboardingComplete ? (
          <Onboarding onComplete={() => {}} />
        ) : !user ? (
          // Show auth screen if not logged in
          <div className="min-h-screen flowmate-gradient">
            <Auth />
          </div>
        ) : (
          <div className="min-h-screen flowmate-gradient pb-20">
            {renderMainContent()}
            <Navigation />
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
