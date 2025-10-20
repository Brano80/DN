import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AuthSection from "@/components/AuthSection";
import MainMenu from "@/components/MainMenu";
import ThemeToggle from "@/components/ThemeToggle";

interface User {
  id: string;
  name: string;
  email: string;
  givenName?: string;
  familyName?: string;
}

interface CurrentUserResponse {
  user: User;
  mandates: Array<{
    ico: string;
    companyName: string;
    role: string;
  }>;
  activeContext?: string | null;
}

export default function Home() {
  const [, setLocation] = useLocation();

  const { data, isLoading } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  const user = data?.user;
  const activeContext = data?.activeContext;
  const isCompanyContext = activeContext && activeContext !== 'personal';

  const handleLogoff = () => {
    window.location.href = '/auth/logout';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Načítavam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <header className="text-center flex-1">
            <h1 className="text-4xl font-bold">Digital Notary</h1>
            <p className="text-muted-foreground mt-2">Digital Identity & Signature Manager</p>
          </header>
          <ThemeToggle />
        </div>

        <main>
          {!user ? (
            <AuthSection />
          ) : (
            <MainMenu
              userName={user.name}
              isCompanyContext={!!isCompanyContext}
              onCreateDocument={() => setLocation('/create-document')}
              onVerifyDocument={() => setLocation('/verify-document')}
              onMyContracts={() => setLocation('/my-contracts')}
              onMyDocuments={() => setLocation('/my-documents')}
              onMyCompanies={!isCompanyContext ? () => setLocation('/companies') : undefined}
              onVirtualOffice={() => setLocation('/virtual-office')}
              onLogoff={handleLogoff}
            />
          )}
        </main>
      </div>
    </div>
  );
}
