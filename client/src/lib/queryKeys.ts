export const QUERY_KEYS = {
  contracts: (ownerEmail: string) => [`/api/contracts?ownerEmail=${ownerEmail}`],
  contract: (id: string) => [`/api/contracts/${id}`], 
  virtualOffices: () => ['/api/virtual-offices'],
  virtualOffice: (id: string) => [`/api/virtual-offices/${id}`],
} as const;

export const OWNER_EMAIL = 'jan.novak@example.com';
