import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

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

interface AuditLogResponse {
  id: string;
  timestamp: string;
  actionType: string;
  details: string;
  userId: string;
  companyId: string | null;
  user: {
    id: string;
    username: string;
  };
}

// Translation function for action types
function translateActionType(actionType: string): string {
  const translations: Record<string, string> = {
    MANDATE_CREATED: "Pozvanie používateľa",
    MANDATE_ACCEPTED: "Prijatie mandátu",
    MANDATE_REJECTED: "Odmietnutie mandátu",
    MANDATE_REVOKED: "Odobratie mandátu",
    USER_LOGIN: "Prihlásenie",
    USER_LOGOUT: "Odhlásenie",
    COMPANY_CONNECTED: "Pripojenie firmy",
  };
  return translations[actionType] || actionType;
}

export default function AuditLogPage() {
  const [, setLocation] = useLocation();

  // Get active context
  const { data: userData, isLoading: isLoadingUser } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  const activeContext = userData?.activeContext;
  const isCompanyContext = activeContext && activeContext !== 'personal';
  const activeIco = isCompanyContext ? activeContext : null;

  // Find active company name from mandates
  const activeCompany = userData?.mandates.find(m => m.ico === activeIco);

  // Fetch audit logs
  const { data: logs, isLoading: isLoadingLogs, isError } = useQuery<AuditLogResponse[]>({
    queryKey: ['/api/companies', activeIco, 'audit-log'],
    enabled: !!activeIco,
  });

  if (isLoadingUser || isLoadingLogs) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground" data-testid="text-loading">Načítavam aktivity...</p>
      </div>
    );
  }

  if (!isCompanyContext || !activeIco) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Prehľad aktivít je dostupný len v kontexte firmy. Prepnite na firemný profil cez navigáciu hore.
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
            Nepodarilo sa načítať aktivity. Skúste to znova neskôr.
          </AlertDescription>
        </Alert>
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
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-heading">Prehľad aktivít</h1>
          </div>
          <p className="text-muted-foreground pl-12" data-testid="text-company-name">
            Záznamy aktivít pre firmu: {activeCompany?.companyName}
          </p>
        </div>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardContent className="p-6">
          {!logs || logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground" data-testid="text-no-logs">
                Zatiaľ neexistujú žiadne záznamy aktivít.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dátum a čas</TableHead>
                  <TableHead>Používateľ</TableHead>
                  <TableHead>Akcia</TableHead>
                  <TableHead>Detaily</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} data-testid={`row-audit-log-${log.id}`}>
                    <TableCell data-testid={`text-timestamp-${log.id}`}>
                      {format(new Date(log.timestamp), "dd.MM.yyyy HH:mm", { locale: sk })}
                    </TableCell>
                    <TableCell data-testid={`text-user-${log.id}`}>
                      {log.user.username}
                    </TableCell>
                    <TableCell data-testid={`text-action-${log.id}`}>
                      {translateActionType(log.actionType)}
                    </TableCell>
                    <TableCell data-testid={`text-details-${log.id}`}>
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
