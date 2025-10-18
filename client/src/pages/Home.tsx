import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AuthSection from "@/components/AuthSection";
import MainMenu from "@/components/MainMenu";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [userName] = useState("Ján Novák");

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  const handleLogin = () => {
    console.log('EUDI authentication initiated');
    setTimeout(() => {
      setIsAuthenticated(true);
    }, 500);
  };

  const handleLogoff = () => {
    setIsAuthenticated(false);
    localStorage.clear();
    setLocation('/');
  };

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
          {!isAuthenticated ? (
            <AuthSection onLogin={handleLogin} />
          ) : (
            <MainMenu
              userName={userName}
              onCreateDocument={() => setLocation('/create-document')}
              onVerifyDocument={() => setLocation('/verify-document')}
              onMyContracts={() => setLocation('/my-contracts')}
              onMyDocuments={() => setLocation('/my-documents')}
              onVirtualOffice={() => setLocation('/virtual-office')}
              onLogoff={handleLogoff}
            />
          )}
        </main>
      </div>
    </div>
  );
}
