# Voluntá+ — frontend

Aplicação web em React 18 para descobrir serviços voluntários, cadastrar serviços e avaliar iniciativas. A autenticação e a recuperação de senha usam Clerk; perfis, papéis, serviços e avaliações são persistidos na API VoluntPlus.

## Pré-requisitos

- Node.js 20.9 ou superior e npm;
- backend VoluntPlus em execução, com PostgreSQL e uma instância Clerk configurados;
- chave **publicável** do mesmo ambiente Clerk utilizado pelo backend.

## Executar localmente

Entre na pasta da aplicação (o nome `volunt+` contém o sinal `+`):

```bash
cd frontend/volunt+
npm ci
```

Crie o arquivo de ambiente a partir do exemplo. No PowerShell:

```powershell
Copy-Item .env.example .env
```

No macOS ou Linux:

```bash
cp .env.example .env
```

Configure as variáveis em `.env`:

```dotenv
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_sua_chave_publicavel
```

| Variável | Uso |
| --- | --- |
| `REACT_APP_API_URL` | URL base da API, **incluindo `/api`**. Ajuste a porta se o backend não estiver em `8080`. |
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | Chave pública da instância Clerk usada no frontend. Deve corresponder à instância configurada em `CLERK_ISSUER_URI` no backend. |

Inicie o backend e, em outro terminal, execute:

```bash
npm start
```

Abra <http://localhost:3000>. O backend deve permitir `http://localhost:3000` em `FRONTEND_URL` para o CORS e validar o token da mesma instância Clerk. Reinicie o servidor de desenvolvimento após alterar `.env`.

## Contas e permissões

O Clerk cria e verifica a identidade. Após a verificação, o frontend registra o perfil na API. Contas antigas que existem somente no Clerk podem usar `/completar-perfil` para criar o registro correspondente no backend. O frontend consulta `/api/v1/users/me` para obter o papel ativo; dados locais do navegador não concedem permissões.

| Ação | Visitante | Beneficiário | Ofertante |
| --- | --- | --- | --- |
| Consultar catálogo, detalhes e avaliações | Sim | Sim | Sim |
| Comentar e avaliar serviço de outra pessoa | Não | Sim | Não |
| Criar, editar e listar os próprios serviços | Não | Não | Sim |
| Consultar e editar o próprio perfil | Não | Sim | Sim |

Pessoa física pode trocar entre beneficiário e ofertante na página do próprio perfil. Pessoa jurídica permanece ofertante. A troca altera o acesso ativo, mas mantém os serviços e as avaliações vinculados à conta. O backend também verifica papel e propriedade do serviço; alterar a URL manualmente não autoriza operações.

As principais rotas são `/explorar` (catálogo), `/detalhes-servico/:id`, `/cadastro`, `/login`, `/perfil`, `/cadastrar-servico`, `/meus-servicos` e `/editar-servico/:id`. `/perfil/:id` consulta apenas um perfil público de ofertante; a edição do próprio perfil acontece em `/perfil`. Recuperação de senha: `/esqueci-minha-senha` e `/redefinir-senha`.

## Integração com a API

O código de integração fica em `src/api/`; o estado do usuário autenticado em `src/context/CurrentUserContext.jsx`; a proteção das rotas em `src/routes/RequireRole.jsx`. Requisições privadas recebem o token Clerk no cabeçalho `Authorization: Bearer ...`.

O catálogo e os serviços vêm do backend. Serviços antigos que existiam apenas no `localStorage` não aparecem na API; é preciso cadastrá-los novamente ou migrá-los para o PostgreSQL. Imagens enviadas no cadastro do serviço são armazenadas pelo backend e retornam como URL da API.

## Verificação

```bash
CI=true npm test -- --watch=false --runInBand
npm run build
```

No PowerShell, execute os testes sem a variável `CI` se preferir:

```powershell
npm test -- --watch=false --runInBand
npm run build
```

O build de produção é gerado em `build/`.

## Problemas comuns

| Sintoma | Verificação |
| --- | --- |
| `REACT_APP_CLERK_PUBLISHABLE_KEY precisa ser configurada` | Confira a chave em `.env` e reinicie `npm start`. |
| Perfil indisponível ou erro em `/api/v1/users/me` | Confira se a API, o PostgreSQL e as tabelas estão disponíveis. Se a conta existe só no Clerk, abra `/completar-perfil`. |
| Resposta `401` | Confirme que a chave pública e `CLERK_ISSUER_URI` pertencem à mesma instância Clerk. |
| Erro de CORS | Confira `FRONTEND_URL` no backend e a URL/porta usados no navegador. |
| Catálogo vazio | Confirme que há serviços cadastrados no PostgreSQL; o frontend não usa mais serviços salvos apenas no navegador. |

## Ajustes de cadastro e catálogo

Após criar a conta e salvar o perfil, o cadastro direciona à homepage (`/`).
A variável `REACT_APP_PASSWORD_MIN_LENGTH` precisa corresponder ao mínimo da instância Clerk.
O padrão é 8; alterar o frontend não altera a política do Clerk. Reinicie o frontend depois de mudar o `.env`.

O serviço só é salvo após revisar os dados, marcar a confirmação e clicar em Confirmar e salvar.
Serviços inativos ficam disponíveis em Meus serviços e saem do catálogo público.
O tipo de localização (Casa, Instituição, Local Público ou Outro) pertence ao serviço presencial.
O catálogo recebe gênero e idade do ofertante, sem expor sua data de nascimento.
Os dias e turnos são opções individuais, inclusive para registros antigos.
Avaliações são permitidas apenas a beneficiários em serviços de outras pessoas; o servidor verifica essa regra.
