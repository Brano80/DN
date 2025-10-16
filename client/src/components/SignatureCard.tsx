import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar } from "lucide-react";

interface SignatureCardProps {
  signerName: string;
  signedDate: string;
  status: 'signed' | 'pending' | 'rejected';
}

export default function SignatureCard({ signerName, signedDate, status }: SignatureCardProps) {
  const statusConfig = {
    signed: { label: 'Podpísané', variant: 'default' as const },
    pending: { label: 'Čaká sa', variant: 'secondary' as const },
    rejected: { label: 'Odmietnuté', variant: 'destructive' as const },
  };

  const config = statusConfig[status];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{signerName}</p>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{signedDate}</span>
            </div>
          </div>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
    </Card>
  );
}
