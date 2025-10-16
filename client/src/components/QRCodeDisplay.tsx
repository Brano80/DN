import { Card } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && typeof window !== 'undefined') {
      import('qrcode').then((QRCode) => {
        QRCode.default.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 1,
          color: {
            dark: '#1f2937',
            light: '#ffffff',
          },
        });
      });
    }
  }, [value, size]);

  return (
    <Card className="p-6 inline-flex flex-col items-center">
      <canvas ref={canvasRef} className="rounded-lg" />
      <p className="text-xs text-muted-foreground mt-4 max-w-[200px] text-center break-all">
        {value}
      </p>
    </Card>
  );
}
