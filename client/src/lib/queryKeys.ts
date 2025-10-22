export const QUERY_KEYS = {
  contracts: (activeContext: string | null | undefined) => ['/api/contracts', activeContext || 'personal'],
  contract: (id: string) => [`/api/contracts/${id}`],
  virtualOffices: (ownerEmail: string) => [`/api/virtual-offices?ownerEmail=${ownerEmail}`],
  virtualOffice: (id: string) => [`/api/virtual-offices/${id}`],
} as const;

export const OWNER_EMAIL = 'jan.novak@example.com';
