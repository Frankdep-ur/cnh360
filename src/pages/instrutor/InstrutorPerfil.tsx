import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, LogOut, Save, User, Mail, Phone, FileText, Car, Shield, ChevronRight, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InstructorBottomNav } from "@/components/layout/InstructorBottomNav";
import { cn } from "@/lib/utils";

interface ProfileData {
  full_name: string;
  cpf: string;
  phone: string;
  avatar_url: string | null;
}

interface InstrutorData {
  credencial_detran: string;
  cnh_numero: string;
  cnh_categoria: string;
  preco_hora: number;
  nota_media: number;
  total_aulas: number;
}

interface VeiculoData {
  modelo: string;
  placa: string;
  transmissao: string;
}

export default function InstrutorPerfil() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    cpf: "",
    phone: "",
    avatar_url: null,
  });
  const [instrutorData, setInstrutorData] = useState<InstrutorData | null>(null);
  const [veiculoData, setVeiculoData] = useState<VeiculoData | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          cpf: profileData.cpf || "",
          phone: profileData.phone || "",
          avatar_url: profileData.avatar_url,
        });
      }

      // Fetch instrutor data
      const { data: instrutorResult, error: instrutorError } = await supabase
        .from("instrutores")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!instrutorError && instrutorResult) {
        setInstrutorData({
          credencial_detran: instrutorResult.credencial_detran,
          cnh_numero: instrutorResult.cnh_numero,
          cnh_categoria: instrutorResult.cnh_categoria,
          preco_hora: Number(instrutorResult.preco_hora) || 80,
          nota_media: Number(instrutorResult.nota_media) || 5,
          total_aulas: instrutorResult.total_aulas || 0,
        });

        // Fetch veiculo data
        const { data: veiculoResult, error: veiculoError } = await supabase
          .from("veiculos")
          .select("*")
          .eq("instrutor_id", instrutorResult.id)
          .maybeSingle();

        if (!veiculoError && veiculoResult) {
          setVeiculoData({
            modelo: veiculoResult.modelo,
            placa: veiculoResult.placa,
            transmissao: veiculoResult.transmissao,
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar perfil",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          cpf: profile.cpf,
          phone: profile.phone,
        })
        .eq("id", user!.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas.",
      });
      
      setEditing(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

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
      <header className="bg-secondary text-secondary-foreground px-6 pt-6 pb-16 safe-top">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-secondary-foreground/20 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Meu Perfil</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Profile Card */}
      <div className="px-6 -mt-10">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-3xl shadow-elevated p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="mt-4 text-xl font-bold text-foreground">
                {profile.full_name || "Instrutor"}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {instrutorData && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-amber-500 text-lg">★</span>
                  <span className="font-semibold text-foreground">{instrutorData.nota_media.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({instrutorData.total_aulas} aulas)</span>
                </div>
              )}
            </div>

            {/* Edit Toggle */}
            {!editing ? (
              <Button
                variant="outline"
                className="w-full mb-6"
                onClick={() => setEditing(true)}
              >
                Editar dados
              </Button>
            ) : (
              <div className="flex gap-3 mb-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="hero-secondary"
                  className="flex-1"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Salvar"}
                  <Save className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    disabled={!editing}
                    className="h-12 pl-12 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  CPF
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={profile.cpf}
                    onChange={(e) => setProfile({ ...profile, cpf: formatCPF(e.target.value) })}
                    disabled={!editing}
                    maxLength={14}
                    className="h-12 pl-12 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: formatPhone(e.target.value) })}
                    disabled={!editing}
                    maxLength={15}
                    placeholder="(00) 00000-0000"
                    className="h-12 pl-12 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="h-12 pl-12 rounded-xl bg-muted"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Instrutor Info */}
          {instrutorData && (
            <div className="bg-card rounded-2xl shadow-card p-4 mt-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary" />
                Credenciais
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Credencial DETRAN</span>
                  <span className="font-medium text-foreground">{instrutorData.credencial_detran}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">CNH</span>
                  <span className="font-medium text-foreground">{instrutorData.cnh_numero}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Categoria</span>
                  <span className="font-medium text-foreground">{instrutorData.cnh_categoria}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Preço/hora</span>
                  <span className="font-medium text-secondary">
                    R$ {instrutorData.preco_hora.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Veiculo Info */}
          {veiculoData && (
            <div className="bg-card rounded-2xl shadow-card p-4 mt-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-secondary" />
                Veículo
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Modelo</span>
                  <span className="font-medium text-foreground">{veiculoData.modelo}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Placa</span>
                  <span className="font-medium text-foreground">{veiculoData.placa}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Câmbio</span>
                  <span className="font-medium text-foreground capitalize">{veiculoData.transmissao}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 space-y-3">
            <button className="w-full bg-card rounded-2xl p-4 flex items-center justify-between shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-secondary" />
                </div>
                <span className="font-medium text-foreground">Dados bancários</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full bg-card rounded-2xl p-4 flex items-center justify-between shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <span className="font-medium text-foreground">Disponibilidade</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <Button
              variant="outline"
              className="w-full h-14 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sair da conta
            </Button>
          </div>
        </div>
      </div>

      <InstructorBottomNav />
    </div>
  );
}
