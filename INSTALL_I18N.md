# Install i18next Packages

## Quick Install

Run this command in your frontend directory or Docker container:

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

## Docker Installation

If using Docker, you can run:

```bash
docker-compose exec frontend npm install i18next react-i18next i18next-browser-languagedetector
```

Or rebuild the container:

```bash
docker-compose build frontend
docker-compose up -d frontend
```

## Verification

After installation, verify by checking `package.json`:

```json
"dependencies": {
  "i18next": "^23.x.x",
  "react-i18next": "^13.x.x",
  "i18next-browser-languagedetector": "^7.x.x"
}
```

The multilingual system is fully set up and ready to use once these packages are installed!



