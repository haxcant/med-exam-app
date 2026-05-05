# v052 Admin security check + MOHW prompt text polish

## Summary

This patch addresses two items:

1. Checked whether a normal user can spoof admin privileges from `admin.html`.
2. Shortened the MOHW 200 formula question stem from:
   - `下列衛福部中醫藥司基準方劑資料，最符合何方？`
   to:
   - `下列資料最符合何方？`

## Security conclusion

The project must rely on Firestore Rules, not front-end JavaScript, for admin authority.
With the included `firestore.rules`, a normal signed-in user cannot approve access requests or write `allowlist/{uid}` from `admin.html`, because allowlist writes require `isAdmin()`.

`isAdmin()` requires an existing Firestore document:

```js
admins/{request.auth.uid}.enabled == true
```

A regular user can open `admin.html`, but the Firestore write will be denied if their UID is not already present in `admins`.

## Hardening changes

### 1. `admin.js`

Added a client-side admin status check:

- Reads `admins/{currentUser.uid}` after login.
- Displays `管理者狀態：已授權 / 未授權`.
- Disables request loading and approval operations when the logged-in user is not an admin.

This is only a UX guard. The real protection remains Firestore Rules.

### 2. `firestore.rules`

Hardened `admins/{uid}`:

```js
allow create, update, delete: if false;
```

Admin membership must be changed from Firebase Console or a trusted backend/Admin SDK, not from the web admin page.

This prevents accidental future UI/code paths from allowing one web client to create or mutate admin identities.

### 3. `admin.html`

Updated explanatory text to state that admin membership should be created from Firebase Console or a trusted backend, not from the front end.

### 4. `med_questions.js`

Replaced the 200 MOHW formula prompts with the shorter wording:

```txt
下列資料最符合何方？
```

### 5. `service-worker.js`

Updated cache name to:

```js
med-exam-app-v0.1.52-admin-text-fix
```

This reduces the chance of Safari or mobile browsers using mixed old/new JS assets.

## Verification

Commands run:

```bash
node --check admin.js
node --check app.js
node --check formula_genie_matcher.js
node --check formula_genie_data.js
node --check med_questions.js
node --check service-worker.js
python3 tests/question_bank_check.py
```

Result:

```txt
med_question_count = 813
errors = 0
ok
```

Phrase check:

```txt
med_questions.js old phrase count = 0
med_questions.js new phrase count = 200
```

## Deployment note

This security fix only becomes effective after deploying the updated `firestore.rules` to Firebase. Updating GitHub Pages alone is not enough to change Firestore authorization.
