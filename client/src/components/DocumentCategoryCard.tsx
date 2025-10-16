import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, LucideIcon } from "lucide-react";

interface DocumentItem {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  statusVariant: "default" | "secondary" | "destructive" | "outline";
}

interface DocumentCategoryCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  documents: DocumentItem[];
  onDocumentClick: (id: string) => void;
}

export default function DocumentCategoryCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  documents,
  onDocumentClick,
}: DocumentCategoryCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center mr-4`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 bg-muted rounded-lg hover-elevate cursor-pointer"
            onClick={() => onDocumentClick(doc.id)}
            data-testid={`document-${doc.id}`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-chart-2/20 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-chart-2" />
              </div>
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-sm text-muted-foreground">{doc.subtitle}</p>
              </div>
            </div>
            <Badge variant={doc.statusVariant}>{doc.status}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
