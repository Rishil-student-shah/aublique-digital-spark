import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Works from "./pages/Works";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import AdminProjects from "./pages/admin/Projects";
import ContactDetailsAdmin from "./pages/admin/ContactDetails";
import InquiriesAdmin from "./pages/admin/Inquiries";
import Analytics from "./pages/admin/Analytics";
import WebDevelopment from "./pages/services/WebDevelopment";
import CyberSecurity from "./pages/services/CyberSecurity";
import ProjectDetail from "./pages/ProjectDetail";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Admin routes - no Navbar/Footer */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="contact" element={<ContactDetailsAdmin />} />
              <Route path="inquiries" element={<InquiriesAdmin />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

            {/* Public routes */}
            <Route path="/" element={<><Navbar /><Index /><Footer /></>} />
            <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
            <Route path="/works" element={<><Navbar /><Works /><Footer /></>} />
            <Route path="/works/:slug" element={<><Navbar /><ProjectDetail /><Footer /></>} />
            <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
            <Route path="/services/web-development" element={<><Navbar /><WebDevelopment /><Footer /></>} />
            <Route path="/services/cyber-security" element={<><Navbar /><CyberSecurity /><Footer /></>} />
            <Route path="*" element={<><Navbar /><NotFound /><Footer /></>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
