import UploadDocumentCard from '../UploadDocumentCard';

export default function UploadDocumentCardExample() {
  return (
    <UploadDocumentCard onUpload={(file) => console.log('File uploaded:', file.name)} />
  );
}
