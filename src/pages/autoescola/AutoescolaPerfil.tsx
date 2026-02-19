import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Building2, MapPin, Phone, Mail, 
  FileText, Settings, LogOut, Crown, ChevronRight, AlertTriangle, MessageCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { isTestAccountName } from "@/lib/nameValidation";
import { cn } from "@/lib/utils";

interface AutoescolaData {
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  credencial_detran: string;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  email: string | null;
}

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  is_test_account: boolean;
}

export default function AutoescolaPerfil() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: null,
    avatar_url: null,
    is_test_account: false,
  });
  const [autoescola, setAutoescola] = useState<AutoescolaData | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        const isTest = isTestAccountName(profileData.full_name);
        setProfile({
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          is_test_account: isTest,
        });
      }

      // Fetch autoescola data
      const { data: autoescolaData, error: autoescolaError } = await supabase
        .from("autoescolas")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!autoescolaError && autoescolaData) {
        setAutoescola({
          nome_fantasia: autoescolaData.nome_fantasia || autoescolaData.razao_social,
          razao_social: autoescolaData.razao_social,
          cnpj: autoescolaData.cnpj,
          credencial_detran: autoescolaData.credencial_detran,
          cidade: autoescolaData.cidade,
          estado: autoescolaData.estado,
          telefone: autoescolaData.telefone,
          email: autoescolaData.email,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUploaded = (url: string | null) => {
    setProfile(prev => ({ ...prev, avatar_url: url }));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Erro ao sair:", error);
      navigate("/", { replace: true });
      window.location.reload();
    }
  };

  // Check if autoescola is verified
  const isVerified = !profile.is_test_account && 
    !!profile.avatar_url && 
    !profile.avatar_url.includes("placeholder") &&
    !!autoescola?.credencial_detran;

  const menuItems = [
    { icon: Building2, label: "Dados da empresa", path: "/autoescola/configuracoes/empresa" },
    { icon: FileText, label: "Credencial DETRAN", path: "/autoescola/configuracoes/credencial" },
    { icon: Crown, label: "Upgrade para Premium", path: "/autoescola/planos", highlight: true },
    { icon: Settings, label: "Configurações", path: "/autoescola/configuracoes" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-6 py-6 pb-20 safe-top">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => navigate("/autoescola")}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <div className="flex items-center gap-4">
            <ProfilePhotoUpload
              userId={user!.id}
              currentPhotoUrl={profile.avatar_url}
              onPhotoUploaded={handlePhotoUploaded}
              userType="autoescola"
              isTestAccount={profile.is_test_account}
              size="md"
              userName={profile.full_name}
            />
            <div>
              <h1 className="text-xl font-bold">{autoescola?.nome_fantasia || "Autoescola"}</h1>
              {autoescola?.cidade && autoescola?.estado && (
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-white/80" />
                  <span className="text-white/80">{autoescola.cidade}-{autoescola.estado}</span>
                </div>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-4">
            {profile.is_test_account ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
                <AlertTriangle className="w-3 h-3" />
                Conta de Teste
              </div>
            ) : (
              <VerifiedBadge isVerified={isVerified} size="sm" className="bg-white/20 text-white" />
            )}
          </div>

          {/* Plano Badge */}
          <div className="mt-4 p-3 bg-white/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Plano atual</p>
              <p className="font-semibold">Gratuito</p>
            </div>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0"
              onClick={() => navigate("/autoescola/planos")}
            >
              <Crown className="w-4 h-4 mr-1" />
              Upgrade
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 -mt-6">
        <div className="max-w-md mx-auto space-y-4">
          {/* Info Card */}
          {autoescola && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Informações da empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">CNPJ</span>
                  <span className="text-sm font-medium">{autoescola.cnpj}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Credencial DETRAN</span>
                  <span className="text-sm font-medium">{autoescola.credencial_detran}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Razão Social</span>
                  <span className="text-sm font-medium">{autoescola.razao_social}</span>
                </div>
                {autoescola.telefone && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Telefone</span>
                    <span className="text-sm font-medium">{autoescola.telefone}</span>
                  </div>
                )}
                {autoescola.email && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">E-mail</span>
                    <span className="text-sm font-medium">{autoescola.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Menu Items */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                        item.highlight 
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        item.highlight 
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                          : "bg-emerald-100 text-emerald-600"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={cn(
                        "flex-1 text-left font-medium",
                        item.highlight && "text-amber-700"
                      )}>
                        {item.label}
                      </span>
                      <ChevronRight className={cn(
                        "w-5 h-5",
                        item.highlight ? "text-amber-500" : "text-muted-foreground"
                      )} />
                    </button>
                  );
                    })}

                {/* Suporte WhatsApp */}
                <button
                  onClick={() => {
                    const phone = "5518981288372";
                    const message = encodeURIComponent("Olá! Preciso de ajuda com a CNH360.");
                    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium block">Suporte</span>
                    <span className="text-xs text-muted-foreground">Falar pelo WhatsApp</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>

      <AutoescolaBottomNav />
    </div>
  );
}
