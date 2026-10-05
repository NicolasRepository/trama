# TODO — Portal TRAMA

- [x] **Área separada e identidade visual:** criar uma aplicação funcional em `/portal`, dentro do mesmo projeto, sem alterar, substituir, reconstruir ou modificar a landing institucional; preservar na landing estrutura, textos, cores, fontes, ilustrações, layout, animações, seções e posicionamentos. O portal deve reutilizar a identidade visual TRAMA, com mesmas cores, fontes, linguagem, linhas contínuas e estética moderna, estratégica, criativa e profissional, mas ser simples, claro, funcional, rápido e sem excesso de efeitos.

- [x] **Acessos e permissões:** implementar login Manus OAuth e dois papéis: administrador TRAMA com acesso completo, cadastro de clientes, visualização de todos os clientes, criação/upload de conteúdos, acompanhamento de aprovações, alterações e histórico; cliente com acesso individual e visualização exclusiva dos próprios conteúdos, podendo aprovar ou solicitar alteração. Não implementar IA, chatbot ou login paralelo por senha.

- [x] **Cadastro de clientes:** no painel administrativo existir `+ Novo cliente`, permitindo nome da empresa/cliente, nome do responsável, e-mail e acesso/login. Cada cliente deve ter seu próprio ambiente dentro do único Portal TRAMA multi-cliente, sem criar uma aplicação separada por cliente.

- [x] **Conteúdos e upload:** no painel existir `+ Novo conteúdo`, permitindo selecionar cliente, fazer upload direto de imagem/vídeo pelo portal, adicionar título/nome, legenda, data prevista de publicação, tipo de conteúdo e enviar para aprovação. Uploads devem ir para armazenamento persistente e não exigir intervenção do Manus/IA a cada arquivo.

- [x] **Estados de aprovação:** cada conteúdo deve usar os status Rascunho, Aguardando aprovação, Aprovado, Alteração solicitada, Reenviado para aprovação e Publicado. Cliente deve ver claramente `APROVAR` e `SOLICITAR ALTERAÇÃO` quando aplicável.

- [x] **Solicitações e histórico:** `SOLICITAR ALTERAÇÃO` deve abrir `O que você gostaria de alterar?`, registrar a mensagem, mudar para `Alteração solicitada`, deixar a TRAMA visualizar e incrementar o contador específico daquele conteúdo. Exibir `Alterações solicitadas: 1`, depois 2 etc., e histórico com Alteração 1, Alteração 2 e mensagens.

- [x] **Painel administrador:** mostrar conteúdos aguardando aprovação, aprovados, com alteração solicitada, publicados e quantidade total de solicitações; permitir filtrar por cliente e status.

- [x] **Painel cliente:** mostrar rapidamente `Aguardando sua aprovação`, `Aprovados` e `Alterações solicitadas`; cada conteúdo deve mostrar arte/vídeo, legenda, data, status, contador de alterações e histórico quando houver.

- [x] **Persistência e segurança:** usar banco gerenciado para usuários/clientes/conteúdos/histórico; validar sessão e escopo em todas as APIs; validar upload no servidor; não expor credenciais; manter a landing pública intacta.

