import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/BackButton";
import SignatureCard from "@/components/SignatureCard";
import { Upload, Search, CheckCircle, XCircle, QrCode } from "lucide-react";

export default function VerifyDocument() {
  const [, setLocation] = useLocation();
  const [verificationCode, setVerificationCode] = useState('');
  const [verified, setVerified] = useState<boolean | null>(null);

  const handleVerify = () => {
    console.log('Verifying document with code:', verificationCode);
    setVerified(verificationCode.length > 0);
  };

  const handleScanQR = () => {
    console.log('Opening QR code scanner');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => setLocation('/')} />
          <h2 className="text-2xl font-semibold mb-2">Overiť digitálny dokument</h2>
          <p className="text-muted-foreground mb-6">
            Zadajte overovací kód alebo naskenujte QR kód dokumentu
          </p>

          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <Label htmlFor="verification-code">Overovací kód</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="verification-code"
                  placeholder="DN-2024-XXXXXXXXX"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  data-testid="input-verification-code"
                />
                <Button onClick={handleVerify} data-testid="button-verify">
                  <Search className="w-4 h-4 mr-2" />
                  Overiť
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">alebo</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" data-testid="button-upload">
              <Upload className="w-4 h-4 mr-2" />
              Nahrať dokument
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">alebo</span>
              </div>
            </div>

            <Button
              onClick={handleScanQR}
              variant="outline"
              className="w-full"
              data-testid="button-scan-qr"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Scan QR kód
            </Button>
          </div>

          {verified !== null && (
            <Card className="p-6 max-w-xl mx-auto mt-6">
              {verified ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-chart-2/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-chart-2" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Dokument je platný</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Všetky podpisy sú overené a platné
                  </p>
                  <div className="space-y-2">
                    <SignatureCard
                      signerName="Ján Novák"
                      signedDate="15.10.2024 14:30"
                      status="signed"
                    />
                    <SignatureCard
                      signerName="Peter Horváth"
                      signedDate="15.10.2024 15:45"
                      status="signed"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Dokument nie je platný</h3>
                  <p className="text-sm text-muted-foreground">
                    Overovací kód nebol nájdený v systéme
                  </p>
                </div>
              )}
            </Card>
          )}
        </Card>
      </div>
    </div>
  );
}
