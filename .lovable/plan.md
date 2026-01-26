
# Plano: Animacao Pulse no Botao WhatsApp

## Resumo
Adicionar uma animacao de pulse sutil ao botao flutuante do WhatsApp para chamar mais atencao dos visitantes na landing page.

---

## Arquivo a Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `src/pages/Index.tsx` | Adicionar classe `animate-pulse` customizada |

---

## Abordagem

Vou adicionar uma animacao de pulse usando uma sombra que pulsa suavemente ao redor do botao. Isso cria um efeito visual que chama atencao sem ser irritante.

### Estilo da Animacao

Em vez de usar o `animate-pulse` padrao do Tailwind (que altera opacidade), vou criar um efeito de "glow" pulsante usando box-shadow animado inline, que e mais elegante para botoes de CTA.

---

## Codigo Atualizado

### Linha 196-205 - Adicionar animacao

```typescript
className={cn(
  "fixed bottom-6 right-6 z-50",
  "w-14 h-14 rounded-full",
  "bg-[#25D366] hover:bg-[#20bd5a]",
  "flex items-center justify-center",
  "shadow-lg hover:shadow-xl",
  "transition-all duration-300",
  "hover:scale-110",
  "animate-[pulse-glow_2s_ease-in-out_infinite]",  // ADICIONAR
  showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
)}
```

### Adicionar keyframes inline via style

Como a animacao de glow nao existe no Tailwind por padrao, vou usar uma abordagem mais simples: adicionar a classe `animate-bounce-subtle` que ja existe no projeto (definida no tailwind.config.ts linhas 81-84).

---

## Solucao Final

Usar a animacao `animate-bounce-subtle` ja existente no projeto:

```typescript
className={cn(
  "fixed bottom-6 right-6 z-50",
  "w-14 h-14 rounded-full",
  "bg-[#25D366] hover:bg-[#20bd5a]",
  "flex items-center justify-center",
  "shadow-lg hover:shadow-xl",
  "transition-all duration-300",
  "hover:scale-110",
  "animate-bounce-subtle",  // ADICIONAR - ja existe no projeto!
  showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
)}
```

Esta animacao ja esta definida no `tailwind.config.ts`:
- Keyframe: move o botao 5px para cima e volta
- Duracao: 2 segundos
- Easing: ease-in-out
- Loop: infinito

---

## Resultado Visual

O botao tera um movimento sutil de "bounce" que:
- Sobe 5px e desce suavemente
- Repete a cada 2 segundos
- Para no hover (quando `hover:scale-110` assume)
- Nao e intrusivo mas chama atencao

---

## Checklist de Implementacao

- [ ] Adicionar classe `animate-bounce-subtle` ao botao WhatsApp
- [ ] Testar que a animacao funciona corretamente
- [ ] Verificar que nao interfere com hover states
