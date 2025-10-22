import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Shield, Briefcase, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { VirtualOffice, Contract } from "@shared/schema";

interface CompanyDashboardProps {
  companyName: string;
  ico: string;
}

export default function CompanyDashboard({ companyName, ico }: CompanyDashboardProps) {
  const [, setLocation] = useLocation();
  const { data: currentUser } = useCurrentUser();

  // Fetch contracts for the current user
  const { data: contracts } = useQuery<Contract[]>({
    queryKey: QUERY_KEYS.contracts(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });

  // Fetch virtual offices for the current user
  const { data: virtualOffices } = useQuery<VirtualOffice[]>({
    queryKey: QUERY_KEYS.virtualOffices(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });

  // Calculate counts
  const contractsCount = contracts?.length || 0;
  const virtualOfficesCount = virtualOffices?.length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="company-dashboard">
      {/* Welcome Section */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {companyName}
            </h1>
            <p className="text-muted-foreground">IČO: {ico}</p>
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Spravujte firemné dokumenty a digitálne úkony v mene tejto spoločnosti.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Firemné zmluvy</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractsCount}</div>
            <p className="text-xs text-muted-foreground">Celkový počet zmlúv</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-dokumenty</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Podpísané dokumenty</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2"
          onClick={() => setLocation('/virtual-office/list')}
          data-testid="card-virtual-offices"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Virtuálne kancelárie</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{virtualOfficesCount}</div>
            <p className="text-xs text-muted-foreground">Aktívne kancelárie</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Čakajúce úkony</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Na podpis/schválenie</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Rýchle akcie</CardTitle>
          <CardDescription>
            Začnite s najčastejšími úkonmi pre firmu {companyName}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => setLocation('/create-document')}
            data-testid="button-create-document"
          >
            <FileText className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Vytvoriť dokument</div>
              <div className="text-xs text-muted-foreground">Nový firemný dokument</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => setLocation('/verify-document')}
            data-testid="button-verify-document"
          >
            <Shield className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Overiť dokument</div>
              <div className="text-xs text-muted-foreground">Overenie pravosti dokumentu</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => setLocation('/virtual-office')}
            data-testid="button-virtual-office"
          >
            <Briefcase className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Virtuálna kancelária</div>
              <div className="text-xs text-muted-foreground">Digitálne podpisovanie</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => setLocation('/companies')}
            data-testid="button-manage-company"
          >
            <Building2 className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Správa firmy</div>
              <div className="text-xs text-muted-foreground">Nastavenia a mandáty</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => setLocation('/my-documents')}
            data-testid="button-company-documents"
          >
            <FileText className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">E-dokumenty</div>
              <div className="text-xs text-muted-foreground">Všetky dokumenty</div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informácie o firme</CardTitle>
          <CardDescription>Základné údaje o spoločnosti</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm font-medium">Názov spoločnosti:</span>
            <span className="text-sm text-muted-foreground">{companyName}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm font-medium">IČO:</span>
            <span className="text-sm text-muted-foreground">{ico}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm font-medium">Status:</span>
            <span className="text-sm text-green-600 font-medium">Aktívna</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Nedávna aktivita firmy</CardTitle>
          <CardDescription>Posledné úkony a zmeny v mene spoločnosti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Zatiaľ nemáte žiadnu aktivitu pre túto firmu
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
