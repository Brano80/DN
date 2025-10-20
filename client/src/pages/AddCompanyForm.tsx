import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/BackButton";
import { Building2, Search, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CompanyData {
  ico: string;
  dic: string;
  icDph: string | null;
  nazov: string;
  sidloUlica: string;
  sidloCislo: string;
  sidloMesto: string;
  sidloPsc: string;
  registracnySud: string;
  cisloVlozky: string;
  datumZapisu: string;
  pravnaForma: string;
  stat: string;
  statutari: Array<{
    meno: string;
    priezvisko: string;
    rola: string;
    rozsahOpravneni: string;
    platnostOd: string;
  }>;
}

export default function AddCompanyForm() {
  const [location, setLocation] = useLocation();
  const [ico, setIco] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get return URL from query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const returnTo = searchParams.get('returnTo') || '/companies';

  const handleSearch = async () => {
    if (!ico.trim()) {
      setError("IČO je povinné");
      return;
    }

    setIsSearching(true);
    setError(null);
    setCompanyData(null);

    try {
      const response = await apiRequest("POST", "/api/mock-orsr-search", { ico });
      const data = await response.json();
      setCompanyData(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes("404")) {
        setError("Firma s týmto IČO nebola nájdená v Mock registri.");
      } else {
        setError("Nastala chyba pri vyhľadávaní firmy. Skúste to znova.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    // Pre MVP zatiaľ len presmerujeme späť
    // V Kroku 4 tu implementujeme uloženie do databázy a KEP podpis
    alert("Firma bola úspešne pripojená! (Mock - reálne uloženie príde v Kroku 4)");
    setLocation(returnTo);
  };

  const handleReset = () => {
    setIco("");
    setCompanyData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => setLocation(returnTo)} />
          
          <h2 className="text-2xl font-semibold mb-6">Pripojiť novú firmu</h2>

          {!companyData ? (
            <div className="space-y-6">
              <div>
                <Label htmlFor="ico">IČO firmy</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="ico"
                    type="text"
                    placeholder="napr. 36723246"
                    value={ico}
                    onChange={(e) => setIco(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={isSearching}
                    data-testid="input-ico"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !ico.trim()}
                    data-testid="button-search-company"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isSearching ? "Vyhľadáva sa..." : "Vyhľadať"}
                  </Button>
                </div>
                {error && (
                  <p className="text-sm text-destructive mt-2" data-testid="text-error">
                    {error}
                  </p>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Testovacie IČO:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>36723246</strong> - DIGITAL NOTARY s.r.o. (Bratislava)</li>
                  <li><strong>12345678</strong> - EXAMPLE CORP s.r.o. (Košice)</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Company Details */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-green-900 dark:text-green-100" data-testid="text-company-name">
                      {companyData.nazov}
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">{companyData.pravnaForma}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">IČO</p>
                    <p className="text-green-900 dark:text-green-100">{companyData.ico}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">DIČ</p>
                    <p className="text-green-900 dark:text-green-100">{companyData.dic}</p>
                  </div>
                  {companyData.icDph && (
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">IČ DPH</p>
                      <p className="text-green-900 dark:text-green-100">{companyData.icDph}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">Sídlo</p>
                    <p className="text-green-900 dark:text-green-100">
                      {companyData.sidloUlica} {companyData.sidloCislo}, {companyData.sidloPsc} {companyData.sidloMesto}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">Registračný súd</p>
                    <p className="text-green-900 dark:text-green-100">{companyData.registracnySud}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">Číslo vložky</p>
                    <p className="text-green-900 dark:text-green-100">{companyData.cisloVlozky}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">Dátum zápisu</p>
                    <p className="text-green-900 dark:text-green-100">
                      {new Date(companyData.datumZapisu).toLocaleDateString('sk-SK')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statutory Representatives */}
              <div>
                <h3 className="font-medium mb-3">Štatutárni zástupcovia</h3>
                <div className="space-y-2">
                  {companyData.statutari.map((statutar, index) => (
                    <Card key={index} className="p-4" data-testid={`card-statutar-${index}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {statutar.meno} {statutar.priezvisko}
                          </p>
                          <p className="text-sm text-muted-foreground">{statutar.rola}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Rozsah: {statutar.rozsahOpravneni}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Od: {new Date(statutar.platnostOd).toLocaleDateString('sk-SK')}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleConfirm} data-testid="button-confirm-company">
                  <Check className="w-4 h-4 mr-2" />
                  Potvrdiť a pripojiť firmu
                </Button>
                <Button variant="outline" onClick={handleReset} data-testid="button-reset">
                  Vyhľadať inú firmu
                </Button>
                <Button variant="ghost" onClick={() => setLocation(returnTo)} data-testid="button-cancel">
                  Zrušiť
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}