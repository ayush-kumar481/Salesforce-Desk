# Salesforce Desk

A full-stack web app for managing Salesforce Accounts, Opportunities, Leads, Contacts, and Cases. Sign in with Salesforce, browse records, and create, view, edit, or delete them without using the Salesforce interface.

## Features

- OAuth 2.0 authorization-code login through a Salesforce External Client App.
- Server-side token storage and refresh-token support.
- Six displayed fields per object, with object-specific create and edit forms.
- Infinite scroll that loads records 20 at a time.
- Search across records already loaded in the current list.
- API routes restricted to the five supported Salesforce objects and their allowed fields.

## Technology

- React and Vite
- Node.js and Express
- Salesforce REST API

## Requirements

- Node.js 20 or newer
- A Salesforce Developer Edition org
- An OAuth-enabled Salesforce External Client App

## Salesforce setup

### 1. Create a Developer Edition org

Sign up at [developer.salesforce.com/signup](https://developer.salesforce.com/signup), verify your email, and sign in to the org.

### 2. Allow the authorization-code flow for the org

In Salesforce Setup, open **OAuth and OpenID Connect Settings** and enable **Allow Authorization Code and Credentials Flows**. This org-wide setting is separate from the flow setting on the External Client App.

### 3. Create an External Client App

In Setup, open **External Client App Manager** and create an app with OAuth enabled. Configure it with:

- **Callback URL:** `http://localhost:3001/auth/callback` for local development. For Render, use `https://YOUR-SERVICE.onrender.com/auth/callback`.
- **Selected OAuth scopes:**
  - **Manage user data via APIs (`api`)**
  - **Perform requests at any time (`refresh_token`, `offline_access`)
  - **Access unique user identifiers (`openid`)
- **Flow:** Enable **Authorization Code and Credentials Flow**. Leave **Require user credentials in the POST body** unchecked.
- **PKCE:** The app uses an S256 code challenge and verifier. It supports the External Client App's PKCE requirement.
- **Permitted users:** For a personal Developer Edition demo, choose **All users can self-authorize**.
- **Client secret:** The app exchanges the OAuth code on its server. If Salesforce requires the secret, store it only in the server environment.

Save the app. Copy its Consumer Key and, if provided or required, Consumer Secret. Keep both private.

> Make sure `api` is in **Selected OAuth Scopes**, not just **Available OAuth Scopes**. The app needs this scope to access Salesforce REST API records.

## Run locally

Install dependencies and create your local environment file:

```powershell
npm install
Copy-Item .env.example .env
```

Set these values in `.env`:

```dotenv
SF_CLIENT_ID=your_consumer_key
SF_CLIENT_SECRET=your_consumer_secret
SF_CALLBACK_URL=http://localhost:3001/auth/callback
SF_LOGIN_URL=https://login.salesforce.com
SESSION_SECRET=use-a-long-random-value
COOKIE_SECURE=false
APP_URL=http://localhost:5173
```

For a Salesforce sandbox, set `SF_LOGIN_URL=https://test.salesforce.com`. Never commit `.env` or put the Consumer Secret in React code.

Start the API server and Vite client:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and select **Log in with Salesforce**. The OAuth callback is handled on port 3001; after login, the app returns to the Vite client on port 5173.

## Deploy on Render

The repository includes a Render Blueprint in `render.yaml`. In the Render Dashboard, choose **New → Blueprint**, connect the GitHub repository, and create the service. Render prompts for `SF_CLIENT_ID` and `SF_CLIENT_SECRET`; enter the External Client App credentials there. The Blueprint generates `SESSION_SECRET` and configures the build, start command, and production cookie settings.

After Render creates the service:

1. Copy the service's HTTPS URL, such as `https://salesforce-desk-ayush-kumar481.onrender.com`.
2. In the Render service's environment settings, add `SF_CALLBACK_URL` with the value `https://YOUR-SERVICE.onrender.com/auth/callback`, using the actual service URL.
3. In Salesforce Setup, update the External Client App callback URL to that exact same value and save.
4. Redeploy the Render service, open its HTTPS URL, and log in again.

The app serves its built client and API from the same origin. See the [Render Blueprint guide](https://render.com/docs/blueprint-spec) for details. Render's free web services sleep after 15 minutes without inbound traffic and can take about a minute to wake. This demo stores sessions in memory, so a service restart requires signing in again. See [Render's free service details](https://render.com/docs/free).

Render's free web services sleep after 15 minutes without inbound traffic and can take about a minute to wake. This demo stores sessions in memory, so a service restart requires signing in again. See [Render's free service details](https://render.com/docs/free).

## Project layout

```text
server/
  config.js            Environment and app configuration
  index.js             Express setup and route mounting
  objects.js           Salesforce object fields and form options
  salesforce.js        Salesforce REST requests and token refresh
  routes/
    api.js             Session and record API routes
    auth.js            OAuth login, callback, and logout routes
src/
  App.jsx              App state and page composition
  components/          Sidebar, table, forms, dialogs, and notices
  lib/                 API client and field-formatting helpers
  styles/              Base, layout, records, modal, and responsive styles
```

## Notes

- Salesforce permissions, sharing rules, validation rules, and required fields still apply to the signed-in user.
- The included Express session store is in memory and is intended for an assignment demo, not a production deployment with multiple server instances.
- Salesforce recommends External Client Apps for new OAuth integrations. See the [Salesforce OAuth guide](https://developer.salesforce.com/docs/platform/api-rest/guide/intro-oauth-and-connected-apps.html) and [REST API quickstart](https://developer.salesforce.com/docs/platform/connect-rest-api/guide/quickstart.html).
