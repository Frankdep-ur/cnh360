import { useState, useRef } from "react";
import { Camera, Upload, User, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ProfilePhotoUploadProps {
  userId: string;
  currentPhotoUrl: string | null;
  onPhotoUploaded: (url: string) => void;
  userType: "aluno" | "instrutor" | "autoescola";
  isTestAccount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProfilePhotoUpload({
  userId,
  currentPhotoUrl,
  onPhotoUploaded,
  userType,
  isTestAccount = false,
  size = "lg",
  className
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-28 h-28"
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const buttonSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };

  const isRequired = userType === "instrutor" || userType === "autoescola";
  const hasRealPhoto = previewUrl && !previewUrl.includes("placeholder") && !previewUrl.includes("avatar");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Selecione uma imagem (JPG, PNG, etc.)"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB"
      });
      return;
    }

    setUploading(true);

    try {
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      
      // Delete existing avatar if any
      await supabase.storage
        .from("avatars")
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.jpeg`, `${userId}/avatar.webp`]);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Add timestamp to bust cache
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlWithTimestamp })
        .eq("id", userId);

      if (updateError) throw updateError;

      setPreviewUrl(urlWithTimestamp);
      onPhotoUploaded(urlWithTimestamp);

      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi salva com sucesso."
      });
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar foto",
        description: error.message
      });
      setPreviewUrl(currentPhotoUrl);
    } finally {
      setUploading(false);
    }
  };

  // For test accounts, show generic avatar without upload option
  if (isTestAccount) {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <div className={cn(
          "rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/30",
          sizeClasses[size]
        )}>
          <User className={cn("text-muted-foreground", iconSizes[size])} />
        </div>
        <span className="mt-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          Conta de Teste
        </span>
      </div>
    );
  }

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
        <div
          className={cn(
            "rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-all",
            sizeClasses[size],
            hasRealPhoto 
              ? "border-2 border-primary" 
              : "border-2 border-dashed border-muted-foreground/50 bg-muted hover:border-primary hover:bg-muted/80"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="animate-pulse flex items-center justify-center w-full h-full bg-muted">
              <Upload className={cn("text-muted-foreground animate-bounce", iconSizes[size])} />
            </div>
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <Camera className={cn("text-muted-foreground mb-1", size === "lg" ? "w-8 h-8" : "w-5 h-5")} />
              {size === "lg" && (
                <span className="text-xs text-muted-foreground">
                  Adicionar foto
                </span>
              )}
            </div>
          )}
        </div>

        {/* Camera button overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "absolute bottom-0 right-0 rounded-full flex items-center justify-center shadow-lg transition-colors",
            buttonSizes[size],
            hasRealPhoto
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
          )}
        >
          {hasRealPhoto ? (
            <Check className="w-4 h-4" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Status message */}
      {!hasRealPhoto && (
        <div className={cn(
          "mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
          isRequired 
            ? "bg-destructive/10 text-destructive" 
            : "bg-muted text-muted-foreground"
        )}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            {isRequired
              ? "Foto real exigida para credenciamento DETRAN"
              : "Foto ajuda na confiança"}
          </span>
        </div>
      )}

      {hasRealPhoto && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          Trocar foto
        </Button>
      )}
    </div>
  );
}
