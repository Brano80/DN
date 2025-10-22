import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import AuthSection from "@/components/AuthSection";
import PersonalDashboard from "@/components/dashboards/PersonalDashboard";
import CompanyDashboard from "@/components/dashboards/CompanyDashboard";

interface User {
  id: string;
  name: string;
  email: string;
  givenName?: string;
  familyName?: string;
}

interface Mandate {
  mandateId: string;
  ico: string;
  companyName: string;
  role: string;
  status: string;
}

interface CurrentUserResponse {
  user: User;
  mandates: Mandate[];
  activeContext: string | null;
}

export default function Home() {
  const { data, isLoading } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Načítavam...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show auth section
  if (!data || !data.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
          <header className="text-center">
            <h1 className="text-4xl font-bold">Digital Notary</h1>
            <p className="text-muted-foreground mt-2">Digital Identity & Signature Manager</p>
          </header>
          <main>
            <AuthSection />
          </main>
        </div>
      </div>
    );
  }

  // Authenticated - determine which dashboard to show
  const { user, mandates, activeContext } = data;

  // Personal context (or no context set)
  if (!activeContext || activeContext === 'personal') {
    return <PersonalDashboard />;
  }

  // Company context - find the active company by mandate ID
  const activeCompany = mandates.find(mandate => mandate.mandateId === activeContext);

  if (!activeCompany) {
    // Error state - company context set but company not found
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aktívny firemný kontext sa nenašiel. Mandát ID: {activeContext}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show company dashboard
  return (
    <CompanyDashboard
      companyName={activeCompany.companyName}
      ico={activeCompany.ico}
    />
  );
}
