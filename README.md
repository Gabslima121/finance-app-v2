# finance-app

Site do controle financeiro pessoal. Next.js 16 (App Router, Cache Components) + Tailwind CSS 4.

## Requisitos

- Node.js 24+
- pnpm 11
- [finance-api](https://github.com/Gabslima121/finance-api-v2) rodando (por padrão em `http://localhost:3333`)

## Primeira vez

```bash
cp .env.example .env
pnpm install
pnpm dev
```

O site sobe em `http://localhost:3001`. A página **Status** mostra se a API e o banco estão de pé.

## Scripts

| Script                      | O que faz                                         |
| --------------------------- | ------------------------------------------------- |
| `pnpm dev`                  | Next em modo desenvolvimento na porta 3001        |
| `pnpm build` / `pnpm start` | Build e servidor de produção                      |
| `pnpm lint`                 | ESLint com as regras do Next                      |
| `pnpm typecheck`            | Gera os tipos das rotas e roda `tsc --noEmit`     |
| `pnpm test`                 | Vitest + Testing Library, arquivos `*.test.ts(x)` |
| `pnpm format`               | Prettier (com ordenação de classes do Tailwind)   |

## Organização

```
src/
├── app/          rotas (App Router): page, layout, loading, error
├── components/   componentes de UI
├── lib/
│   ├── env.ts    variáveis de ambiente do servidor, validadas com zod
│   └── api/      cliente HTTP tipado da API (só no servidor)
└── test/         setup do Vitest
```

## Decisões

- **Dados buscados no servidor.** Páginas são Server Components e chamam a API pelo `apiFetch` (`src/lib/api/client.ts`). A URL da API (`API_URL`) nunca vai para o navegador; o pacote `server-only` quebra o build se alguém importar esse código num Client Component.
- **Cache Components ligado.** Dado dinâmico (que muda a cada requisição) fica dentro de um limite de `Suspense`. O jeito mais simples é um `loading.tsx` na pasta da rota, como em `app/status/`.
- **Erros por rota.** Cada rota pode ter um `error.tsx` (Client Component) com botão de tentar de novo (`retry`).
