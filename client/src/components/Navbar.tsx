import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Building2, User, ChevronDown, Check, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  name: string;
  email: string;
  givenName?: string;
  familyName?: string;
}

interface Mandate {
  ico: string;
  companyName: string;
  role: string;
}

interface CurrentUserResponse {
  user: User;
  mandates: Mandate[];
  activeContext: string | null;
}

export default function Navbar() {
  const [, setLocation] = useLocation();

  const { data, isLoading } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  const setContextMutation = useMutation({
    mutationFn: async (contextId: string) => {
      const response = await apiRequest('POST', '/api/set-context', { contextId });
      if (!response.ok) {
        throw new Error('Failed to set context');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-user'] });
      setLocation('/');
    },
  });

  const handleContextChange = (contextId: string) => {
    setContextMutation.mutate(contextId);
  };

  const handleLogout = () => {
    window.location.href = '/auth/logout';
  };

  if (!data?.user) {
    return (
      <nav className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Digital Notary</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    );
  }

  const user = data.user;
  const mandates = data.mandates || [];
  const activeContext = data.activeContext;

  // Find active company if context is set
  const activeCompany = activeContext && activeContext !== 'personal'
    ? mandates.find(m => m.ico === activeContext)
    : null;

  // Context display text
  const contextDisplay = isLoading
    ? "Načítavam kontext..."
    : activeCompany
    ? `${activeCompany.companyName} (${activeCompany.ico})`
    : `${user.name} (Fyzická osoba)`;

  const contextIcon = activeCompany ? Building2 : User;
  const ContextIcon = contextIcon;

  return (
    <nav className="border-b bg-background sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-8">
            <h1 
              className="text-xl font-semibold cursor-pointer hover-elevate px-2 py-1 rounded-md transition-colors" 
              onClick={() => setLocation('/')}
              data-testid="link-home"
            >
              Digital Notary
            </h1>
          </div>

          {/* Right side - Context Switcher & Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Context Switcher Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="min-w-[200px] justify-between"
                  disabled={isLoading}
                  data-testid="button-context-switcher"
                >
                  <div className="flex items-center space-x-2">
                    <ContextIcon className="w-4 h-4" />
                    <span className="truncate max-w-[180px]">{contextDisplay}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel>Prepnúť kontext</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Personal Profile Option */}
                <DropdownMenuItem
                  onClick={() => handleContextChange('personal')}
                  className="cursor-pointer"
                  data-testid="dropdown-item-personal"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">Fyzická osoba</p>
                      </div>
                    </div>
                    {!activeCompany && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>

                {/* Company Profiles */}
                {mandates.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Firemné profily
                    </DropdownMenuLabel>
                    {mandates.map((mandate) => (
                      <DropdownMenuItem
                        key={mandate.ico}
                        onClick={() => handleContextChange(mandate.ico)}
                        className="cursor-pointer"
                        data-testid={`dropdown-item-company-${mandate.ico}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4" />
                            <div>
                              <p className="font-medium truncate max-w-[180px]">
                                {mandate.companyName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                IČO: {mandate.ico} • {mandate.role}
                              </p>
                            </div>
                          </div>
                          {activeContext === mandate.ico && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator />
                
                {/* Manage Companies Link */}
                <DropdownMenuItem
                  onClick={() => setLocation('/select-company')}
                  className="cursor-pointer"
                  data-testid="dropdown-item-manage-companies"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  <span>Spravovať firemné profily</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                  data-testid="dropdown-item-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Odhlásiť sa</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
