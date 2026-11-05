# Apply Tracker: setup guide

Delete this file before pushing to GitHub.

## 1. Create the project (about 10 minutes)

In a terminal, in the folder where you keep projects:

```bash
npx create-expo-app@latest apply-tracker --template blank-typescript
cd apply-tracker
```

Copy everything from the zip into this `apply-tracker` folder. Say yes to replacing `App.tsx`.

Then install the packages. `npx expo install` picks versions that match your Expo SDK:

```bash
npx expo install @react-native-async-storage/async-storage react-native-safe-area-context
npx expo install jest-expo jest @types/jest -- --save-dev
node scripts/setup-tests.js
```

The last command installs React Native Testing Library and adds `npm test` and the Jest config to `package.json`.

## 2. Run the tests

```bash
npm test
npm run typecheck
```

You should see **4 test suites and 38 tests** passing. If anything fails, paste the full error back to Claude.

## 3. Run the app on your phone

```bash
npx expo start
```

Install **Expo Go** from the Play Store, scan the QR code, and try it: add an application, change its status, search, filter, set a follow-up date in the past and check it is highlighted, close and reopen the app to check data is saved.

Take 2–3 screenshots (list with a "Follow-up due" card, the form, a filtered list) and add them to the README under the first paragraph.

## 4. Push to GitHub

Create an empty public repo named `apply-tracker` on GitHub (no README), then:

```bash
git add -A
git commit -m "Apply Tracker: Expo app with tests and CI"
git branch -M main
git remote add origin https://github.com/Farhan-ShaikhM/apply-tracker.git
git push -u origin main
```

Check the **Actions** tab turns green. Pin the repo on your profile.

## 5. Before any interview: understand every file

Read in this order and be able to explain each one:

1. `src/types.ts`
2. `src/logic/applications.ts`: the reducer, `validateDraft`, `filterApplications`, `isFollowUpDue`
3. `src/storage/applicationsStorage.ts`: why invalid data is filtered
4. `src/context/ApplicationsContext.tsx`: why saving waits for `loaded`
5. `src/screens/HomeScreen.tsx`: `useMemo`, `useCallback`, `React.memo` on the card
6. `__tests__/HomeScreen.test.tsx`: how tests use labels and roles

Questions you should be able to answer:

- **Why useReducer + Context instead of Redux?** Small state, four actions; Redux would add setup without benefit.
- **Why does saving wait for `loaded`?** Otherwise the first render would save an empty list and wipe the user's data.
- **Why `getByLabelText` in tests?** It tests the app the way users (including screen-reader users) find things, and the tests don't break when styling changes.
- **How do you test AsyncStorage?** It's mocked with the official in-memory mock in `jest.setup.ts`.
- **Why is `today` a prop?** So follow-up tests don't depend on the real date.
- **What would you add next?** Push notifications for follow-ups (expo-notifications), a date picker, export to CSV, and a published build via EAS.
