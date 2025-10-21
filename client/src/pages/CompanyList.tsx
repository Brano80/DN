import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { 
  Users, 
  Building2, 
  FileText, 
  CreditCard, 
  Shield,
  ChevronRight,
  Plus,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export default function CompanyList() {
  const [, setLocation] = useLocation();

  const { data, isLoading } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Načítavam...</p>
      </div>
    );
  }

  const activeContext = data?.activeContext;
  const isCompanyContext = activeContext && activeContext !== 'personal';

  // Find active company
  const activeCompany = isCompanyContext
    ? data?.mandates.find(m => m.ico === activeContext)
    : null;

  if (!isCompanyContext || !activeCompany) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Správa firmy je dostupná len v kontexte firmy. Prepnite na firemný profil cez navigáciu hore.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const menuItems = [
    {
      id: 'mandates',
      icon: Users,
      title: 'Mandáty a práva',
      description: 'Správa používateľov a ich oprávnení',
      details: 'Pridávajte používateľov, definujte ich role a spravujte prístupové práva k firemnému profilu',
      path: '/company-mandates',
      available: true,
    },
    {
      id: 'profile',
      icon: Building2,
      title: 'Profil spoločnosti',
      description: 'Základné a kontaktné údaje firmy',
      details: 'Zobrazenie firemných údajov z OR SR a správa kontaktných a fakturačných údajov',
      path: '/company-profile',
      available: true,
    },
    {
      id: 'activity',
      icon: FileText,
      title: 'Prehľad aktivít',
      description: 'História všetkých akcií a audit log',
      details: 'Kompletný prehľad všetkých akcií vykonaných v mene firmy s možnosťou filtrovania',
      path: '/company-activity',
      available: false,
    },
    {
      id: 'billing',
      icon: CreditCard,
      title: 'Fakturácia a služby',
      description: 'Platby, predplatné a faktúry',
      details: 'Správa platieb, sťahovanie faktúr a nastavenie spôsobu platby',
      path: '/company-billing',
      available: false,
    },
    {
      id: 'security',
      icon: Shield,
      title: 'Zabezpečenie',
      description: 'Nastavenia bezpečnosti firemného účtu',
      details: 'Vynútenie 2FA, schvaľovacie procesy a ďalšie bezpečnostné nastavenia',
      path: '/company-security',
      available: false,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Správa firmy</h1>
          <p className="text-muted-foreground mt-1">
            {activeCompany.companyName} (IČO: {activeCompany.ico})
          </p>
        </div>
        <BackButton onClick={() => setLocation('/')} />
      </div>

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>{activeCompany.companyName}</CardTitle>
              <CardDescription>Vaša rola: {activeCompany.role}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <UserCheck className="w-4 h-4" />
            <span>Ste oprávnený spravovať tento firemný profil</span>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <div className="grid gap-4 md:grid-cols-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Card 
              key={item.id} 
              className={`group transition-all ${item.available ? 'hover-elevate cursor-pointer' : 'opacity-60'}`}
              onClick={() => item.available && setLocation(item.path)}
              data-testid={`card-${item.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      item.available 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{item.title}</span>
                        {!item.available && (
                          <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded">
                            Čoskoro
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                  {item.available && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.details}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Company Button */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center">
            <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-2">Pripojiť ďalšiu firmu</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ak ste štatutárnym zástupcom ďalších firiem, môžete ich pripojiť k svojmu účtu
            </p>
            <Button 
              variant="outline"
              onClick={() => setLocation('/companies/add')}
              data-testid="button-add-company"
            >
              <Plus className="w-4 h-4 mr-2" />
              Pripojiť novú firmu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
