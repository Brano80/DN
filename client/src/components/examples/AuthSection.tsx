import AuthSection from '../AuthSection';

export default function AuthSectionExample() {
  return (
    <AuthSection onLogin={() => console.log('EUDI login clicked')} />
  );
}
