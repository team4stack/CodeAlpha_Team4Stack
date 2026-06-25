# Azure deploy workflow — DISABLED during team development

The active workflow file was renamed so GitHub Actions does not run builds on push or manual trigger.

## When production release is ready

1. Rename `azure-webapp.yml.disabled` → `azure-webapp.yml`
2. Reconnect Azure Deployment Center (if needed)
3. GitHub → Actions → Run workflow

## Why this exists

- **Vercel disconnect** stops frontend auto-deploy from Vercel.
- **Azure portal disconnect** stops Azure pulling from its deployment center.
- **This file** stops GitHub Actions from building/deploying from `.github/workflows/`.

All three are separate controls.
