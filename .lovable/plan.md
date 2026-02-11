

## Remover Lucas Felipe Fagundes Tamaio da vitrine de instrutores

O instrutor Lucas Felipe Fagundes Tamaio ainda aparece na tabela de cache público (`instrutores_publico_cache`) com `ativo = true`, mesmo após tentativa anterior de exclusão.

### Ação

Executar um comando para desativar/remover o registro dele da tabela `instrutores_publico_cache`, garantindo que ele não apareça mais nos resultados de busca dos alunos.

Também verificar e desativar nas tabelas relacionadas (`instrutores`, `profiles`) para evitar que o cache seja recriado pelo trigger de sincronização automática.

### Resultado esperado

- Lucas Felipe **não aparecerá mais** na busca de instrutores
- Os outros 5 instrutores continuam aparecendo normalmente
- O trigger de sincronização não vai recriá-lo pois estará desativado na origem

