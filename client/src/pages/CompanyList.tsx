import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { Building2, Plus } from "lucide-react";

// Mock data for now - bude nahradené reálnymi dátami z databázy
const mockCompanies = [
  {
    id: "1",
    ico: "36723246",
    nazov: "DIGITAL NOTARY s.r.o.",
    sidloMesto: "Bratislava",
    rola: "Konateľ",
  },
];

export default function CompanyList() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => setLocation('/')} />
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Moje firmy</h2>
            <Button
              onClick={() => setLocation('/companies/add')}
              data-testid="button-add-company"
            >
              <Plus className="w-4 h-4 mr-2" />
              Pripojiť novú firmu
            </Button>
          </div>

          {mockCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Zatiaľ nemáte pripojené žiadne firmy</p>
              <Button onClick={() => setLocation('/companies/add')} data-testid="button-add-first-company">
                <Plus className="w-4 h-4 mr-2" />
                Pripojiť prvú firmu
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {mockCompanies.map((company) => (
                <Card key={company.id} className="p-4" data-testid={`card-company-${company.ico}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg" data-testid={`text-company-name-${company.ico}`}>
                          {company.nazov}
                        </h3>
                        <p className="text-sm text-muted-foreground">IČO: {company.ico}</p>
                        <p className="text-sm text-muted-foreground">{company.sidloMesto}</p>
                        <p className="text-sm text-primary font-medium mt-1">{company.rola}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" data-testid={`button-view-${company.ico}`}>
                      Zobraziť detail
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
