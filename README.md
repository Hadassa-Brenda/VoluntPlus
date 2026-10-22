# VoluntPlus (Voluntá+)

Plataforma para conectar pessoas e organizações a serviços e oportunidades de voluntariado.

## Arquitetura

- **Front-end:** React 18, React Router, Clerk e Material UI, localizado em `frontend/volunt+/`.
- **Back-end:** API hospedada no Render (configuração e endereço devem ser conferidos no ambiente de implantação).
- **Banco de dados:** Supabase.


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
