# scrapTest

Minimalus monorepo startinis projektas: **NestJS (Fastify) + Prisma 7** backend ir **Next.js 16** frontend.

## Filosofija

**Visada naudojame naujausias stabilias ir praktiškai patikrintas technologijas. CommonJS (CJS) mums nepriimtinas — visas projektas yra ESM.**

Tai reiškia: tik `import`/`export` (be `require()`), `"type": "module"` visuose paketuose, `.js` plėtiniai santykiniuose importuose, `import.meta` vietoje `__dirname`, jokių CJS-only bibliotekų ar deprecated API. Naujausias **stabilus** major, ne RC/beta, ir tik po realaus patikrinimo (`pnpm verify`, migracijos, `/api/health`, UI).

Pilnos taisyklės ir versijų politika: [AGENTS.md](AGENTS.md). ESLint abiejuose apps draudžia `require()`, `module.exports`, `__dirname` ir `__filename`.

## Technologijos

| Sluoksnis    | Technologija                                                          | Versija                          |
| ------------ | --------------------------------------------------------------------- | -------------------------------- |
| Backend      | NestJS su Fastify adapteriu                                           | 12.2                             |
| ORM          | Prisma (naujasis `prisma-client` generatorius + `@prisma/adapter-pg`) | 7.10                             |
| Duomenų bazė | PostgreSQL (Docker Compose)                                           | 17                               |
| Frontend     | Next.js App Router, React                                             | 16.4 / 19.3                      |
| Validacija   | Zod 4 (Standard Schema) — bendra backend'ui ir frontend'ui            | 4.6                              |
| Kalba        | TypeScript (`strict: true`)                                           | 6.0 (API) / 5.9 (web)            |
| Įrankiai     | pnpm workspace, ESLint flat config, Prettier                          | pnpm 11 / ESLint 10 / Prettier 3 |

## Struktūra

```
scrapTest/
├── apps/
│   ├── api/                     # NestJS + Fastify
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Category + Product modeliai
│   │   │   └── migrations/      # migracijos (kategorijų seed duomenys)
│   │   ├── prisma.config.ts     # Prisma 7 konfigūracija (DB URL)
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── main.ts          # bootstrap (Fastify, CORS, /api prefix, validacijos pipe)
│   │       ├── app.module.ts    # ConfigModule + PrismaModule + moduliai
│   │       ├── health/          # GET /api/health (DB ping)
│   │       ├── categories/      # GET /api/categories
│   │       ├── products/        # GET/POST /api/products
│   │       └── prisma/          # PrismaService (driver adapter)
│   └── web/                     # Next.js App Router
│       ├── app/page.tsx         # startinis puslapis
│       ├── app/api-status.tsx   # API/DB būsenos kortelė (client)
│       ├── app/products/new/    # produkto įvedimo forma
│       ├── next.config.ts       # /api/* proxy į backend
│       └── app/globals.css
├── packages/
│   └── contracts/               # bendri Zod kontraktai + DTO tipai
│       └── src/product.ts       # createProductSchema (naudojama API ir web)
├── docker-compose.yml           # PostgreSQL 17
├── pnpm-workspace.yaml
└── package.json                 # bendri scriptai
```

## API

| Metodas | Kelias            | Paskirtis                                            |
| ------- | ----------------- | ---------------------------------------------------- |
| GET     | `/api`            | API informacija                                      |
| GET     | `/api/health`     | Būsena + DB ping                                     |
| GET     | `/api/categories` | Kategorijų sąrašas (formos pasiūlymams)              |
| GET     | `/api/products`   | Produktų sąrašas (su kategorija)                     |
| POST    | `/api/products`   | Sukurti produktą (`name`, `category`, `description`) |

`category` siunčiamas kaip **laisvas tekstas**. Jei tokios kategorijos dar nėra, ji sukuriama automatiškai: pavadinimas normalizuojamas į `slug` (lietuviškos raidės transliteruojamos, pvz., „Rankdarbiai iš medžio“ → `rankdarbiai-is-medzio`), todėl `Elektronika` ir `elektronika` nesidubliuoja.

## Reikalavimai

- **Node.js >= 22.12** (testuota su Node 26)
- **pnpm >= 11** — `corepack enable` arba `npm i -g pnpm`
- **Docker + Docker Compose** PostgreSQL konteineriui

## Greitas startas

```bash
pnpm install

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

pnpm db:up        # paleidžia PostgreSQL konteinerį
pnpm db:migrate   # sukuria DB schemą (pirma karta)

pnpm dev          # paleidžia API ir web kartu
```

Po paleidimo:

- Web — http://localhost:3000
- API — http://localhost:3001/api
- Health — http://localhost:3001/api/health

## Komandos

