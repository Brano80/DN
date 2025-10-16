import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { Users, Video, MessageSquare, Calendar } from "lucide-react";

export default function VirtualOffice() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => setLocation('/')} />
          <h2 className="text-2xl font-semibold mb-2">Virtuálna kancelária</h2>
          <p className="text-muted-foreground mb-6">
            Spolupracujte s ostatnými na dokumentoch v reálnom čase
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 hover-elevate transition-all">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Videokonferencia</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pripojte sa k video stretnutiu pre podpisovanie dokumentov
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-video-call">
                    Spustiť video hovor
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover-elevate transition-all">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Chat s notárom</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Komunikujte priamo s notárom alebo právnym poradcom
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-chat">
                    Otvoriť chat
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover-elevate transition-all">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Zdieľanie dokumentov</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Zdieľajte dokumenty s inými stranami na podpis
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-share">
                    Zdieľať dokument
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover-elevate transition-all">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Plánovanie stretnutí</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Naplánujte si stretnutie s notárom alebo právnikom
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-schedule">
                    Naplánovať stretnutie
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
