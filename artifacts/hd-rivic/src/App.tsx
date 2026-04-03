import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

// Pages
import Home from "@/pages/home";
import Properties from "@/pages/properties/index";
import PropertyDetail from "@/pages/properties/[id]";
import Login from "@/pages/login";
import Admin from "@/pages/admin/index";
import NotFound from "@/pages/not-found";

let _navigateToLogin: (() => void) | null = null;
let _showSessionExpired: (() => void) | null = null;

export function handle401() {
  queryClient.clear();
  if (_showSessionExpired) _showSessionExpired();
  if (_navigateToLogin) _navigateToLogin();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error: any) => {
        if (error?.status === 401) handle401();
      },
    },
  },
});

function GlobalErrorHandler() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (registeredRef.current) return;
    registeredRef.current = true;
    _navigateToLogin = () => setLocation("/login");
    _showSessionExpired = () =>
      toast({
        title: "Sesión expirada",
        description: "Por favor inicia sesión nuevamente.",
        variant: "destructive",
      });
    return () => {
      _navigateToLogin = null;
      _showSessionExpired = null;
    };
  }, [setLocation, toast]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/propiedades" component={Properties} />
      <Route path="/propiedades/:id" component={PropertyDetail} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <GlobalErrorHandler />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
