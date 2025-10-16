import SignatureCard from '../SignatureCard';

export default function SignatureCardExample() {
  return (
    <div className="space-y-4">
      <SignatureCard
        signerName="Ján Novák"
        signedDate="15.10.2024 14:30"
        status="signed"
      />
      <SignatureCard
        signerName="Peter Horváth"
        signedDate="Čaká sa na podpis"
        status="pending"
      />
    </div>
  );
}
