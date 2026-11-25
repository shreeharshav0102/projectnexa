# Gmail API setup for Render Free

Render Free blocks outbound SMTP, so this app can send verification messages through Gmail's HTTPS API instead. The app sends from the Gmail account authorized below. Website users do not need to sign in with Google.

## 1. Enable Gmail API and create OAuth credentials

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and select or create a project.
2. Open **APIs & Services → Library**, find **Gmail API**, and enable it.
3. Configure the OAuth consent screen. Choose **External** for a personal Gmail account, enter the required app/contact details, and add the Gmail account that will send Nexa codes as a test user.
4. Under **Data Access**, add this scope:

   `https://www.googleapis.com/auth/gmail.send`

5. Open **APIs & Services → Credentials → Create Credentials → OAuth client ID**. Choose **Web application** and add this authorized redirect URI:

   `https://developers.google.com/oauthplayground`

6. Save the OAuth client and keep its **Client ID** and **Client Secret** private.

## 2. Create a refresh token

1. Open the [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground).
2. Click the gear icon. Enable **Use your own OAuth credentials**, set **OAuth flow** to **Server-side**, and set **Access type** to **Offline**. Enter the Client ID and Client Secret from the previous section.
3. In Step 1, enter `https://www.googleapis.com/auth/gmail.send`, click **Authorize APIs**, and sign in as the same Gmail account used for `GMAIL_USER`.
4. In Step 2, click **Exchange authorization code for tokens** and copy the **Refresh token**.

Keep the refresh token private. It grants Nexa permission to send mail as that Gmail account. Do not paste it into chat or commit it to GitHub.

## 3. Add values to Render

In Render, open the **sec-project1 Web Service → Environment** and add:

| Key | Value |
| --- | --- |
| `EMAIL_PROVIDER` | `gmail-api` |
| `GMAIL_USER` | The Gmail address that authorized the API |
| `GOOGLE_CLIENT_ID` | The OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | The OAuth Client Secret |
| `GOOGLE_REFRESH_TOKEN` | The refresh token from OAuth Playground |

Keep the service's existing `MONGODB_URI`, `MONGODB_DB`, and `SESSION_SECRET` values. Save the changes and let Render redeploy.

## Important Google testing-mode limit

Google says refresh tokens for an External OAuth app left in **Testing** expire after 7 days when it requests Gmail scopes. This setup is suitable for initial testing, but lasting public use may require publishing the OAuth app and completing any verification Google requires. See Google's [OAuth documentation](https://developers.google.com/identity/protocols/oauth2) for current token and verification requirements.
