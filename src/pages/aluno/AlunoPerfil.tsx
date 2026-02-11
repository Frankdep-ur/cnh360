import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Save, User, Mail, Phone, FileText, Car, Shield, ChevronRight, AlertTriangle, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { validateRealName, isTestAccountName } from "@/lib/nameValidation";
import { cn } from "@/lib/utils";

interface ProfileData {
  full_name: string;
  cpf: string;
  phone: string;
  cidade: string;
  avatar_url: string | null;
  is_test_account: boolean;
}

interface AlunoData {
  objetivo: string;
  categoria_pretendida: string;
  possui_carro_proprio: boolean;
  horas_praticas_completadas: number;
  horas_praticas_total: number;
}

export default function AlunoPerfil() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    cpf: "",
    phone: "",
    cidade: "",
    avatar_url: null,
    is_test_account: false,
  });
  const [alunoData, setAlunoData] = useState<AlunoData | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        const isTest = isTestAccountName(profileData.full_name);
        setProfile({
          full_name: profileData.full_name || "",
          cpf: profileData.cpf || "",
          phone: profileData.phone || "",
          cidade: profileData.cidade || "",
          avatar_url: profileData.avatar_url,
          is_test_account: isTest,
        });
      }

      const { data: alunoResult, error: alunoError } = await supabase
        .from("alunos")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!alunoError && alunoResult) {
        setAlunoData({
          objetivo: alunoResult.objetivo,
          categoria_pretendida: alunoResult.categoria_pretendida,
          possui_carro_proprio: alunoResult.possui_carro_proprio || false,
          horas_praticas_completadas: alunoResult.horas_praticas_completadas || 0,
          horas_praticas_total: alunoResult.horas_praticas_total || 20,
        });
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

  const handleNameChange = (value: string) => {
    setProfile({ ...profile, full_name: value });
    const validation = validateRealName(value);
    setNameError(validation.isValid ? null : validation.message || null);
  };

  const handleSave = async () => {
    // Validate name before saving
    const validation = validateRealName(profile.full_name);
    if (!validation.isValid) {
      setNameError(validation.message || "Nome inválido");
      toast({
        variant: "destructive",
        title: "Nome inválido",
        description: validation.message,
      });
      return;
    }

    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          cpf: profile.cpf,
          phone: profile.phone,
          cidade: profile.cidade,
        })
        .eq("id", user!.id);

      if (error) throw error;

      // Update test account status
      setProfile(prev => ({
        ...prev,
        is_test_account: isTestAccountName(profile.full_name)
      }));

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

  const handlePhotoUploaded = (url: string) => {
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

  const getObjetivoLabel = (objetivo: string) => {
    const labels: Record<string, string> = {
      primeira_habilitacao: "Primeira Habilitação",
      adicao_categoria: "Adição de Categoria",
      mudanca_categoria: "Mudança de Categoria",
      renovacao: "Renovação",
    };
    return labels[objetivo] || objetivo;
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
      <header className="bg-primary text-primary-foreground px-6 pt-6 pb-20 safe-top">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/aluno")}
              className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Meu Perfil</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Profile Card */}
      <div className="px-6 -mt-14">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-3xl shadow-elevated p-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center mb-6">
              <ProfilePhotoUpload
                userId={user!.id}
                currentPhotoUrl={profile.avatar_url}
                onPhotoUploaded={handlePhotoUploaded}
                userType="aluno"
                isTestAccount={profile.is_test_account}
              />
              
              <h2 className="mt-4 text-xl font-bold text-foreground">
                {profile.full_name || "Usuário"}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              
              {/* Test Account Badge */}
              {profile.is_test_account && (
                <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  Conta de Teste
                </div>
              )}
              
              {/* Status Badge */}
              {!profile.is_test_account && (
                <div className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  Aluno
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
                  onClick={() => {
                    setEditing(false);
                    setNameError(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="hero"
                  className="flex-1"
                  onClick={handleSave}
                  disabled={saving || !!nameError}
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
                  Nome completo *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={profile.full_name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    disabled={!editing}
                    placeholder="Seu nome real completo"
                    className={cn(
                      "h-12 pl-12 rounded-xl",
                      nameError && editing && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                {nameError && editing && (
                  <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {nameError}
                  </p>
                )}
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
                  Cidade
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={profile.cidade}
                    onChange={(e) => setProfile({ ...profile, cidade: e.target.value })}
                    disabled={!editing}
                    placeholder="Sua cidade"
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

          {/* Aluno Info */}
          {alunoData && (
            <div className="bg-card rounded-2xl shadow-card p-4 mt-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Informações da Habilitação
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Objetivo</span>
                  <span className="font-medium text-foreground">{getObjetivoLabel(alunoData.objetivo)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Categoria</span>
                  <span className="font-medium text-foreground">{alunoData.categoria_pretendida}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Carro próprio</span>
                  <span className="font-medium text-foreground">
                    {alunoData.possui_carro_proprio ? "Sim" : "Não"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Horas práticas</span>
                  <span className="font-medium text-primary">
                    {alunoData.horas_praticas_completadas}h / {alunoData.horas_praticas_total}h
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          <div className="mt-4">
            <NotificationSettings />
          </div>

          {/* Actions */}
          <div className="mt-4 space-y-3">
            <button className="w-full bg-card rounded-2xl p-4 flex items-center justify-between shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">Documentos RENACH</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button 
              onClick={() => {
                const phone = "5518981288372";
                const message = encodeURIComponent("Olá! Preciso de ajuda com a CNH360.");
                window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
              }}
              className="w-full bg-card rounded-2xl p-4 flex items-center justify-between shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-foreground block">Suporte</span>
                  <span className="text-xs text-muted-foreground">Falar pelo WhatsApp</span>
                </div>
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

      <BottomNav />
    </div>
  );
}
