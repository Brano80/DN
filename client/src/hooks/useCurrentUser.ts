import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  name: string;
  email: string;
  givenName?: string;
  familyName?: string;
}

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ['/api/current-user'],
    retry: false,
  });
}
