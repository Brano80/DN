import QRCodeDisplay from '../QRCodeDisplay';

export default function QRCodeDisplayExample() {
  return (
    <div className="flex justify-center">
      <QRCodeDisplay value="DN-2024-ABC123456789" size={200} />
    </div>
  );
}
