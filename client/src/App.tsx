import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PrivateRoute from "@/components/PrivateRoute";
import Home from "@/pages/Home";
import SelectProfile from "@/pages/SelectProfile";
import SelectCompany from "@/pages/SelectCompany";
import MyDocuments from "@/pages/MyDocuments";
import MyContracts from "@/pages/MyContracts";
import CompanyList from "@/pages/CompanyList";
import AddCompanyForm from "@/pages/AddCompanyForm";
import CreateDocument from "@/pages/CreateDocument";
import CreateVehicleContract from "@/pages/CreateVehicleContract";
import CreateRentalContract from "@/pages/CreateRentalContract";
import CreateUploadDocument from "@/pages/CreateUploadDocument";
import CreatePowerOfAttorney from "@/pages/CreatePowerOfAttorney";
import CreateEmploymentContract from "@/pages/CreateEmploymentContract";
import VerifyDocument from "@/pages/VerifyDocument";
import VirtualOffice from "@/pages/VirtualOffice";
import DigitalSigning from "@/pages/DigitalSigning";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/select-profile">
        <PrivateRoute>
          <SelectProfile />
        </PrivateRoute>
      </Route>
      <Route path="/select-company">
        <PrivateRoute>
          <SelectCompany />
        </PrivateRoute>
      </Route>
      <Route path="/my-documents">
        <PrivateRoute>
          <MyDocuments />
        </PrivateRoute>
      </Route>
      <Route path="/my-contracts">
        <PrivateRoute>
          <MyContracts />
        </PrivateRoute>
      </Route>
      <Route path="/companies">
        <PrivateRoute>
          <CompanyList />
        </PrivateRoute>
      </Route>
      <Route path="/companies/add">
        <PrivateRoute>
          <AddCompanyForm />
        </PrivateRoute>
      </Route>
      <Route path="/create-document">
        <PrivateRoute>
          <CreateDocument />
        </PrivateRoute>
      </Route>
      <Route path="/create-vehicle-contract">
        <PrivateRoute>
          <CreateVehicleContract />
        </PrivateRoute>
      </Route>
      <Route path="/create-rental-contract">
        <PrivateRoute>
          <CreateRentalContract />
        </PrivateRoute>
      </Route>
      <Route path="/create-upload-document">
        <PrivateRoute>
          <CreateUploadDocument />
        </PrivateRoute>
      </Route>
      <Route path="/create-power-of-attorney">
        <PrivateRoute>
          <CreatePowerOfAttorney />
        </PrivateRoute>
      </Route>
      <Route path="/create-employment-contract">
        <PrivateRoute>
          <CreateEmploymentContract />
        </PrivateRoute>
      </Route>
      <Route path="/verify-document">
        <PrivateRoute>
          <VerifyDocument />
        </PrivateRoute>
      </Route>
      <Route path="/virtual-office/:id">
        <PrivateRoute>
          <VirtualOffice />
        </PrivateRoute>
      </Route>
      <Route path="/virtual-office">
        <PrivateRoute>
          <VirtualOffice />
        </PrivateRoute>
      </Route>
      <Route path="/digital-signing/:type">
        <PrivateRoute>
          <DigitalSigning />
        </PrivateRoute>
      </Route>
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
