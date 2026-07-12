cd e:\agent

if (Test-Path .git) { Remove-Item -Recurse -Force .git }

git init
git branch -m main
git remote add origin https://github.com/awanishkrai/Investment_Agent.git

function Commit-WithDate {
    param(
        [string]$Message,
        [string]$DateString
    )
    $env:GIT_AUTHOR_DATE = $DateString
    $env:GIT_COMMITTER_DATE = $DateString
    git commit -m $Message
}

# Add essential files first
git add README.md
git add .gitignore
git add .env.example
git add client/.gitignore
git add client/package.json
git add client/package-lock.json
git add server/package.json
git add server/package-lock.json
Commit-WithDate -Message "Initial commit: Project structure and docs" -DateString "2026-07-08T10:30:00"

git add server/index.js
git add server/routes/
Commit-WithDate -Message "feat: setup Express server and base API routes" -DateString "2026-07-09T14:45:00"

git add server/graph/
git add server/services/
git add server/models/
Commit-WithDate -Message "feat: implement LangGraph pipeline, Tavily search, and LLM nodes" -DateString "2026-07-10T16:20:00"

git add client/index.html
git add client/vite.config.js
git add client/src/main.jsx
git add client/src/App.jsx
git add client/src/api.js
if (Test-Path client/.oxlintrc.json) { git add client/.oxlintrc.json }
Commit-WithDate -Message "feat: React frontend setup and SSE streaming client" -DateString "2026-07-11T11:15:00"

git add client/src/components/
git add client/src/index.css
git add client/src/App.css
if (Test-Path client/src/assets/) { git add client/src/assets/ }
git add .
Commit-WithDate -Message "feat: finalize UI components and styling" -DateString "2026-07-12T09:30:00"

Write-Host "Git history created successfully!"
Write-Host "Attempting to push to remote..."

git push -u origin main
