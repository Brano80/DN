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

  const { data, isLoading } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
  });

  const setContextMutation = useMutation({
    mutationFn: async (contextId: string) => {
      return await apiRequest('POST', '/api/set-context', { contextId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/virtual-offices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      setLocation('/');
    },
  });

  const handleSelectPersonal = () => {
    setContextMutation.mutate('personal');
  };

  const handleGoToCompanies = () => {
    setLocation('/select-company');
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* Personal Profile Card */}
          <Card 
            className="cursor-pointer transition-all hover-elevate active-elevate-2 flex flex-col h-full"
            onClick={handleSelectPersonal}
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
            <CardContent className="flex-1">
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
            className="transition-all flex flex-col h-full"
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
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                Spravujte firemné zmluvy a dokumenty v mene organizácie.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleGoToCompanies}
                data-testid="button-enter-company"
              >
                Vstúpiť do firemného profilu
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
