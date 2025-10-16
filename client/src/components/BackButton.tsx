import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export default function BackButton({ onClick, label = "Späť na menu" }: BackButtonProps) {
  return (
    <div
      className="flex items-center space-x-2 mb-6 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
      onClick={onClick}
      data-testid="button-back"
    >
      <ChevronLeft className="h-5 w-5" />
      <span>{label}</span>
    </div>
  );
}
