import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  createBrowserRouter, 
  RouterProvider, 
  createRoutesFromElements, 
  Route, 
  Outlet 
} from "react-router-dom";
import { WaterLevelProvider } from "./context/WaterLevelContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Alert from "@/pages/Alert";
import Precautions from "@/pages/Precautions";
import AI from "@/pages/AI";
import LocationPage from "@/pages/Location";
import Analysis from "@/pages/Analysis";

// Create router with future flags
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={
        <>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8">
            <Outlet />
          </main>
          <Footer />
        </>
      }
    >
      <Route path="/" element={<Index />} />
      <Route path="/location" element={<LocationPage />} />
      <Route path="/alert" element={<Alert />} />
      <Route path="/precautions" element={<Precautions />} />
      <Route path="/ai" element={<AI />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    } as any, // Temporary type assertion for future flags
  }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <WaterLevelProvider>
        <RouterProvider 
          router={router} 
          fallbackElement={<div>Loading...</div>} 
        />
      </WaterLevelProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
