// Mock user emails for demo purposes
export const MOCK_USER_EMAILS = [
  "jan.novacek@example.sk",
  "petra.ambroz@example.sk",
  "andres.elgueta@tekmain.cl",
];

// Mock users with company options for invitations
export const MOCK_INVITATION_OPTIONS = [
  {
    id: 'jan-personal',
    label: 'Ján Nováček - fyzická osoba',
    email: 'jan.novacek@example.sk',
    invitationContext: 'personal',
    requiredRole: '',
    requiredCompanyIco: '',
  },
  {
    id: 'jan-egarant',
    label: 'Ján Nováček - firma eGARANT s.r.o.',
    email: 'jan.novacek@example.sk',
    invitationContext: '54321098',
    requiredRole: 'Konateľ',
    requiredCompanyIco: '54321098',
  },
  {
    id: 'petra-personal',
    label: 'Petra Ambroz - fyzická osoba',
    email: 'petra.ambroz@example.sk',
    invitationContext: 'personal',
    requiredRole: '',
    requiredCompanyIco: '',
  },
  {
    id: 'petra-arian',
    label: 'Petra Ambroz - firma ARIAN s.r.o.',
    email: 'petra.ambroz@example.sk',
    invitationContext: '12345678',
    requiredRole: 'Konateľ',
    requiredCompanyIco: '12345678',
  },
  {
    id: 'andres-personal',
    label: 'Andres Elgueta - fyzická osoba',
    email: 'andres.elgueta@tekmain.cl',
    invitationContext: 'personal',
    requiredRole: '',
    requiredCompanyIco: '',
  },
  {
    id: 'andres-tekmain',
    label: 'Andres Elgueta - firma Tekmain SpA',
    email: 'andres.elgueta@tekmain.cl',
    invitationContext: '98765432',
    requiredRole: 'Gerente General',
    requiredCompanyIco: '98765432',
  },
];
