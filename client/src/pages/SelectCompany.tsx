import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft } from "lucide-react";
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

export default function SelectCompany() {
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
      setLocation('/');
    },
  });

  const handleSelectCompany = (ico: string) => {
    setContextMutation.mutate(ico);
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
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/select-profile')}
            data-testid="button-back-to-profile"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Späť na výber profilu
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Vyberte firmu
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            V ktorej firme chcete pokračovať?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.mandates.map((mandate) => (
            <Card 
              key={mandate.ico}
              className="cursor-pointer transition-all hover-elevate active-elevate-2 flex flex-col"
              onClick={() => handleSelectCompany(mandate.ico)}
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
              <CardContent className="flex-1">
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
                  data-testid={`button-select-${mandate.ico}`}
                >
                  Vybrať túto firmu
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
