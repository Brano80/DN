import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, UserPlus, AlertCircle, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrentUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  mandates: Array<{
    ico: string;
    companyName: string;
    role: string;
  }>;
  activeContext: string | null;
}

interface MandateUser {
  id: string;
  name: string;
  email: string;
  username: string;
}

interface Mandate {
  id: string;
  userId: string;
  companyId: string;
  rola: string;
  rozsahOpravneni: string;
  platnyOd: string;
  platnyDo: string | null;
  stav: string;
  zdrojOverenia: string;
  isVerifiedByKep: boolean;
  user: MandateUser;
}

export default function ManageMandatesPage() {
  const [, setLocation] = useLocation();

  // Get current user and active context
  const { data: userData, isLoading: isLoadingUser } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  const activeContext = userData?.activeContext;
  const isCompanyContext = activeContext && activeContext !== 'personal';
  
  // Find active company name
  const activeCompany = isCompanyContext
    ? userData?.mandates.find(m => m.ico === activeContext)
    : null;

  // Fetch mandates for the company
  const { data: mandates, isLoading: isLoadingMandates, isError } = useQuery<Mandate[]>({
    queryKey: ['/api/companies', activeContext, 'mandates'],
    enabled: !!activeContext && activeContext !== 'personal',
    retry: false,
  });

  // Loading state
  if (isLoadingUser || isLoadingMandates) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No company context selected
  if (!isCompanyContext || !activeCompany) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nie je vybraný firemný kontext. Prepnite na firemný profil cez navigáciu hore.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setLocation('/companies')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Späť
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nepodarilo sa načítať mandáty. Skúste to znova neskôr.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setLocation('/companies')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Späť
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to get status badge variant
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending_confirmation':
        return 'secondary';
      case 'revoked':
      case 'expired':
        return 'destructive';
      case 'inactive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Helper function to translate status
  const translateStatus = (status: string): string => {
    switch (status) {
      case 'active':
        return 'Aktívny';
      case 'pending_confirmation':
        return 'Čaká na potvrdenie';
      case 'revoked':
        return 'Zrušený';
      case 'expired':
        return 'Expirovaný';
      case 'inactive':
        return 'Neaktívny';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/companies')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Mandáty a práva</h1>
              <p className="text-muted-foreground mt-1">
                Správa prístupu pre firmu: {activeCompany.companyName}
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => {
            // TODO: Implement invite user functionality
            console.log('Invite user clicked');
          }}
          data-testid="button-invite-user"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Pozvať používateľa
        </Button>
      </div>

      {/* Mandates Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <CardTitle>Zoznam oprávnených používateľov</CardTitle>
              <CardDescription>
                {mandates?.length || 0} {mandates?.length === 1 ? 'používateľ' : mandates?.length && mandates.length < 5 ? 'používatelia' : 'používateľov'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!mandates || mandates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Zatiaľ nie sú definovaní žiadni používatelia s mandátom pre túto firmu.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meno</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rola</TableHead>
                  <TableHead>Rozsah oprávnení</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mandates.map((mandate) => (
                  <TableRow key={mandate.id} data-testid={`row-mandate-${mandate.id}`}>
                    <TableCell className="font-medium">
                      {mandate.user.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {mandate.user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{mandate.rola}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {mandate.rozsahOpravneni === 'samostatne' && 'Samostatne'}
                      {mandate.rozsahOpravneni === 'spolocne_s_inym' && 'Spoločne s iným'}
                      {mandate.rozsahOpravneni === 'obmedzene' && 'Obmedzene'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(mandate.stav)}>
                        {translateStatus(mandate.stav)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement view/edit mandate
                          console.log('View mandate:', mandate.id);
                        }}
                        data-testid={`button-view-mandate-${mandate.id}`}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">O mandátoch a právach</p>
              <p className="text-sm text-muted-foreground">
                Mandáty definujú, kto môže konať v mene firmy v rámci aplikácie Digital Notary. 
                Len oprávnení používatelia môžu podpisovať dokumenty, vytvárať zmluvy a spravovať firemný profil.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
