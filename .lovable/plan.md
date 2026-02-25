

# Fix: Authenticated Users Without Profile Get Stuck

## Problem

When a user creates an account but doesn't finish onboarding:
1. They log in successfully via the "quick login" form
2. The code checks alunos, instrutores, autoescolas tables - finds nothing
3. It shows a toast "Selecione seu perfil" but the user stays on the same page seeing the login form again
4. The user is authenticated but stuck - the login form is still shown instead of profile selection

Additionally, if the user is already authenticated when arriving at `/auth` (e.g. redirected from Index.tsx), the page doesn't detect this and shows the login form unnecessarily.

## Solution

### 1. Auto-detect authenticated users on Auth page mount

When Auth.tsx loads, if the user is already authenticated:
- Check if they have a completed profile (aluno/instrutor/autoescola)
- If YES: redirect to the correct dashboard
- If NO: skip the login form and show the **profile type selection cards** so they can choose their type and proceed to onboarding

### 2. Fix quick login redirect when no profile exists

After successful quick login finds no profile in any table:
- Instead of just showing a toast, keep showing the profile selection cards below
- The user can then tap a profile type, which sets `userType` and triggers `checkProfileAndRedirect` to send them to onboarding

### Technical Details

**File: `src/pages/Auth.tsx`**

- Add a new `useEffect` that runs when `user` changes and `userType` is null (no type selected yet):
  - If user is authenticated, check alunos/instrutores/autoescolas
  - If profile found, redirect to dashboard
  - If no profile found, ensure the page shows profile selection (set mode to show selection cards, hide login form)

- Modify the `handleQuickLogin` success path (lines 355-364):
  - After finding no profile, scroll to or highlight the profile selection cards
  - The existing cards at lines 544-589 already handle `handleSelectType` which sets `userType` and triggers redirect to onboarding

- Add a state flag like `userAuthenticated` to track that the user is logged in but needs to pick a profile type, so the UI shows the selection cards prominently instead of the login form

**Expected flow after fix:**
1. User opens `/auth` while already logged in (or logs in via quick login)
2. System detects no profile exists
3. Login form is hidden, profile selection cards are shown prominently with message "Selecione seu perfil para completar o cadastro"
4. User taps "Sou Aluno" (or other type)
5. `checkProfileAndRedirect` fires, finds no aluno record, redirects to `/onboarding/aluno`

