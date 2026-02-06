
# Otimizacao do Scanner de QR Code - Escaneamento Rapido

## Problema

O escaneamento do QR Code pelo instrutor esta lento por uma combinacao de fatores tecnicos:

1. **QR Code muito denso**: O payload contem JSON com hash SHA-256 (aprox. 180 caracteres), renderizado com nivel de correcao de erro "H" (maximo). Isso gera um QR Code com muitos modulos (pontos), dificil de ler por cameras de celulares.

2. **Scanner nao otimizado**: A biblioteca `html5-qrcode` esta configurada com parametros conservadores - nao usa a API nativa do navegador (`BarcodeDetector`), escaneia todos os formatos de codigo (nao so QR), e a area de escaneamento e fixa em 250x250 pixels independente do tamanho da tela.

3. **QR Code pequeno na tela do aluno**: Renderizado com apenas 200px, obrigando o instrutor a aproximar muito o celular.

---

## Solucao em 3 Frentes

### Frente 1: Tornar o QR Code mais facil de ler (lado do aluno)

**Arquivo:** `src/components/qr/QRCodeDisplay.tsx`

- Reduzir nivel de correcao de erro de **"H" para "M"** (medio). Nivel "H" adiciona 30% de redundancia, gerando um QR muito denso. Nivel "M" (15%) e mais do que suficiente para uma tela de celular (que nao tera danos fisicos como um QR impresso).
- Aumentar tamanho do QR de **200px para 280px** - QR maior na tela = camera detecta mais rapido.
- Adicionar **`includeMargin={true}`** para garantir a "quiet zone" branca ao redor, que ajuda o decodificador a identificar os limites do codigo.

### Frente 2: Otimizar o scanner da camera (lado do instrutor)

**Arquivo:** `src/components/aula/GlobalInstructorQRScanner.tsx`

- Ativar **`useBarCodeDetectorIfSupported: true`** - usa a API nativa do navegador (suportada no Chrome/Android) que e significativamente mais rapida que a decodificacao por JavaScript puro.
- Adicionar **`formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]`** - atualmente o scanner tenta decodificar todos os formatos (Code128, EAN, Aztec, etc.) em cada frame. Limitando a apenas QR Code, ele foca 100% do processamento no formato correto.
- Aumentar **fps de 10 para 15** - mais frames processados por segundo = deteccao mais rapida.
- Tornar **qrbox dinamico** (70% da largura da tela) em vez de fixo 250px - area de deteccao maior captura o QR mais facilmente.
- Adicionar **`disableFlip: true`** - desativa a tentativa de leitura espelhada, economizando processamento.
- Reduzir **delay de inicializacao de 200ms para 50ms**.

### Frente 3: Mesmo tratamento no scanner generico

**Arquivo:** `src/components/qr/QRCodeScanner.tsx`

- Aplicar as mesmas otimizacoes do GlobalInstructorQRScanner: `useBarCodeDetectorIfSupported`, `formatsToSupport`, fps aumentado, qrbox dinamico, e `disableFlip`.

---

## Impacto Esperado

| Antes | Depois |
|-------|--------|
| QR Code denso (nivel H, 200px) | QR Code limpo (nivel M, 280px, com margem) |
| Scanner tenta todos os formatos | Scanner foca so em QR Code |
| Decodificacao 100% JavaScript | Usa API nativa do navegador quando disponivel |
| Area de scan fixa 250x250 | Area dinamica 70% da tela |
| 10 fps | 15 fps |
| Tentativa de leitura espelhada | Desativada (desnecessaria com camera traseira) |

O resultado combinado dessas mudancas deve reduzir o tempo de escaneamento de varios segundos para deteccao quase instantanea.

---

## Secao Tecnica - Detalhes de Implementacao

### QRCodeDisplay.tsx (QR do aluno)

Mudancas na renderizacao do QRCodeSVG:
- `level="H"` muda para `level="M"`
- `size={200}` muda para `size={280}`
- `includeMargin={false}` muda para `includeMargin={true}`

### GlobalInstructorQRScanner.tsx (Scanner do instrutor)

Importar `Html5QrcodeSupportedFormats` da biblioteca.

Mudancas na configuracao do scanner:
```text
// ANTES:
{
  fps: 10,
  qrbox: { width: 250, height: 250 },
}

// DEPOIS:
{
  fps: 15,
  qrbox: (viewfinderWidth, viewfinderHeight) => {
    const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7);
    return { width: size, height: size };
  },
  formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
  disableFlip: true,
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: true,
  },
  rememberLastUsedCamera: true,
}
```

Reduzir delay de DOM de 200ms para 50ms.

### QRCodeScanner.tsx (Scanner generico)

Mesmas otimizacoes de configuracao aplicadas ao scanner generico para consistencia.
