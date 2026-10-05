# Plano — Portal TRAMA

## Objetivo
Adicionar uma área funcional `/portal` ao mesmo projeto, sem alterar, substituir ou reconstruir a landing institucional existente. O portal centraliza a aprovação de conteúdos entre a TRAMA e seus clientes.

## Arquitetura
- Manter `src/main.ts` e `src/styles.css` como a landing pública; nenhuma alteração estrutural, textual, visual ou de interação será feita neles.
- Adicionar uma aplicação de portal em módulos próprios (`src/portal/`) com rota separada e navegação isolada.
- Migrar o runtime para servidor Node/Express com Vite no desenvolvimento e build de produção, preservando a entrega da landing em `/`.
- Habilitar `server: true` e `database: true` para usar o MySQL gerenciado do projeto.
- Implementar tabelas/migrações para usuários, clientes, conteúdos e solicitações de alteração. O histórico fica associado ao conteúdo, nunca ao cliente inteiro.
- Usar Manus OAuth como login padrão do projeto. O primeiro usuário autenticado faz o bootstrap como administrador TRAMA; clientes cadastrados são vinculados ao e-mail do login Manus. O portal não terá senha própria nem IA.
- Upload: o servidor valida usuário, cliente, tipo e tamanho, solicita presign ao Storage API, transfere o arquivo e persiste a URL estável `/manus-storage/...` no banco.
- Todas as APIs validam sessão e escopo: administrador vê tudo; cliente vê somente conteúdos do próprio cliente.

## Fluxos
1. `/` continua sendo a landing atual.
2. `/portal` mostra entrada/login e, após autenticação, redireciona ao painel conforme o papel.
3. Administrador: resumo, filtros por cliente/status, cadastro de cliente, novo conteúdo, upload, envio para aprovação, acompanhamento e histórico.
4. Cliente: abas Aguardando sua aprovação, Aprovados e Alterações solicitadas; cada conteúdo mostra mídia, legenda, data, status, contador e histórico.
5. Aprovar muda o conteúdo para `Aprovado`.
6. Solicitar alteração abre a pergunta “O que você gostaria de alterar?”, registra a mensagem, incrementa o contador e muda o status para `Alteração solicitada`.
7. Reenviar para aprovação e publicar ficam disponíveis para o administrador conforme o fluxo.

## Design
- Movimento: dashboard editorial funcional, inspirado no branding gráfico contemporâneo da TRAMA.
- Princípios: clareza primeiro; informação em camadas; contraste alto; fio contínuo como orientação, não decoração.
- Cores: creme para respiro e superfícies, vinho para autoridade, azul-petróleo para áreas de trabalho, coral/vermelho queimado para ação e status.
- Layout: shell com barra lateral compacta e área de trabalho ampla; cards de conteúdo com mídia em destaque; filtros e estados sempre visíveis.
- Assinaturas: linha contínua no topo/entre módulos; pequenos pontos de conexão nos status; logo oficial e abreviação no portal.
- Interação: transições curtas e discretas; feedback imediato após aprovar, solicitar alteração, salvar e enviar.
- Tipografia: `Space Grotesk`/display para títulos e `Manrope`/body para leitura, alinhadas aos tokens já usados na landing; `DM Mono` para labels e status.
- Voz: direta, acolhedora e operacional. Exemplos: “O que precisa da sua aprovação?” e “O fio está claro. Pode seguir.”
- Essência: um espaço simples para transformar revisão dispersa em aprovação organizada.

## Estrutura prevista
- `server/index.ts`: servidor Express, Vite middleware em desenvolvimento, arquivos estáticos em produção.
- `server/auth.ts`: sessão OAuth Manus e resolução de papel.
- `server/db.ts`, `server/migrations/`: conexão MySQL e migrações aditivas.
- `server/routes/`: autenticação, clientes, conteúdos, aprovações, alterações e upload.
- `src/portal/`: UI, tipos, estado e estilos exclusivos do portal.
- `public/manus-routes.json`: `/` e `/portal`.
- `Dockerfile`: instalação, build e entrypoint de produção.

## Limites
- Não adicionar IA generativa, chatbot, geração de legendas ou automações desnecessárias.
- Não criar uma aplicação por cliente; é um único portal multi-tenant com permissões.
- Não mover, reescrever ou estilizar a landing atual.
