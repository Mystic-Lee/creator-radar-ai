# GitHub Actions Fix — CreatorRadar AI

## The Problem

Your GitHub Actions build is failing with:

  Error: Dependencies lock file is not found.
  Supported file patterns: package-lock.json, npm-shrinkwrap.json, yarn.lock

This happens because the existing workflow uses `cache: 'npm'` inside the
`actions/setup-node` step. That option requires a committed `package-lock.json`
with fully resolved package URLs — which doesn't exist yet because `npm install`
hasn't been run locally.

---

## The Fix (2 steps — takes ~2 minutes)

### Step 1 — Replace the workflow file

The failing workflow is at:
  .github/workflows/build.yml   (or similar name, e.g. ci.yml, release.yml)

**Delete** whatever .yml file is currently in .github/workflows/ and replace it
with the build.yml file included in this zip.

The new file is identical in what it does, but removes the `cache: 'npm'` line
that is causing the crash.

To do this in GitHub:
  1. Go to your repo on github.com
  2. Navigate to .github/workflows/
  3. Click the failing .yml file
  4. Click the pencil (Edit) icon
  5. Select all the text and paste the contents of the new build.yml file
  6. Click "Commit changes"

Or if working locally:
  cp build.yml  your-repo/.github/workflows/build.yml
  git add .github/workflows/build.yml
  git commit -m "fix: remove npm cache from CI workflow"
  git push


### Step 2 — Verify the workflow name

The failing workflow in your screenshot references these steps:
  - npm run setup
  - npm run build:main
  - npm run build:renderer
  - npm run smoke-test
  - electron-builder --win --config electron-builder.yml

Those scripts do NOT exist in the CreatorRadar AI package.json.
This means there is a DIFFERENT workflow file in your repo (not the one we provided).

Check your .github/workflows/ folder. If there are multiple .yml files,
delete all of them and use only the build.yml file from this zip.

---

## What the correct workflow does

1. Checks out your code
2. Sets up Node.js 20 (NO caching)
3. Runs:  npm install
4. Runs:  npm run build       (compiles TypeScript + Vite)
5. Runs:  npm run dist:win    (packages the Windows .exe)
6. Uploads CreatorRadarAI-Setup.exe as a downloadable artifact

After the workflow runs successfully, go to:
  GitHub repo → Actions → your workflow run → Artifacts section

You will find:
  CreatorRadarAI-Windows-N.zip  (contains CreatorRadarAI-Setup.exe)
  CreatorRadarAI-macOS-N.zip    (contains CreatorRadarAI.dmg)

Download and unzip to get the installer files.

---

## If the build still fails after the fix

Common issues:

| Error message                        | Fix                                           |
|--------------------------------------|-----------------------------------------------|
| Cannot find module 'better-sqlite3'  | Add `npm rebuild` step after `npm install`    |
| electron-builder not found           | Run `npm install` locally, check package.json |
| CSC_IDENTITY_AUTO_DISCOVERY error    | Already set to false in new workflow — OK     |
| No files found to upload             | Check that npm run dist:win completed OK      |

---

## After a successful build

Download the artifact ZIP from the Actions tab in GitHub.
Unzip it to find CreatorRadarAI-Setup.exe.
Run the installer on any Windows 10/11 machine.
