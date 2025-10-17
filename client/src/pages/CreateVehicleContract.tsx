import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import BackButton from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Car } from "lucide-react";

export default function CreateVehicleContract() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Seller information
  const [sellerName, setSellerName] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [sellerIdNumber, setSellerIdNumber] = useState('');

  // Buyer information
  const [buyerName, setBuyerName] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerIdNumber, setBuyerIdNumber] = useState('');

  // Vehicle information
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleVin, setVehicleVin] = useState('');
  const [vehicleLicensePlate, setVehicleLicensePlate] = useState('');
  const [vehicleMileage, setVehicleMileage] = useState('');

  // Contract details
  const [purchasePrice, setPurchasePrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [additionalTerms, setAdditionalTerms] = useState('');

  const createContractMutation = useMutation({
    mutationFn: async () => {
      const contractContent = `
KÚPNA ZMLUVA O PREVODE MOTOROVÉHO VOZIDLA

I. ZMLUVNÉ STRANY

Predávajúci:
Meno a priezvisko: ${sellerName}
Bydlisko: ${sellerAddress}
Rodné číslo: ${sellerIdNumber}

Kupujúci:
Meno a priezvisko: ${buyerName}
Bydlisko: ${buyerAddress}
Rodné číslo: ${buyerIdNumber}

II. PREDMET ZMLUVY

Vozidlo:
Značka: ${vehicleBrand}
Model: ${vehicleModel}
Rok výroby: ${vehicleYear}
VIN: ${vehicleVin}
ŠPZ: ${vehicleLicensePlate}
Stav tachometra: ${vehicleMileage} km

III. KÚPNA CENA A PLATOBNÉ PODMIENKY

Kúpna cena: ${purchasePrice} €
Spôsob platby: ${paymentMethod}

IV. DODATOČNÉ PODMIENKY

${additionalTerms || 'Žiadne dodatočné podmienky'}

V. ZÁVEREČNÉ USTANOVENIA

Predávajúci vyhlasuje, že je výlučným vlastníkom vozidla a vozidlo nie je zaťažené záložným právom ani iným vecným bremenom.
Kupujúci preberá vozidlo v stave, v akom sa nachádza v čase podpisu tejto zmluvy.

Táto zmluva nadobúda platnosť dňom jej podpísania oboma zmluvnými stranami.
      `.trim();

      const title = `Kúpna zmluva vozidla - ${vehicleBrand} ${vehicleModel}`;
      
      return await apiRequest('POST', '/api/contracts', {
        title,
        type: 'vehicle',
        content: contractContent,
        ownerEmail: 'jan.novak@example.com',
      });
    },
    onSuccess: () => {
      toast({
        title: "Zmluva vytvorená",
        description: "Zmluva bola úspešne uložená do 'Moje zmluvy'",
      });
      setLocation('/my-contracts');
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Chyba",
        description: "Nepodarilo sa uložiť zmluvu",
      });
    },
  });

  const handleSave = () => {
    if (!sellerName || !buyerName || !vehicleBrand || !vehicleModel || !purchasePrice) {
      toast({
        variant: "destructive",
        title: "Chýbajúce údaje",
        description: "Vyplňte všetky povinné polia",
      });
      return;
    }
    createContractMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => setLocation('/create-document')} />
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Kúpna zmluva vozidla</h2>
              <p className="text-muted-foreground">Štandardná slovenská kúpno-predajná zmluva</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Seller Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Predávajúci</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seller-name">Meno a priezvisko *</Label>
                  <Input
                    id="seller-name"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="Ján Novák"
                    data-testid="input-seller-name"
                  />
                </div>
                <div>
                  <Label htmlFor="seller-id">Rodné číslo *</Label>
                  <Input
                    id="seller-id"
                    value={sellerIdNumber}
                    onChange={(e) => setSellerIdNumber(e.target.value)}
                    placeholder="900101/1234"
                    data-testid="input-seller-id"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="seller-address">Bydlisko *</Label>
                  <Input
                    id="seller-address"
                    value={sellerAddress}
                    onChange={(e) => setSellerAddress(e.target.value)}
                    placeholder="Hlavná 123, 811 01 Bratislava"
                    data-testid="input-seller-address"
                  />
                </div>
              </div>
            </div>

            {/* Buyer Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Kupujúci</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyer-name">Meno a priezvisko *</Label>
                  <Input
                    id="buyer-name"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Peter Kováč"
                    data-testid="input-buyer-name"
                  />
                </div>
                <div>
                  <Label htmlFor="buyer-id">Rodné číslo *</Label>
                  <Input
                    id="buyer-id"
                    value={buyerIdNumber}
                    onChange={(e) => setBuyerIdNumber(e.target.value)}
                    placeholder="850505/5678"
                    data-testid="input-buyer-id"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="buyer-address">Bydlisko *</Label>
                  <Input
                    id="buyer-address"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    placeholder="Vysoká 456, 821 09 Bratislava"
                    data-testid="input-buyer-address"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Údaje o vozidle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicle-brand">Značka vozidla *</Label>
                  <Input
                    id="vehicle-brand"
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    placeholder="Škoda"
                    data-testid="input-vehicle-brand"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle-model">Model *</Label>
                  <Input
                    id="vehicle-model"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Octavia"
                    data-testid="input-vehicle-model"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle-year">Rok výroby *</Label>
                  <Input
                    id="vehicle-year"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    placeholder="2019"
                    data-testid="input-vehicle-year"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle-vin">VIN</Label>
                  <Input
                    id="vehicle-vin"
                    value={vehicleVin}
                    onChange={(e) => setVehicleVin(e.target.value)}
                    placeholder="TMBJJ6NW5J0123456"
                    data-testid="input-vehicle-vin"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle-plate">ŠPZ</Label>
                  <Input
                    id="vehicle-plate"
                    value={vehicleLicensePlate}
                    onChange={(e) => setVehicleLicensePlate(e.target.value)}
                    placeholder="BA123AB"
                    data-testid="input-vehicle-plate"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle-mileage">Stav tachometra (km)</Label>
                  <Input
                    id="vehicle-mileage"
                    value={vehicleMileage}
                    onChange={(e) => setVehicleMileage(e.target.value)}
                    placeholder="85000"
                    data-testid="input-vehicle-mileage"
                  />
                </div>
              </div>
            </div>

            {/* Purchase Details */}
            <div>
              <h3 className="text-lg font-medium mb-4">Kúpna cena a platba</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase-price">Kúpna cena (€) *</Label>
                  <Input
                    id="purchase-price"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="18500"
                    data-testid="input-purchase-price"
                  />
                </div>
                <div>
                  <Label htmlFor="payment-method">Spôsob platby</Label>
                  <Input
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Bankový prevod"
                    data-testid="input-payment-method"
                  />
                </div>
              </div>
            </div>

            {/* Additional Terms */}
            <div>
              <Label htmlFor="additional-terms">Dodatočné podmienky</Label>
              <Textarea
                id="additional-terms"
                value={additionalTerms}
                onChange={(e) => setAdditionalTerms(e.target.value)}
                placeholder="Napríklad: Vozidlo sa predáva so zimnou a letnou sadou pneumatík..."
                rows={4}
                data-testid="input-additional-terms"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/create-document')}
                data-testid="button-cancel"
              >
                Zrušiť
              </Button>
              <Button
                onClick={handleSave}
                disabled={createContractMutation.isPending}
                data-testid="button-save-contract"
              >
                {createContractMutation.isPending ? 'Ukladám...' : 'Uložiť'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
