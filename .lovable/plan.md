

# Plano: Adicionar Botão de Suporte WhatsApp nos Perfis

## Resumo
Implementar um botão de "Suporte" em todas as páginas de perfil (Aluno, Instrutor e Autoescola) que, ao ser clicado, abre uma conversa direta no WhatsApp com o número de suporte da CNH360: **(18) 98128-8372**.

---

## Arquivos a Modificar

| Arquivo | Localização do Botão |
|---------|---------------------|
| `src/pages/aluno/AlunoPerfil.tsx` | Seção "Actions" (após Documentos RENACH) |
| `src/pages/instrutor/InstrutorPerfil.tsx` | Seção "Actions" (após Disponibilidade) |
| `src/pages/autoescola/AutoescolaPerfil.tsx` | Após menu items (antes do Logout) |

---

## Implementacao

### 1. Componente do Botão de Suporte

Cada página receberá um botão consistente com o design existente:

```
┌─────────────────────────────────────────────────┐
│  [💬]  Suporte                           [>]   │
│         Falar pelo WhatsApp                     │
└─────────────────────────────────────────────────┘
```

**Comportamento ao clicar:**
- Abre o WhatsApp Web/App com o número formatado
- URL: `https://wa.me/5518981288372?text=Olá! Preciso de ajuda com a CNH360.`

### 2. Icone e Estilo

- **Icone:** `MessageCircle` do Lucide (representando chat/suporte)
- **Cor do icone:** Verde (#25D366 - cor oficial do WhatsApp)
- **Background do container:** Verde claro (`bg-[#25D366]/10`)

### 3. Alteracoes por Arquivo

#### AlunoPerfil.tsx (linha ~411)
Adicionar botão entre "Documentos RENACH" e "Sair da conta"

#### InstrutorPerfil.tsx (linha ~503)
Adicionar botão entre "Disponibilidade" e "Sair da conta"

#### AutoescolaPerfil.tsx (linha ~165)
Adicionar item no Card de menu items com estilo consistente

---

## Detalhes Tecnicos

### Funcao de Abertura do WhatsApp

```typescript
const handleOpenSupport = () => {
  const phone = "5518981288372"; // (18) 98128-8372 formatado
  const message = encodeURIComponent("Olá! Preciso de ajuda com a CNH360.");
  window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
};
```

### Import Necessario
Adicionar `MessageCircle` ao import do Lucide em cada arquivo.

---

## Resultado Visual Esperado

Em todas as 3 paginas de perfil, o usuario vera:

**Aluno/Instrutor:**
```
┌─ Perfil Card ─────────────────────────────────┐
│  ...                                          │
├─ Actions ─────────────────────────────────────┤
│  [📄] Documentos RENACH              [>]      │
│  [💬] Suporte                        [>]   ← NOVO
│       Falar pelo WhatsApp                     │
│  [🚪] Sair da conta                           │
└───────────────────────────────────────────────┘
```

**Autoescola:**
```
┌─ Menu Items Card ─────────────────────────────┐
│  ...configuracoes...                          │
│  [💬] Suporte                        [>]   ← NOVO
│       Falar pelo WhatsApp                     │
└───────────────────────────────────────────────┘
│  [🚪] Sair da conta                           │
```

---

## Checklist de Implementacao

- [ ] Adicionar import `MessageCircle` em AlunoPerfil.tsx
- [ ] Adicionar botao de suporte em AlunoPerfil.tsx
- [ ] Adicionar import `MessageCircle` em InstrutorPerfil.tsx
- [ ] Adicionar botao de suporte em InstrutorPerfil.tsx
- [ ] Adicionar import `MessageCircle` em AutoescolaPerfil.tsx
- [ ] Adicionar botao de suporte em AutoescolaPerfil.tsx
- [ ] Testar abertura do WhatsApp em cada perfil

