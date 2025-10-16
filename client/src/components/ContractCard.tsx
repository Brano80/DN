import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar } from "lucide-react";

interface ContractCardProps {
  id: string;
  title: string;
  type: string;
  date: string;
  status: 'completed' | 'pending' | 'draft';
  onClick: () => void;
}

export default function ContractCard({ id, title, type, date, status, onClick }: ContractCardProps) {
  const statusConfig = {
    completed: { label: 'Dokončené', variant: 'default' as const },
    pending: { label: 'Čaká sa na podpis', variant: 'secondary' as const },
    draft: { label: 'Koncept', variant: 'outline' as const },
  };

  const config = statusConfig[status];

  return (
    <Card
      className="p-6 hover-elevate cursor-pointer transition-all"
      onClick={onClick}
      data-testid={`contract-${id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1 truncate">{title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{type}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{date}</span>
            </div>
          </div>
        </div>
        <Badge variant={config.variant} className="ml-4">{config.label}</Badge>
      </div>
    </Card>
  );
}
