# LearnHub

A small learning management system (LMS) built with Vite + React and a Flask + MongoDB API.
Deployed at https://learn.sumii.me/

## Running locally

**1. Start MongoDB**:

```bash
docker run -d --name learnhub-mongo -p 127.0.0.1:27017:27017 -v learnhub-mongo:/data/db mongo:7
```

Later, `docker start learnhub-mongo` brings it back up.

**2. Set up and start the API**:

```bash
cd server
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
```

uncomment `COOKIE_SECURE=0`.
Then run:

```bash
cd src
set -a; source ../.env; set +a
../.venv/bin/flask --app main run --port 8000 --debug
```

**3. Start the frontend**:

```bash
npm install
npm run dev
```

## Features

- Dashboard with stats and "continue learning" cards
- Course catalog with search, category filter, and enroll/unenroll
- Course detail page with lesson checklist
- Multiple-choice assessment
- Profile settings

## Your task

This version of LearnHub has problems — both bugs and usability issues.
Explore the app, find as many as you can, and ship an improved version.

## Deploying

`./deploy.sh` builds the frontend and uploads it and the API to https://learn.sumii.me.
It reads the server's SSH details from `~/dev/Interlude/.secrets`. Use `--frontend-only` to skip
the API and `--skip-typecheck` to build even if `tsc` fails.
