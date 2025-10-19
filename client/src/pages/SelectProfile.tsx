import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Mandate {
  ico: string;
  companyName: string;
  role: string;
}

interface CurrentUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  mandates: Mandate[];
  activeContext?: string | null;
}

export default function SelectProfile() {
  const [, setLocation] = useLocation();
  const [showCompanyProfiles, setShowCompanyProfiles] = useState(false);

  const { data, isLoading } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
  });

  const setContextMutation = useMutation({
    mutationFn: async (contextId: string) => {
      return await apiRequest('POST', '/api/set-context', { contextId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-user'] });
      setLocation('/');
    },
  });

  const handleSelectContext = (contextId: string) => {
    setContextMutation.mutate(contextId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Načítavam...</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Vitajte, {data.user.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Prosím, vyberte profil, v ktorom chcete pokračovať.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Profile Card */}
          <Card 
            className="cursor-pointer transition-all hover-elevate active-elevate-2"
            onClick={() => handleSelectContext('personal')}
            data-testid="card-personal-profile"
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Osobný profil</CardTitle>
                  <CardDescription>Vstúpte ako súkromná osoba {data.user.name}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                V osobnom profile môžete spravovať svoje súkromné zmluvy a dokumenty.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={setContextMutation.isPending}
                data-testid="button-enter-personal"
              >
                Vstúpiť do osobného profilu
              </Button>
            </CardFooter>
          </Card>

          {/* Company Profile Card */}
          <Card 
            className="transition-all"
            data-testid="card-company-profile"
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>Firemný profil</CardTitle>
                  <CardDescription>Vstúpte v mene vašej firmy</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Spravujte firemné zmluvy a dokumenty v mene organizácie.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => setShowCompanyProfiles(!showCompanyProfiles)}
                data-testid="button-enter-company"
              >
                Vstúpiť do firemného profilu
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Company Profiles List - shown after clicking */}
        {showCompanyProfiles && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Vyberte firmu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.mandates.map((mandate) => (
                <Card 
                  key={mandate.ico}
                  className="cursor-pointer transition-all hover-elevate active-elevate-2"
                  onClick={() => handleSelectContext(mandate.ico)}
                  data-testid={`card-company-${mandate.ico}`}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{mandate.companyName}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-1">
                      {mandate.role}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      IČO: {mandate.ico}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={setContextMutation.isPending}
                      data-testid={`button-manage-${mandate.ico}`}
                    >
                      Vybrať túto firmu
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
