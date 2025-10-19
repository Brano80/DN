import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import type { Contract } from "@shared/schema";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, Send } from "lucide-react";

interface ContractDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
}

export function ContractDetailModal({ open, onOpenChange, contractId }: ContractDetailModalProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { data: contract, isLoading } = useQuery<Contract>({
    queryKey: [`/api/contracts/${contractId}`],
    enabled: !!contractId && open,
  });

  const generateQRCode = async () => {
    if (!contract) return;
    
    const contractData = {
      id: contract.id,
      title: contract.title,
      type: contract.type,
      createdAt: contract.createdAt,
      ownerEmail: contract.ownerEmail,
    };
    
    try {
      const url = await QRCode.toDataURL(JSON.stringify(contractData), {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(url);
      setShowQRCode(true);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleSendEmail = async () => {
    if (!emailAddress || !contract) return;
    
    setIsSending(true);
    // Simulate sending email
    setTimeout(() => {
      setIsSending(false);
      setShowEmailForm(false);
      setEmailAddress("");
      alert(`Dokument bol úspešne odoslaný na adresu: ${emailAddress}`);
    }, 1000);
  };

  useEffect(() => {
    if (!open) {
      setShowQRCode(false);
      setShowEmailForm(false);
      setEmailAddress("");
    }
  }, [open]);

  const renderVehicleContract = (content: any) => {
    return (
      <div className="bg-background border border-border p-8 text-sm leading-relaxed">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-2">KÚPNA ZMLUVA VOZIDLA</h2>
          <p className="text-muted-foreground">na predaj motorového vozidla</p>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-semibold mb-2">PREDÁVAJÚCI:</p>
              <p>{content.seller?.name}</p>
              <p>Rodné číslo: {content.seller?.birthNumber}</p>
              <p>Adresa: {content.seller?.address}</p>
            </div>
            <div>
              <p className="font-semibold mb-2">KUPUJÚCI:</p>
              <p>{content.buyer?.name}</p>
              <p>Rodné číslo: {content.buyer?.birthNumber}</p>
              <p>Adresa: {content.buyer?.address}</p>
            </div>
          </div>
          
          <div>
            <p className="font-semibold mb-3">PREDMET ZMLUVY - MOTOROVÉ VOZIDLO:</p>
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Značka a typ:</strong> {content.vehicle?.brand} {content.vehicle?.model}</p>
                  <p><strong>Rok výroby:</strong> {content.vehicle?.year}</p>
                  <p><strong>VIN číslo:</strong> {content.vehicle?.vin}</p>
                  <p><strong>ŠPZ:</strong> {content.vehicle?.licensePlate}</p>
                </div>
                <div>
                  <p><strong>Najazdené km:</strong> {content.vehicle?.mileage} km</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <p className="font-semibold mb-2">KÚPNA CENA A PLATOBNÉ PODMIENKY:</p>
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-lg font-bold text-primary">Kúpna cena: {content.price} EUR</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="mb-4">V {content.signingPlace}, dňa {content.signingDate}</p>
                <div className="border-t border-border pt-2">
                  <p className="font-semibold">{content.seller?.name}</p>
                  <p className="text-sm text-muted-foreground">predávajúci</p>
                </div>
              </div>
              <div className="text-center">
                <p className="mb-4">V {content.signingPlace}, dňa {content.signingDate}</p>
                <div className="border-t border-border pt-2">
                  <p className="font-semibold">{content.buyer?.name}</p>
                  <p className="text-sm text-muted-foreground">kupujúci</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRentalContract = (content: any) => {
    return (
      <div className="bg-background border border-border p-8 text-sm leading-relaxed">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-2">NÁJOMNÁ ZMLUVA</h2>
          <p className="text-muted-foreground">na prenájom nehnuteľnosti</p>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-semibold mb-2">PRENAJÍMATEĽ:</p>
              <p>{content.landlord?.name}</p>
              <p>Rodné číslo: {content.landlord?.birthNumber}</p>
              <p>Adresa: {content.landlord?.address}</p>
            </div>
            <div>
              <p className="font-semibold mb-2">NÁJOMCA:</p>
              <p>{content.tenant?.name}</p>
              <p>Rodné číslo: {content.tenant?.birthNumber}</p>
              <p>Adresa: {content.tenant?.address}</p>
            </div>
          </div>
          
          <div>
            <p className="font-semibold mb-3">PREDMET NÁJMU - NEHNUTEĽNOSŤ:</p>
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Typ:</strong> {content.property?.type}</p>
                  <p><strong>Adresa:</strong> {content.property?.address}</p>
                </div>
                <div>
                  <p><strong>Podlahová plocha:</strong> {content.property?.floorArea} m²</p>
                  <p><strong>Počet izieb:</strong> {content.property?.rooms}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <p className="font-semibold mb-2">NÁJOMNÉ A PLATOBNÉ PODMIENKY:</p>
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-lg font-bold text-primary">Mesačné nájomné: {content.rent} EUR</p>
              <p className="text-sm mt-2">Kaucia: {content.deposit} EUR</p>
            </div>
          </div>
          
          <div>
            <p className="font-semibold mb-2">DOBA NÁJMU:</p>
            <p className="text-sm">Od: {content.startDate}</p>
            <p className="text-sm">Do: {content.endDate}</p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="mb-4">V {content.signingPlace}, dňa {content.signingDate}</p>
                <div className="border-t border-border pt-2">
                  <p className="font-semibold">{content.landlord?.name}</p>
                  <p className="text-sm text-muted-foreground">prenajímateľ</p>
                </div>
              </div>
              <div className="text-center">
                <p className="mb-4">V {content.signingPlace}, dňa {content.signingDate}</p>
                <div className="border-t border-border pt-2">
                  <p className="font-semibold">{content.tenant?.name}</p>
                  <p className="text-sm text-muted-foreground">nájomca</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPowerOfAttorney = (content: any) => {
    return (
      <div className="bg-background border border-border p-8 text-sm leading-relaxed">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-2">SPLNOMOCNENIE</h2>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-semibold mb-2">SPLNOMOCNITEĽ:</p>
              <p>{content.principal?.name}</p>
              <p>Rodné číslo: {content.principal?.birthNumber}</p>
              <p>Adresa: {content.principal?.address}</p>
            </div>
            <div>
              <p className="font-semibold mb-2">SPLNOMOCNENEC:</p>
              <p>{content.attorney?.name}</p>
              <p>Rodné číslo: {content.attorney?.birthNumber}</p>
              <p>Adresa: {content.attorney?.address}</p>
            </div>
          </div>
          
          <div>
            <p className="font-semibold mb-3">ROZSAH SPLNOMOCNENIA:</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{content.authorizedActions}</p>
            </div>
          </div>
          
          <div>
            <p className="font-semibold mb-2">PLATNOSŤ:</p>
            <p className="text-sm">Od: {content.validFrom}</p>
            <p className="text-sm">Do: {content.validUntil}</p>
          </div>
          
          {content.additionalTerms && content.additionalTerms !== 'Žiadne dodatočné podmienky' && (
            <div>
              <p className="font-semibold mb-2">DODATOČNÉ PODMIENKY:</p>
              <p className="text-sm whitespace-pre-wrap">{content.additionalTerms}</p>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="mb-4">V {content.signingPlace}, dňa {content.signingDate}</p>
                <div className="border-t border-border pt-2">
                  <p className="font-semibold">{content.principal?.name}</p>
                  <p className="text-sm text-muted-foreground">splnomocniteľ</p>
                </div>
              </div>
              <div className="text-center">
                <p className="mb-4">V {content.signingPlace}, dňa {content.signingDate}</p>
                <div className="border-t border-border pt-2">
                  <p className="font-semibold">{content.attorney?.name}</p>
                  <p className="text-sm text-muted-foreground">splnomocnenec</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmploymentContract = (content: any) => {
    return (
      <div className="bg-background border border-border p-8 text-sm leading-relaxed">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-2">ZAMESTNANECKÁ ZMLUVA</h2>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-semibold mb-2">ZAMESTNÁVATEĽ:</p>
              <p>{content.employer?.name}</p>
              <p>IČO: {content.employer?.ico}</p>
              <p>Sídlo: {content.employer?.address}</p>
              <p>Zastúpený: {content.employer?.representative}</p>
            </div>
            <div>
              <p className="font-semibold mb-2">ZAMESTNANEC:</p>
              <p>{content.employee?.name}</p>
              <p>Rodné číslo: {content.employee?.birthNumber}</p>
              <p>Bydlisko: {content.employee?.address}</p>
            </div>
          </div>
          
          <div>
            <p className="font-semibold mb-3">PRACOVNÉ ZARADENIE:</p>
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Pozícia:</strong> {content.employment?.position}</p>
                  <p><strong>Miesto výkonu:</strong> {content.employment?.workLocation}</p>
                  <p><strong>Nástup:</strong> {content.employment?.startDate}</p>
                </div>
                <div>
                  <p><strong>Pracovný čas:</strong> {content.employment?.workHours}</p>
                  <p><strong>Dovolenka:</strong> {content.employment?.vacationDays} dní</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <p className="font-semibold mb-2">MZDA:</p>
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-lg font-bold text-primary">Hrubá mzda: {content.employment?.salary} EUR</p>
            </div>
          </div>
          
          {content.additionalTerms && content.additionalTerms !== 'Žiadne dodatočné podmienky' && (
            <div>
              <p className="font-semibold mb-2">DODATOČNÉ PODMIENKY:</p>
              <p className="text-sm whitespace-pre-wrap">{content.additionalTerms}</p>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="mb-4">V {content.signingPlace}, dňa {content.signingDate}</p>
                <div className="border-t border-border pt-2">
                  <p className="font-semibold">{content.employer?.representative}</p>
                  <p className="text-sm text-muted-foreground">za zamestnávateľa</p>
                </div>
              </div>
              <div className="text-center">
                <p className="mb-4">V {content.signingPlace}, dňa {content.signingDate}</p>
                <div className="border-t border-border pt-2">
                  <p className="font-semibold">{content.employee?.name}</p>
                  <p className="text-sm text-muted-foreground">zamestnanec</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomDocument = (content: any) => {
    return (
      <div className="bg-background border border-border p-8 text-sm leading-relaxed">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-2">VLASTNÝ DOKUMENT</h2>
          <p className="text-muted-foreground">{content.fileName}</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4">Nahrané: {content.uploadDate}</p>
            <div className="bg-muted p-6 rounded-lg max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{content.content}</pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getContractContent = () => {
    if (isLoading) {
      return <div className="text-center py-8">Načítavam zmluvu...</div>;
    }

    if (!contract) {
      return <div className="text-center py-8">Zmluva nenájdená</div>;
    }

    const content = typeof contract.content === 'string' 
      ? JSON.parse(contract.content) 
      : contract.content;

    if (contract.type === 'vehicle') {
      return renderVehicleContract(content);
    } else if (contract.type === 'rental') {
      return renderRentalContract(content);
    } else if (contract.type === 'power_of_attorney') {
      return renderPowerOfAttorney(content);
    } else if (contract.type === 'employment') {
      return renderEmploymentContract(content);
    } else if (contract.type === 'custom') {
      return renderCustomDocument(content);
    }

    return <div className="text-center py-8 text-muted-foreground">Neznámy typ zmluvy</div>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-contract-detail">
        <DialogHeader>
          <DialogTitle>{contract?.title || 'Detail zmluvy'}</DialogTitle>
        </DialogHeader>
        {getContractContent()}
        
        {/* QR Code Display */}
        {showQRCode && qrCodeUrl && (
          <div className="mt-4 p-6 bg-muted rounded-lg text-center border-t">
            <h3 className="text-lg font-semibold mb-4">QR Kód transakcie</h3>
            <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Naskenujte tento QR kód pre zobrazenie detailov transakcie
            </p>
          </div>
        )}

        {/* Email Form */}
        {showEmailForm && (
          <div className="mt-4 p-6 bg-muted rounded-lg border-t">
            <h3 className="text-lg font-semibold mb-4">Preposlať dokument emailom</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-address">Emailová adresa príjemcu</Label>
                <Input
                  id="email-address"
                  type="email"
                  placeholder="priklad@email.sk"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  data-testid="input-forward-email"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEmailForm(false);
                    setEmailAddress("");
                  }}
                  data-testid="button-cancel-email"
                >
                  Zrušiť
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={!emailAddress || isSending}
                  data-testid="button-send-email"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? 'Odosiela sa...' : 'Odoslať'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={generateQRCode}
              disabled={showQRCode}
              data-testid="button-generate-qr"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR code
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEmailForm(!showEmailForm)}
              data-testid="button-forward"
            >
              <Send className="w-4 h-4 mr-2" />
              Preposlať
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-contract">
              Zavrieť
            </Button>
            <Button onClick={() => window.print()} data-testid="button-print-contract">
              Tlačiť súhrn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
