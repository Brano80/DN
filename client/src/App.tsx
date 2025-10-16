import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import MyDocuments from "@/pages/MyDocuments";
import MyContracts from "@/pages/MyContracts";
import CreateDocument from "@/pages/CreateDocument";
import VerifyDocument from "@/pages/VerifyDocument";
import VirtualOffice from "@/pages/VirtualOffice";
import DigitalSigning from "@/pages/DigitalSigning";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/my-documents" component={MyDocuments} />
      <Route path="/my-contracts" component={MyContracts} />
      <Route path="/create-document" component={CreateDocument} />
      <Route path="/verify-document" component={VerifyDocument} />
      <Route path="/virtual-office" component={VirtualOffice} />
      <Route path="/digital-signing/:type" component={DigitalSigning} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
