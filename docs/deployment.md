# Cloudflare deployment

For local development, see [Development](development.md). Configure [Telegram authentication](telegram-auth.md), [Azure speech](azure-speech.md), and [speaking checks](speaking-checks.md) for the relevant services.

## Deploy to Cloudflare Workers

`wrangler.jsonc` serves `dist/` through Workers Static Assets and routes `/api` and `/api/*` to the Worker. Only API requests invoke the Worker. The `DB` binding connects it to the `aytim-db` D1 database.

### Database setup

The production database is already bound in `wrangler.jsonc`. For a new installation in another account, create its own database:

```sh
npm ci
npx wrangler login
npm run db:create
```

`db:create` creates `aytim-db` and writes its real `database_id` into the existing `DB` binding in `wrangler.jsonc`. Commit that configuration change to this repository so Git deployments use the same database. The ID identifies the database and is not a secret. No fabricated production database ID is checked in.

If `aytim-db` already exists, use `npx wrangler d1 list`, then add its ID as `database_id` in the existing binding instead of creating another database. Use the same Cloudflare account as the `aytim` Worker.

The token used by Cloudflare Git builds must have **D1 Edit** access to that account, in addition to its existing Worker deployment permissions. `npm run deploy` applies pending remote migrations first and only deploys the Worker after they succeed. Existing migrations are tracked and are not reapplied. A failed migration leaves the previous Worker deployment running.

### Connect this GitHub repository

In the Cloudflare dashboard, open **Workers & Pages**, create an application, and import `davletovb/aytim` from GitHub as a Worker. Use these settings:

| Setting | Value |
| --- | --- |
| Worker name | `aytim` |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | Leave empty |
| Deploy command | `npm run deploy` |

Keep these settings for an existing connected Worker. Complete the one-time D1 setup above, then Cloudflare installs the tooling declared in `package.json` and uses the checked-in Wrangler configuration. Once Git integration is connected, pushes to `main` trigger deployments in Cloudflare.

### Deploy from your machine

```sh
npm ci
npm run deploy:check
npx wrangler login
npm run deploy
```

`deploy:check` bundles the Worker and validates asset and binding configuration without publishing, applying remote migrations, or requiring a Cloudflare login. The actual deploy requires your Cloudflare account, the database created above, and prints the live URL. If you have access to multiple Cloudflare accounts, select the intended account when prompted or set `CLOUDFLARE_ACCOUNT_ID` in your local environment.

The production Worker name must match `name` in `wrangler.jsonc`. Add a custom domain through the Worker's **Settings > Domains & Routes** after deploying.

### Verify the deployed revision

For Git deployments, compare the source commit in Cloudflare's build details with
the latest commit on `main`, then confirm that the resulting version is the active
deployment. **Retry build** reruns the selected build's revision, so a successful
retry can still publish an older revision.

Pushes to the production branch trigger builds without requiring a pull request.
If a new commit has neither a Cloudflare check run nor a corresponding build in
Cloudflare's history, inspect the Git connection and build watch paths.

To publish the current source while investigating the Git trigger, switch a local
checkout to `main`, run `git pull --ff-only origin main`, and follow **Deploy from
your machine** above. This publishes the checked-out source directly with Wrangler.

## Database commands

| Command | Effect |
| --- | --- |
| `npm run db:migrate:local` | Apply migrations to local SQLite only |
| `npm run db:migrate:remote` | Apply migrations to the configured production D1 database |
| `npx wrangler d1 export aytim-db --remote --output aytim-backup.sql` | Export a production database backup; keep the file private |

Never bind a branch preview to the production database. If enabling Cloudflare branch previews, configure a separate preview D1 binding and apply the same migrations to that database.

## Cloudflare Pages alternative

The same `dist/` files also work as a static-only Cloudflare Pages site, with browser saves and JSON backups. D1 online saving and Telegram accounts use the Worker deployment above; this repository does not include Pages Functions. For static-only Pages, use these settings:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | `exit 0` |
| Build output directory | `dist` |

The root `wrangler.jsonc` is for Workers; Pages uses the dashboard settings above. Do not use `npm run deploy` as a Pages build command: it deploys the Worker. Publish only `dist/`, rather than the repository root.

The `.openai/hosting.json` file identifies the existing ChatGPT Sites publication. Cloudflare deployment uses `wrangler.jsonc` or the Pages settings instead.

## Cloudflare references

- [Deploy a static site on Workers](https://developers.cloudflare.com/workers/static-assets/get-started/)
- [Workers asset configuration](https://developers.cloudflare.com/workers/static-assets/binding/)
- [D1 getting started](https://developers.cloudflare.com/d1/get-started/)
- [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
- [Workers Git build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Deploy static HTML to Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
