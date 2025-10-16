import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DocumentTemplateCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  onSelect: () => void;
}

export default function DocumentTemplateCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  description,
  onSelect,
}: DocumentTemplateCardProps) {
  return (
    <Card className="p-6 hover-elevate transition-all">
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <Button
            onClick={onSelect}
            variant="outline"
            size="sm"
            data-testid={`button-select-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            Vybrať šablónu
          </Button>
        </div>
      </div>
    </Card>
  );
}
