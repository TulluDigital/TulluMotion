# Demonstração de estoque — Thank God Multimarcas

## Apresentação
1. Abra `thankgod-painel.html` e escolha **Entrar na demonstração**. O e-mail é opcional e não é enviado nem usado para autenticação.
2. Clique em **Abrir vitrine demo** para manter a vitrine em outra aba do mesmo navegador.
3. Adicione marca, modelo, preço, descrição e fotos, e clique em **Publicar na vitrine demo**.
4. A vitrine demo reflete a alteração automaticamente. É possível editar, salvar rascunho, marcar vendido e retirar/republicar.
5. **Restaurar os quatro carros de exemplo** apaga apenas os dados locais de demonstração, após confirmação.

## Limites intencionais
- IndexedDB guarda o estoque e as fotos somente neste navegador e nesta origem. Dados não passam entre dispositivos, perfis ou navegadores.
- BroadcastChannel e uma notificação de storage sincronizam abas; ao voltar a uma aba, os dados também são recarregados.
- A vitrine normal (`thankgod.html`, sem `?demo=1`) permanece com os quatro anúncios da apresentação original.
- A demonstração não autentica usuários, não envia e-mails e não publica fotos na nuvem. Não deve ser apresentada como sistema de produção.
- O navegador pode remover dados locais; esta versão não serve como cadastro definitivo ou backup.

## Próxima etapa de produção
Substituir o adaptador `assets/thankgod-demo-store.js` por acesso a banco persistente, implementar autorização no servidor para um e-mail aprovado, acesso por link temporário, regras de armazenamento das imagens, tratamento de falhas e testes de acesso. Configurar domínio de retorno e entrega de e-mail. Não publicar chaves secretas em HTML ou JavaScript. A ativação depende da configuração e validação desses serviços; não é apenas trocar um link.

## Validação realizada
Cadastro com imagem e valor com centavos; atualização entre duas abas sem recarga; persistência após recarregar; alteração de preço; rascunho fora da vitrine; marcar como vendido; restauração dos exemplos; layout mobile e sintaxe JavaScript.
