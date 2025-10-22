import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Plus, Loader2, UserPlus, Upload, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { VirtualOffice, VirtualOfficeParticipant, VirtualOfficeDocument } from "@shared/schema";
import { MOCK_USER_EMAILS } from "@/lib/constants";

interface VirtualOfficeEnriched extends VirtualOffice {
  participants: Array<VirtualOfficeParticipant & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  documents: Array<VirtualOfficeDocument & {
    contract: {
      id: string;
      title: string;
      type: string;
    };
  }>;
}

const getStatusDisplay = (status: string): { text: string; variant: any } => {
  switch (status) {
    case 'ACCEPTED':
      return { text: 'Prijatý', variant: 'default' };
    case 'INVITED':
      return { text: 'Pozvaný', variant: 'secondary' };
    case 'REJECTED':
      return { text: 'Odmietnutý', variant: 'destructive' };
    default:
      return { text: status, variant: 'outline' };
  }
};

const getDocumentStatusDisplay = (status: string): { text: string; variant: any } => {
  switch (status) {
    case 'signed':
      return { text: 'Podpísaný', variant: 'default' };
    case 'pending':
      return { text: 'Čaká na podpis', variant: 'secondary' };
    default:
      return { text: status, variant: 'outline' };
  }
};

export default function VirtualOfficeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data: currentUser } = useCurrentUser();
  const { toast } = useToast();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [requiredRole, setRequiredRole] = useState('');
  const [requiredCompanyIco, setRequiredCompanyIco] = useState('');

  // Fetch virtual office detail
  const { data: office, isLoading, isError } = useQuery<VirtualOfficeEnriched>({
    queryKey: [`/api/virtual-offices/${id}`],
    enabled: !!id,
  });

  // Invite participant mutation
  const inviteParticipantMutation = useMutation({
    mutationFn: async (data: { email: string; requiredRole?: string; requiredCompanyIco?: string }) => {
      const response = await apiRequest("POST", `/api/virtual-offices/${id}/participants`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/virtual-offices/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/virtual-offices'] });
      setShowInviteDialog(false);
      setInviteEmail('');
      setRequiredRole('');
      setRequiredCompanyIco('');
      toast({
        title: "Účastník pozvaný",
        description: "Pozvánka bola úspešne odoslaná.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa pozvať účastníka.",
        variant: "destructive",
      });
    },
  });

  const handleInviteParticipant = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Chyba",
        description: "Zadajte e-mailovú adresu účastníka.",
        variant: "destructive",
      });
      return;
    }

    inviteParticipantMutation.mutate({
      email: inviteEmail,
      requiredRole: requiredRole || undefined,
      requiredCompanyIco: requiredCompanyIco || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isError || !office) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Virtuálna kancelária nebola nájdená alebo nemáte oprávnenie na jej zobrazenie.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setLocation('/virtual-office')}
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Späť na zoznam
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/virtual-office')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-office-name">
              {office.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Detail virtuálnej kancelárie
            </p>
          </div>
        </div>
      </div>

      {/* Participants Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Účastníci</CardTitle>
              <CardDescription>
                Zoznam všetkých účastníkov tejto virtuálnej kancelárie
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowInviteDialog(true)}
              size="sm"
              data-testid="button-invite-participant"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Pozvať účastníka
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {office.participants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Zatiaľ nie sú žiadni účastníci</p>
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(true)}
                data-testid="button-invite-first"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Pozvať prvého účastníka
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meno</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Rola</TableHead>
                  <TableHead>IČO firmy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pozvaný</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {office.participants.map((participant) => {
                  const statusDisplay = getStatusDisplay(participant.status);
                  
                  return (
                    <TableRow key={participant.id} data-testid={`row-participant-${participant.id}`}>
                      <TableCell className="font-medium">{participant.user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{participant.user.email}</TableCell>
                      <TableCell>{participant.requiredRole || '—'}</TableCell>
                      <TableCell>{participant.requiredCompanyIco || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={statusDisplay.variant}>
                          {participant.status === 'ACCEPTED' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                          {participant.status === 'INVITED' && <Clock className="mr-1 h-3 w-3" />}
                          {participant.status === 'REJECTED' && <XCircle className="mr-1 h-3 w-3" />}
                          {statusDisplay.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(participant.invitedAt).toLocaleDateString('sk-SK')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dokumenty</CardTitle>
              <CardDescription>
                Dokumenty pripojené k tejto virtuálnej kancelárii
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled
              data-testid="button-upload-document"
            >
              <Upload className="mr-2 h-4 w-4" />
              Nahrať dokument
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {office.documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Zatiaľ nie sú žiadne dokumenty</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Názov dokumentu</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nahraný</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {office.documents.map((doc) => {
                  const statusDisplay = getDocumentStatusDisplay(doc.status);
                  
                  return (
                    <TableRow key={doc.id} data-testid={`row-document-${doc.id}`}>
                      <TableCell className="font-medium">{doc.contract.title}</TableCell>
                      <TableCell className="text-muted-foreground capitalize">
                        {doc.contract.type}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusDisplay.variant}>
                          {statusDisplay.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString('sk-SK')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent data-testid="dialog-invite-participant">
          <DialogHeader>
            <DialogTitle>Pozvať účastníka</DialogTitle>
            <DialogDescription>
              Pridajte nového účastníka do tejto virtuálnej kancelárie
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">E-mailová adresa *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="jan.novak@example.sk"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                list="mock-emails-list"
                data-testid="input-invite-email"
              />
              <datalist id="mock-emails-list">
                {MOCK_USER_EMAILS.map((email) => (
                  <option key={email} value={email} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="required-role">Požadovaná rola (voliteľné)</Label>
              <Input
                id="required-role"
                placeholder="Napr. Konateľ, Prokurist"
                value={requiredRole}
                onChange={(e) => setRequiredRole(e.target.value)}
                data-testid="input-required-role"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="required-ico">Požadované IČO firmy (voliteľné)</Label>
              <Input
                id="required-ico"
                placeholder="Napr. 12345678"
                value={requiredCompanyIco}
                onChange={(e) => setRequiredCompanyIco(e.target.value)}
                data-testid="input-required-ico"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
              data-testid="button-cancel"
            >
              Zrušiť
            </Button>
            <Button
              onClick={handleInviteParticipant}
              disabled={inviteParticipantMutation.isPending}
              data-testid="button-submit"
            >
              {inviteParticipantMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pozvať
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
