import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import BackButton from "@/components/BackButton";
import ContractCard from "@/components/ContractCard";

export default function MyContracts() {
  const [, setLocation] = useLocation();

  const contracts = [
    {
      id: '1',
      title: 'Kúpna zmluva - Nehnuteľnosť Bratislava',
      type: 'Kúpna zmluva',
      date: '15.10.2024',
      status: 'completed' as const,
    },
    {
      id: '2',
      title: 'Nájomná zmluva - Byt Košice',
      type: 'Nájomná zmluva',
      date: '10.10.2024',
      status: 'pending' as const,
    },
    {
      id: '3',
      title: 'Darovacia zmluva - Automobil',
      type: 'Darovacia zmluva',
      date: '05.10.2024',
      status: 'completed' as const,
    },
    {
      id: '4',
      title: 'Pracovná zmluva - IT Consultant',
      type: 'Pracovná zmluva',
      date: '01.10.2024',
      status: 'draft' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => setLocation('/')} />
          <h2 className="text-2xl font-semibold mb-6">Moje zmluvy</h2>
          
          <div className="space-y-4">
            {contracts.map((contract) => (
              <ContractCard
                key={contract.id}
                {...contract}
                onClick={() => console.log('Contract clicked:', contract.id)}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
