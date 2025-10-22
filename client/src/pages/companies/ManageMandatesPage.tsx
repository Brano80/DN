import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, UserPlus, AlertCircle, Users, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MOCK_USER_EMAILS } from "@/lib/constants";

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

interface InviteFormData {
  email: string;
  rola: string;
  rozsahOpravneni: string;
}

export default function ManageMandatesPage() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InviteFormData>({
    email: "jan.novacek@example.sk", // Pre-filled for demo
    rola: "",
    rozsahOpravneni: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Mutation for inviting user
  const inviteMutation = useMutation({
    mutationFn: async (data: InviteFormData) => {
      if (!activeContext) throw new Error("Nie je vybraný firemný kontext");
      
      const response = await apiRequest('POST', `/api/companies/${activeContext}/mandates`, data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate cache to refresh the table
      queryClient.invalidateQueries({ 
        queryKey: ['/api/companies', activeContext, 'mandates'] 
      });
      
      // Invalidate current-user cache so pending invitations show up in personal dashboard
      queryClient.invalidateQueries({ 
        queryKey: ['/api/current-user'] 
      });
      
      // Close dialog
      setIsDialogOpen(false);
      
      // Reset form (keep email pre-filled for convenience)
      setFormData({
        email: "jan.novacek@example.sk",
        rola: "",
        rozsahOpravneni: "",
      });
      
      // Show success message
      setSuccessMessage("Pozvánka bola úspešne odoslaná");
      setErrorMessage(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: any) => {
      // Show error message
      const message = error?.message || "Nepodarilo sa odoslať pozvánku. Skúste to znova.";
      setErrorMessage(message);
      setSuccessMessage(null);
      
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const handleSubmit = () => {
    // Basic validation
    if (!formData.email || !formData.rola || !formData.rozsahOpravneni) {
      setErrorMessage("Prosím vyplňte všetky polia");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Prosím zadajte platnú e-mailovú adresu");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    inviteMutation.mutate(formData);
  };

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
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

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
        
        {/* Invite User Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-invite-user">
              <UserPlus className="w-4 h-4 mr-2" />
              Pozvať používateľa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pozvať nového používateľa</DialogTitle>
              <DialogDescription>
                Zadajte e-mail a rolu pre udelenie mandátu.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="uzivatel@priklad.sk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  list="mandate-mock-emails-list"
                  data-testid="input-invite-email"
                />
                <datalist id="mandate-mock-emails-list">
                  {MOCK_USER_EMAILS.map((email) => (
                    <option key={email} value={email} />
                  ))}
                </datalist>
              </div>

              {/* Rola Field */}
              <div className="grid gap-2">
                <Label htmlFor="rola">Rola</Label>
                <Select
                  value={formData.rola}
                  onValueChange={(value) => setFormData({ ...formData, rola: value })}
                >
                  <SelectTrigger id="rola" data-testid="select-invite-role">
                    <SelectValue placeholder="Vyberte rolu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Konateľ">Konateľ</SelectItem>
                    <SelectItem value="Prokurista">Prokurista</SelectItem>
                    <SelectItem value="Zamestnanec">Zamestnanec</SelectItem>
                    <SelectItem value="Ekonómka">Ekonómka</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rozsah oprávnení Field */}
              <div className="grid gap-2">
                <Label htmlFor="rozsah">Rozsah oprávnení</Label>
                <Select
                  value={formData.rozsahOpravneni}
                  onValueChange={(value) => setFormData({ ...formData, rozsahOpravneni: value })}
                >
                  <SelectTrigger id="rozsah" data-testid="select-invite-scope">
                    <SelectValue placeholder="Vyberte rozsah oprávnení" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="samostatne">Samostatne</SelectItem>
                    <SelectItem value="spolocne_s_inym">Spoločne s iným</SelectItem>
                    <SelectItem value="obmedzene">Obmedzené</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={inviteMutation.isPending}
                data-testid="button-cancel-invite"
              >
                Zrušiť
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={inviteMutation.isPending}
                data-testid="button-submit-invite"
              >
                {inviteMutation.isPending ? "Odosiela sa..." : "Odoslať pozvánku"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                      {mandate.rozsahOpravneni === 'obmedzene' && 'Obmedzené'}
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
