import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadDocumentCardProps {
  onUpload: (file: File) => void;
}

export default function UploadDocumentCard({ onUpload }: UploadDocumentCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      onUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-6 hover-elevate transition-all border-2 border-dashed border-primary/30">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2">Pridať dokument</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Nahrajte vlastný dokument alebo zmluvu z vášho úložiska (PDF, DOCX, DOC)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            data-testid="input-file-upload"
          />
          <Button
            onClick={handleClick}
            variant="outline"
            size="sm"
            data-testid="button-upload-document"
          >
            <Upload className="w-4 h-4 mr-2" />
            Nahrať dokument
          </Button>
        </div>
      </div>
    </Card>
  );
}
