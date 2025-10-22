import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, MapPin, FileText, Calendar, Globe, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Company } from "@shared/schema";

interface CurrentUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  mandates: Array<{
    mandateId: string;
    ico: string;
    companyName: string;
    role: string;
  }>;
  activeContext: string | null;
}

export default function CompanyProfilePage() {
  const [, setLocation] = useLocation();

  // Get active context
  const { data: userData, isLoading: isLoadingUser } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  const activeContext = userData?.activeContext;
  const isCompanyContext = activeContext && activeContext !== 'personal';

  // Find active company by mandate ID
  const activeCompany = isCompanyContext
    ? userData?.mandates.find(m => m.mandateId === activeContext)
    : null;
  
  const activeIco = activeCompany?.ico || null;

  // Fetch company profile
  const { data: company, isLoading: isLoadingCompany, isError } = useQuery<Company>({
    queryKey: ['/api/companies', activeIco, 'profile'],
    enabled: !!activeIco,
  });

  if (isLoadingUser || isLoadingCompany) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Načítavam profil spoločnosti...</p>
      </div>
    );
  }

  if (!isCompanyContext || !activeIco) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Profil spoločnosti je dostupný len v kontexte firmy. Prepnite na firemný profil cez navigáciu hore.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nepodarilo sa načítať profil spoločnosti. Skúste to znova neskôr.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Firma nebola nájdená.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation('/companies')}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Profil spoločnosti</h1>
          </div>
          <p className="text-muted-foreground pl-12">
            {company.nazov}
          </p>
        </div>
      </div>

      {/* Company Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Základné údaje</CardTitle>
              <CardDescription>Informácie z Obchodného registra SR</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Name */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Obchodné meno</p>
            <p className="text-base font-semibold" data-testid="text-company-name">{company.nazov}</p>
          </div>

          {/* IČO, DIČ, IČ DPH */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">IČO</p>
              <p className="text-base" data-testid="text-ico">{company.ico}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">DIČ</p>
              <p className="text-base" data-testid="text-dic">{company.dic || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">IČ DPH</p>
              <p className="text-base" data-testid="text-ic-dph">{company.icDph || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Sídlo spoločnosti</CardTitle>
              <CardDescription>Adresa registrovaného sídla</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Adresa</p>
            <p className="text-base" data-testid="text-address">
              {company.sidloUlica && company.sidloCislo 
                ? `${company.sidloUlica} ${company.sidloCislo}` 
                : '—'}
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Mesto</p>
              <p className="text-base" data-testid="text-city">{company.sidloMesto || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">PSČ</p>
              <p className="text-base" data-testid="text-zip">{company.sidloPsc || '—'}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Štát</p>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <p className="text-base" data-testid="text-country">{company.stat}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Registračné údaje</CardTitle>
              <CardDescription>Informácie o registrácii v obchodnom registri</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Registračný súd</p>
              <p className="text-base" data-testid="text-registry-court">{company.registracnySud || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Číslo vložky</p>
              <p className="text-base" data-testid="text-insert-number">{company.cisloVlozky || '—'}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Dátum zápisu</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-base" data-testid="text-registration-date">
                  {company.datumZapisu || '—'}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Právna forma</p>
              <p className="text-base" data-testid="text-legal-form">{company.pravnaForma || '—'}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Stav</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-md">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <p className="text-sm font-medium" data-testid="text-status">
                {company.stav === 'active' ? 'Aktívna' : 
                 company.stav === 'pending_verification' ? 'Čaká na overenie' : 
                 company.stav === 'inactive' ? 'Neaktívna' : company.stav}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Info */}
      {company.lastVerifiedAt && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Údaje boli naposledy overené: {new Date(company.lastVerifiedAt).toLocaleDateString('sk-SK', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
