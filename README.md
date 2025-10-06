## Tomodoro

A React Native pomodoro app with a Node/Express backend. This repository contains the mobile app under the project root and the backend API under `server/`.

### Features

- Pomodoro timer with customizable session lengths
- Basic auth (email/password, social auth placeholders)
- Friends, posts, and stats screens (backed by the Node API)

---

## Prerequisites

- Node.js 18+ and npm
- iOS: Xcode + CocoaPods (`gem install cocoapods`)
- Android: Android Studio + SDKs (if you add an Android project)

---

## Getting Started

### 1) Install dependencies

From the repo root:

```bash
npm install
```

Then for the backend:

```bash
cd server
npm install
```

If building iOS locally, install pods from the repo root:

```bash
cd ios && pod install && cd ..
```

### 2) Configure environment

Create environment files and secrets that are NOT committed to git:

- App (root): create a `.env` file for mobile-only secrets (if needed)
- Server: create `server/.env` with values like:

```bash
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace-with-32+char-random-string
```

If you use Firebase server SDK, place your service account file at `server/config/firebase-service-account.json` (this path is gitignored) and set in `server/.env` if you reference it via env var:

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=server/config/firebase-service-account.json
```

Never commit real keys. See Security below.

### 3) Start the backend

```bash
cd server
npm run dev
```

This starts the API on the port from `PORT` (default 4000). See `server/server.js` and `server/routes/*`.

### 4) Run the app

From the repo root:

```bash
npx react-native start
```

In a separate terminal, run iOS (Mac only):

```bash
npx react-native run-ios
```

If you add Android later:

```bash
npx react-native run-android
```

---

## Project Structure

```text
app/                 React Native app source (components, screens, context)
server/              Node/Express API (models, routes, controllers)
ios/                 iOS project files
FirebaseConfig.js    Client-side Firebase config (do not put secrets here)
```

Key app folders:

- `app/screens/` – UI screens like `HomeScreen.js`, `StatsScreen.js`
- `app/context/TimerContext.js` – Timer state management
- `app/config/api.js` – Client API base URL

Key server folders:

- `server/routes/` – HTTP routes
- `server/controllers/` – Request handlers
- `server/models/` – Mongoose models
- `server/middleware/` – Auth and helpers

---

## Security and Secrets

Sensitive files are ignored via `.gitignore`. Follow these rules:

- Never commit real API keys, JWT secrets, or database URIs
- Use `.env` files locally and environment variables in CI/hosting
- Keep `server/config/firebase-service-account.json` local only
- Avoid placing secrets in client code such as `FirebaseConfig.js`; anything shipped in the app is public

Rotate secrets immediately if accidentally committed. Consider using a secrets manager in production (e.g., 1Password, AWS Secrets Manager, GCP Secret Manager).

---

## Useful Scripts

From repo root:

- `npm install` – install app deps
- `npx react-native start` – start Metro bundler
- `npx react-native run-ios` – build and run iOS app

From `server/`:

- `npm run dev` – start API with live reload
- `npm start` – start API

---

## Troubleshooting

- iOS build errors: run `cd ios && pod install`, then clean build in Xcode
- Metro stuck: kill Metro (`lsof -i :8081`) and restart
- Network issues: verify `app/config/api.js` points to your server (e.g., `http://localhost:4000` or your LAN IP)

---

## License

MIT
