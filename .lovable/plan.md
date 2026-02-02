

# Plano: Atualização da Página Exame Médico/Psicológico

## Mudanças Solicitadas

| Item | Atual | Novo |
|------|-------|------|
| Texto do botão | "Agendar pelo WhatsApp Agora" | "Fale com a gente no WhatsApp pra agendar!" |
| Ícone do botão | MessageCircle (azul) | Ícone WhatsApp personalizado (verde) |
| Texto antes do botão | Não existe | "Quanto antes fizer, mais rápido você avança pras aulas práticas!" |
| Link WhatsApp | `wa.me/5518981288372` | `wa.me/5518981288372?text=Oi! Vim do app CNH360...` |

---

## Arquivo a Modificar

**`src/pages/aluno/ExameMedico.tsx`**

### Mudança 1: Adicionar frase motivacional antes do botão (linha 188)

```tsx
// Após o Card de informações e antes do botão
<p className="text-center text-foreground font-semibold">
  Quanto antes fizer, mais rápido você avança pras{" "}
  <span className="text-primary">"aulas práticas"</span>!
</p>
```

### Mudança 2: Atualizar a função openWhatsApp (linha 121-123)

```tsx
const openWhatsApp = () => {
  const mensagem = encodeURIComponent(
    "Oi! Vim do app CNH360 e quero ajuda pra agendar o exame médico e psicológico pra minha CNH"
  );
  window.open(`https://wa.me/5518981288372?text=${mensagem}`, '_blank');
};
```

### Mudança 3: Substituir ícone e texto do botão (linhas 191-198)

```tsx
<Button
  onClick={openWhatsApp}
  className="w-full h-14 text-base font-bold gap-3 shadow-lg hover:shadow-xl transition-all"
  style={{ backgroundColor: '#25D366' }}  // Cor verde do WhatsApp
>
  {/* Ícone SVG do WhatsApp */}
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967..."/>
  </svg>
  Fale com a gente no WhatsApp pra agendar!
</Button>
```

---

## Resultado Visual

```text
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  [Card com informações sobre o exame]                      │
│                                                            │
│  Pronto pra agendar? Nossa equipe te ajuda...              │
│                                                            │
└────────────────────────────────────────────────────────────┘

  Quanto antes fizer, mais rápido você avança 
  pras "aulas práticas"!

┌────────────────────────────────────────────────────────────┐
│  [WhatsApp Icon]  Fale com a gente no WhatsApp pra agendar!│
│       (botão verde #25D366)                                │
└────────────────────────────────────────────────────────────┘
```

---

## Seção Técnica

### URL do WhatsApp com Mensagem Pré-escrita

```
https://wa.me/5518981288372?text=Oi!%20Vim%20do%20app%20CNH360%20e%20quero%20ajuda%20pra%20agendar%20o%20exame%20médico%20e%20psicológico%20pra%20minha%20CNH
```

### Ícone SVG do WhatsApp

Será utilizado o ícone oficial do WhatsApp em formato SVG inline para garantir o visual correto e cor verde característica.

