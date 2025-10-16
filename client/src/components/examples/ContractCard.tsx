import ContractCard from '../ContractCard';

export default function ContractCardExample() {
  return (
    <div className="space-y-4">
      <ContractCard
        id="1"
        title="Kúpna zmluva - Nehnuteľnosť Bratislava"
        type="Kúpna zmluva"
        date="15.10.2024"
        status="completed"
        onClick={() => console.log('Contract clicked')}
      />
      <ContractCard
        id="2"
        title="Nájomná zmluva - Byt Košice"
        type="Nájomná zmluva"
        date="10.10.2024"
        status="pending"
        onClick={() => console.log('Contract clicked')}
      />
    </div>
  );
}
