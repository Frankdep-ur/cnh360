
# Destacar Botão "Entrar com Google"

## Mudanças Visuais

O botão atual usa `variant="outline"` que é discreto. Vou torná-lo mais chamativo com:

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Estilo | Borda simples (outline) | Fundo branco com sombra e borda colorida |
| Ícone | Cor única | Cores oficiais do Google (azul, vermelho, amarelo, verde) |
| Posição | Abaixo do formulário | **Acima** do formulário, como opção principal |
| Texto | "Entrar com Google" | "Continuar com Google" + texto auxiliar |
| Efeito | Nenhum | Hover com elevação e borda destacada |

## Layout Proposto

```text
┌─────────────────────────────────────┐
│  [Logo Google colorido]             │
│  Continuar com Google               │
│                                     │
│  Botão branco, sombra, borda azul   │
│  no hover                           │
└─────────────────────────────────────┘
          ─── ou ───
     [Formulário email/senha]
```

## Seção Técnica

### Arquivo: `src/pages/Auth.tsx`

1. **Mover o botão Google para ANTES do formulário**
2. **Aplicar estilos destacados:**
   ```tsx
   <Button
     className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 
                border-gray-200 hover:border-primary shadow-md hover:shadow-lg 
                transition-all duration-200"
   >
   ```

3. **Usar cores oficiais do Google no ícone SVG:**
   - Azul: `#4285F4`
   - Verde: `#34A853`
   - Amarelo: `#FBBC05`
   - Vermelho: `#EA4335`

4. **Adicionar separador visual:**
   ```tsx
   <div className="relative my-6">
     <span>ou entre com email</span>
   </div>
   ```

5. **Texto auxiliar abaixo do botão:**
   ```tsx
   <p className="text-xs text-muted-foreground text-center mt-2">
     Rápido e seguro
   </p>
   ```
