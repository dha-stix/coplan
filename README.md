# Coplan

A Trello-style planning app for teams: workspaces, projects, drag-and-drop boards, comments with @mentions, an in-app notification bell and email invites. Built with Next.js 16, TypeScript, Tailwind CSS 4, Firebase (Auth + Firestore), dnd-kit, Motion and EmailJS.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the keys below
npm run dev
```

The marketing pages work without any keys. Sign-in and the app need Firebase.

## Connect Firebase

1. Create a Firebase project and add a **Web app**. Copy its config values into `.env.local` (`NEXT_PUBLIC_FIREBASE_*`).
2. **Authentication → Sign-in method**: enable **Google** and **Email/Password**. Add your local and production domains under *Authorized domains*.
3. **Firestore Database**: create a database, then deploy the rules and indexes from this repo:

   ```bash
   npx firebase-tools login
   npx firebase-tools use <your-project-id>
   npx firebase-tools deploy --only firestore:rules,firestore:indexes
   ```

   The indexes cover the notification feed and the cross-project "Assigned to me" query. If Firestore ever asks for another index, the error message contains a one-click link to create it.

4. **Branded password reset page.** Coplan has its own page for choosing a new password at `/auth/action`. To make Firebase's reset emails open it:
   - **Authentication → Templates → Password reset →** click the pencil icon → **Customize action URL**.
   - Enter `https://your-domain.com/auth/action` (for local testing: `http://localhost:3000/auth/action`) and save.
   - The domain must be listed under **Authentication → Settings → Authorized domains**.

   This one URL is used by all of Firebase's email links. The page also handles email verification and email-change recovery links.

## Share previews (social media)

Links to Coplan show a branded 1200×630 preview on WhatsApp, X, LinkedIn, Facebook, Slack, Discord, iMessage and more. Each image is generated from code (`lib/og.tsx`) by an `opengraph-image.tsx` / `twitter-image.tsx` file next to the page: the homepage, login, sign-up, forgot password and invite links each have their own; private app pages use the homepage preview.

Set your live address so the preview links are absolute:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

(On Vercel it falls back to your production domain.) After deploying, test a link at [opengraph.xyz](https://www.opengraph.xyz), the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/). Those tools also refresh a cached preview if you change the images later.

## Connect EmailJS (invites)

1. Create an EmailJS account and add an **Email Service** (e.g. Gmail). Copy its **Service ID**.
2. **Email Templates → Create New Template**, then fill in:

   | Field | Value |
   | --- | --- |
   | Subject | `{{inviter_name}} invited you to {{target_name}} on Coplan` |
   | Content | Paste [`emails/emailjs-invite-template.html`](emails/emailjs-invite-template.html) using the code (`<>`) editor |
   | To Email | `{{to_email}}` |
   | From Name | `{{inviter_name}} via Coplan` |
   | Reply To | `{{reply_to}}` |

   Save it and copy the **Template ID**.
3. **Account → General**: copy your **Public Key**. Under **Security**, add your site's domain to the allowed origins.
4. Put the three values in `.env.local`:

   ```
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxx
   NEXT_PUBLIC_EMAILJS_INVITE_TEMPLATE_ID=template_xxx
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxx
   ```

Variables Coplan sends with every invite:

| Variable | Example |
| --- | --- |
| `{{to_email}}` | `sam@company.com` |
| `{{inviter_name}}` | `David Asaolu` |
| `{{reply_to}}` | inviter's email (empty when resending) |
| `{{target_name}}` | `Website relaunch` |
| `{{target_type}}` | `project` or `workspace` |
| `{{role}}` | `member` or `viewer` |
| `{{message}}` | the personal note, or a friendly default if blank |
| `{{invite_link}}` | `https://your-app.com/invite/<token>` |
| `{{app_url}}` | `https://your-app.com` |

Without EmailJS, invites still work: the invite dialog gives you a link to share yourself.

## How it fits together

| Path | What it is |
| --- | --- |
| `app/` | Routes. `(app)/` holds the signed-in pages behind `AppShell` (auth guard, sidebar, top bar). |
| `components/` | Page sections and UI, grouped by area: `home`, `auth`, `app`, `dashboard`, `board`, `task`, `members`, `invite`, `ui`. |
| `lib/firebase.ts` | Firebase initialisation (lazy, so pages render before keys are added). |
| `lib/firebase-actions.ts` | Every Firestore/Auth read and write: auth, workspaces, projects, tasks, comments, notifications, invites. |
| `firestore.rules` | Access control: roles per workspace/project, invite acceptance, notification privacy. |
| `styles/animations.css` | Reusable CSS/SVG animation classes (`cp-*`). |
| `images/` | SVG illustrations used across the app. |

### Data model

- `users/{uid}` — profile.
- `workspaces/{id}` — `memberIds`, `roles` (`owner` / `member` / `viewer`), `members` (name, email, photo).
- `projects/{id}` — same membership fields plus `workspaceId`, `columns`, `taskCount`, `doneCount`. A person's project role is their project role, falling back to their workspace role.
- `projects/{id}/tasks/{id}` and `…/tasks/{id}/comments/{id}`.
- `notifications/{id}` — one per recipient (mentions, assignments, comments, invites).
- `invites/{token}` — the document id is the secret in the emailed link.

### Roles

| | Owner | Member | Viewer |
| --- | :-: | :-: | :-: |
| Create/delete projects, invite people, change roles | ✓ | | |
| Create, edit, move and assign tasks; manage columns | ✓ | ✓ | |
| Comment and @mention | ✓ | ✓ | ✓ |
| View boards | ✓ | ✓ | ✓ |
