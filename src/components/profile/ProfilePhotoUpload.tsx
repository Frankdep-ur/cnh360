import { useState, useRef } from "react";
import { Camera, Upload, Trash2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfilePhotoUploadProps {
  userId: string;
  currentPhotoUrl: string | null;
  onPhotoUploaded: (url: string | null) => void;
  userType: "aluno" | "instrutor" | "autoescola";
  isTestAccount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  userName?: string;
}

function getInitials(name: string | undefined | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0][0] || "?").toUpperCase();
}

function getColorFromName(name: string | undefined | null): string {
  if (!name) return "hsl(200, 50%, 50%)";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

export function ProfilePhotoUpload({
  userId,
  currentPhotoUrl,
  onPhotoUploaded,
  userType,
  isTestAccount = false,
  size = "lg",
  className,
  userName,
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = { sm: "w-16 h-16", md: "w-20 h-20", lg: "w-28 h-28" };
  const iconSizes = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-12 h-12" };
  const buttonSizes = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-10 h-10" };
  const initialsFontSize = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };

  const hasRealPhoto = previewUrl && !previewUrl.includes("placeholder") && !previewUrl.includes("unsplash.com");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Arquivo inválido", description: "Selecione uma imagem (JPG, PNG, etc.)" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Arquivo muito grande", description: "A imagem deve ter no máximo 5MB" });
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      await supabase.storage
        .from("avatars")
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.jpeg`, `${userId}/avatar.webp`]);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlWithTimestamp })
        .eq("id", userId);
      if (updateError) throw updateError;

      setPreviewUrl(urlWithTimestamp);
      onPhotoUploaded(urlWithTimestamp);
      toast({ title: "Foto atualizada!", description: "Sua foto de perfil foi salva com sucesso." });
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({ variant: "destructive", title: "Erro ao enviar foto", description: error.message });
      setPreviewUrl(currentPhotoUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    try {
      await supabase.storage
        .from("avatars")
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.jpeg`, `${userId}/avatar.webp`]);

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);
      if (error) throw error;

      setPreviewUrl(null);
      onPhotoUploaded(null);
      toast({ title: "Foto removida", description: "Sua foto de perfil foi removida." });
    } catch (error: any) {
      console.error("Error removing photo:", error);
      toast({ variant: "destructive", title: "Erro ao remover foto", description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const initials = getInitials(userName);
  const bgColor = getColorFromName(userName);

  const avatarContent = uploading ? (
    <div className="animate-pulse flex items-center justify-center w-full h-full bg-muted">
      <Upload className={cn("text-muted-foreground animate-bounce", iconSizes[size])} />
    </div>
  ) : previewUrl && hasRealPhoto ? (
    <img src={previewUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
  ) : (
    <div
      className={cn("flex items-center justify-center w-full h-full font-bold text-white", initialsFontSize[size])}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        capture="user"
      />

      <div className="relative">
        {hasRealPhoto ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-all border-2 border-primary",
                  sizeClasses[size]
                )}
                disabled={uploading}
              >
                {avatarContent}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[160px]">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Pencil className="w-4 h-4 mr-2" />
                Alterar foto
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleRemovePhoto}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remover foto
              </DropdownMenuItem>
              <DropdownMenuItem>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div
            className={cn(
              "rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-all border-2 border-dashed border-muted-foreground/50 bg-muted hover:border-primary hover:bg-muted/80",
              sizeClasses[size]
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarContent}
          </div>
        )}

        {/* Camera button overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "absolute bottom-0 right-0 rounded-full flex items-center justify-center shadow-lg transition-colors",
            buttonSizes[size],
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {isTestAccount && (
        <span className="mt-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          Conta de Teste
        </span>
      )}
    </div>
  );
}
