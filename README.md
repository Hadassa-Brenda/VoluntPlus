# VoluntPlus (Voluntá+)

Plataforma para conectar pessoas e organizações a serviços e oportunidades de voluntariado.

## Arquitetura

- **Front-end:** React 18, React Router, Clerk e Material UI, localizado em `frontend/volunt+/`.
- **Back-end:** API hospedada no Render (configuração e endereço devem ser conferidos no ambiente de implantação).
- **Banco de dados:** Supabase (credenciais e políticas de acesso devem permanecer fora do repositório).

> Render e Supabase são serviços de hospedagem/infraestrutura, não substituem necessariamente os repositórios de código-fonte.

## Desenvolvimento local (front-end)

Pré-requisito: Node.js 20.9 ou superior.

```bash
cd frontend/volunt+
npm install
npm start
```

Para gerar uma versão de produção:

```bash
npm run build
```

Para executar os testes configurados:

```bash
npm test
```

Configure as variáveis de ambiente exigidas pela aplicação e pelo Clerk conforme o ambiente utilizado. **Não publique chaves privadas, tokens ou senhas.**

## Fluxo de alterações

Branch de trabalho: `fix/perfil-filtros-mobile-ux`, criada a partir de `main`. As alterações devem ser revisadas em Pull Request antes de qualquer merge.

### Melhorias planejadas

- Impedir a edição da data de nascimento no perfil, preservando a edição do gênero.
- Exibir a ação **Sair** no cabeçalho.
- Manter o acesso ao perfil disponível em telas pequenas.
- Corrigir filtros do catálogo, incluindo avaliação e opções sem resultados.
- Diferenciar respostas HTTP 401/403 (acesso negado ou autenticação) de 404 (não encontrado) ao consultar perfis.
- Corrigir o layout mobile dos campos de título, categoria, descrição e imagem do serviço.

Esses itens descrevem o escopo de trabalho e **não significam que todas as correções já foram implementadas ou testadas**.

## Validação recomendada

Verificar o login/logout, edição do perfil, filtros e cadastro de serviços em desktop e em larguras mobile (320 px, 375 px, 390 px e 768 px). Confirmar a integração com a API do Render e as permissões do Supabase antes de publicar.

## Segurança

Nunca inserir credenciais de produção no Git. Alterações de permissões e regras de acesso devem ser validadas também no servidor, não apenas na interface.
