# AGENTS.md — projekto taisyklės

Šis failas – privalomos gairės tiek žmonėms, tiek AI agentams, dirbantiems šiame repo.

## Filosofija

**Visada naudojame naujausias stabilias ir praktikoje patikrintas technologijas. CommonJS (CJS) mums nepriimtinas — visas projektas yra ESM.**

Naujausios ≠ eksperimentinės: imame naujausią **stabilų** major, kuris jau pagamintas ir palaikomas, o ne RC/beta/canary. „Patikrinta“ reiškia, kad prieš priimant versiją ar sprendimą jis praėjo realų patikrinimą (build, lint, typecheck, DB migracijos, endpointai, UI).

## Ką tai reiškia praktiškai

| Taisyklė                                                                       | Pavyzdys                                                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Visi `package.json` turi `"type": "module"`                                    | `apps/api`, `apps/web`                                                   |
| Tik `import` / `export`, jokio `require()` / `module.exports`                  | `import { NestFactory } from '@nestjs/core'`                             |
| Santykiniai importai su `.js` plėtiniu (ESM + `nodenext`)                      | `import { AppModule } from './app.module.js'`                            |
| Vietoje `__dirname` / `__filename` – `import.meta.dirname` / `import.meta.url` | ESLint konfigūracijoje                                                   |
| Nenaudojame CJS-only bibliotekų ir interop shim'ų                              | jei biblioteka tik CJS – ieškome alternatyvos arba dokumentuojame išimtį |
| Nenaudojame deprecated API, jei yra naujas kelias                              | Prisma `prisma-client` generatorius, Nest 12 ESM, Standard Schema        |
| Naujausias stabilus major, ne beta                                             | NestJS 12, Prisma 7, Next.js 16                                          |

**Išimtis** galima tik su aiškiu pagrindimu PR apraše (pvz., kritinė biblioteka neturi ESM alternatyvos). Tokiu atveju izoliuojame ją viename adapteryje ir neleidžiame CJS „nutekėti“ į aplikacijos kodą.

## Bendri kontraktai

- Visos API schemos ir DTO tipai gyvena `packages/contracts` (Zod 4, Standard Schema).
- Backend'as validuoja per Nest `StandardSchemaValidationPipe`, frontend'as — tą pačią schemą prieš POST.
- Draudžiama dubliuoti validacijos taisykles `apps/` kode ar hardcode'inti laukų ilgių.
- Keičiant kontraktą: atnaujinti schemą, perbuildinti paketą (`pnpm --filter @scraptest/contracts build`), patikrinti abi puses.

## Versijų politika

1. Renkamės naujausią stabilų major, kuris aktyviai palaikomas.
2. Prieš atnaujindami įsitikiname, kad:
   - `pnpm verify` praeina (lint + typecheck + build),
   - `pnpm db:migrate` / `pnpm db:deploy` veikia,
   - `/api/health` grąžina `ok`,
   - UI atsidaro ir API būsena rodoma teisingai.
3. `pnpm-lock.yaml` visada commit'inamas.
4. Kritinės priklausomybės fiksuojamos tiksliai (pvz., `next`, `prisma`), likusios – su `^`.
5. Nenaudojame `--force` / `--legacy-peer-deps` tipo apeinimų; jei peer konfliktas – sprendžiame versijomis, ne vėliavėlėmis.

## Dabartinis stack'as

| Sluoksnis | Technologija                                           | Major               |
| --------- | ------------------------------------------------------ | ------------------- |
| Backend   | NestJS + Fastify                                       | 12                  |
| ORM       | Prisma (`prisma-client` generatorius + driver adapter) | 7                   |
| DB        | PostgreSQL (Docker)                                    | 17                  |
| Frontend  | Next.js App Router + React                             | 16 / 19             |
| Kalba     | TypeScript `strict`                                    | 6 (api) / 5.9 (web) |
| Įrankiai  | pnpm workspace, ESLint flat config, Prettier           | 11 / 10 / 3         |

## Kaip tikrinama

```bash
pnpm verify        # lint + typecheck + build
pnpm db:migrate    # jei keitėsi schema
pnpm dev           # rankinis smoke test: web + /api/health
```

## Naujos priklausomybės

- Pirmenybė ESM-native arba dual ESM/CJS paketams.
- Naujausia stabili versija, aktyviai palaikoma.
- Patikriname Node suderinamumą (repo: Node >= 22.12) ir poveikį bundle dydžiui.
- CJS-only paketas – tik su pagrindimu ir izoliuotas adapteryje.

## Apsauga kode

- `tsconfig`: `module` / `moduleResolution` = `nodenext`.
- ESLint `no-restricted-syntax` draudžia `require()`, `module.exports`, `__dirname`, `__filename` abiejuose apps.
- `pnpm verify` naudojamas prieš kiekvieną commit'ą / PR.