| Komanda                       | Ką daro                                                   |
| ----------------------------- | --------------------------------------------------------- |
| `pnpm dev`                    | Paleidžia `api` ir `web` dev režimu (watch)               |
| `pnpm dev:api`                | Tik NestJS API (http://localhost:3001)                    |
| `pnpm dev:web`                | Tik Next.js (http://localhost:3000)                       |
| `pnpm build`                  | Surinkia abu apps į produkcinius build'us                 |
| `pnpm verify`                 | `lint` + `typecheck` + `build` — pilnas patikrinimas      |
| `pnpm lint`                   | ESLint abiem apps                                         |
| `pnpm typecheck`              | `tsc --noEmit` abiem apps                                 |
| `pnpm format`                 | Prettier visam repo                                       |
| `pnpm db:up` / `pnpm db:down` | PostgreSQL konteineris (Docker Compose)                   |
| `pnpm db:migrate`             | `prisma migrate dev`                                      |
| `pnpm db:deploy`              | `prisma migrate deploy` (produkcijai)                     |
| `pnpm db:generate`            | Generuoja Prisma Client į `apps/api/src/generated/prisma` |
| `pnpm db:studio`              | Prisma Studio (DB naršymas)                               |

## Kaip veikia

**Backend.** `main.ts` sukuria Nest aplikaciją su `FastifyAdapter`, nustato globalų `/api` prefiksą, įjungia CORS ir graceful shutdown. `ConfigModule` nuskaito `apps/api/.env` ir validuoja, kad `DATABASE_URL` būtų nustatytas (`app.module.ts`). `PrismaService` yra globalus provideris, prijungiamas per `@prisma/adapter-pg` driver adapterį; jei DB dar nepasiekiama, aplikacija nesugriūva — `/api/health` grąžina `{"status":"degraded","db":"down"}`.

**Prisma 7.** Naudojamas naujasis `prisma-client` generatorius, kuris generuoja TypeScript kodą į `src/generated/prisma` (šis katalogas git'ui ignoruojamas). Kadangi abu apps yra ESM (`"type": "module"`), generatorius nustatytas `moduleFormat = "esm"` ir `importFileExtension = "js"` — todėl importai rašomi su `.js` plėtiniu, pvz. `import { PrismaClient } from '../generated/prisma/client.js'`. DB URL laikomas `prisma.config.ts` (nebe `schema.prisma`).

**Frontend.** `next.config.ts` perrašo `/api/:path*` į `API_URL` (default `http://localhost:3001`), todėl naršyklė kreipiasi į tą patį origin ir CORS nereikalingas. Startinis puslapis rodo stack'ą ir realiu laiku tikrina `/api/health`. Produkto forma (`/products/new`) kategorijų pasiūlymus (datalist) įkelia per `/api/categories`, bet kategoriją galima įrašyti laisvai — išsaugojimą siunčia į `/api/products`.

**Bendri kontraktai.** `packages/contracts` laiko Zod schemas ir DTO tipus. API juos naudoja per Nest 12 `StandardSchemaValidationPipe` (`@Body({ schema: createProductSchema })`), o web — tai pačiai validacijai prieš POST. Viena schema = nėra dvigubos tiesos, o klaidų žinutės vienodos abiejose pusėse. Paketą reikia perbuildinti po pakeitimų: `pnpm --filter @scraptest/contracts build` (tai daro ir `pnpm dev`, ir `pnpm build`).

**ESM.** NestJS 12 ir Prisma 7 yra ESM-first, todėl backend'e santykiniai importai turi `.js` plėtinius, o `tsconfig` naudoja `module`/`moduleResolution: nodenext`.

## Darbas su schema

1. Pakeiskite `apps/api/prisma/schema.prisma`.
2. Sukurkite migraciją: `pnpm db:migrate` (Prisma paprašys migracijos pavadinimo; galima iš karto: `pnpm --filter @scraptest/api exec prisma migrate dev --name add_field`).
3. Klientas persigeneruoja automatiškai; jei ne — `pnpm db:generate`.

Produkcijoje migracijas taikykite su `pnpm db:deploy`.

## Aplinkos kintamieji

`apps/api/.env` (žr. `.env.example`):

| Kintamasis     | Reikšmė                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL` | `postgresql://scraptest:scraptest@localhost:5432/scraptest?schema=public` |
| `PORT`         | `3001`                                                                    |
| `HOST`         | `0.0.0.0`                                                                 |

`apps/web/.env`:

| Kintamasis | Reikšmė                 |
| ---------- | ----------------------- |
| `API_URL`  | `http://localhost:3001` |

Šaknyje `.env` (nebūtinas) gali perrašyti `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` Docker Compose konteineriui.

## Ką toliau pridėti

- Produktų sąrašo puslapį (`GET /api/products` jau yra) ir redagavimą
- Kategorijų pervadinimą / sujungimą (dabar kuriamos automatiškai iš laisvo teksto, 4 bazinės — seed'inamos migracijoje)
- Puslapiavimą ir paiešką produktų sąraše
- Autentifikaciją (JWT / sesijos)
- Testus (Nest 12 numatytai naudoja Vitest) + E2E
- CI pipeline (install → lint → typecheck → build)

## Problemos

- **Portai užimti** — pakeiskite `PORT` (`apps/api/.env`) ir `API_URL` (`apps/web/.env`).
- **`/api/health` rodo `degraded`** — PostgreSQL nepasiekiama: `pnpm db:up`, tada `pnpm db:logs`.
- **Prisma įspėjimas apie Node versiją** — Prisma 7 oficialiai nurodo Node 20.19/22.12/24; su naujesniu Node įspėjimas yra kosmetinis, bet rekomenduojama naudoti LTS.
- **`prisma generate` be `.env`** — veikia (URL gali būti tuščias), bet `migrate` komandoms `DATABASE_URL` būtinas.
