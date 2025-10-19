import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  name: string;
  email: string;
  givenName?: string;
  familyName?: string;
}

interface CurrentUserResponse {
  user: User;
  mandates: Array<{
    ico: string;
    companyName: string;
    role: string;
  }>;
  activeContext?: string | null;
}

export function useCurrentUser() {
  const query = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  return {
    ...query,
    data: query.data?.user,
  };
}
