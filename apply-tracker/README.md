# Apply Tracker

![CI](https://github.com/Farhan-ShaikhM/apply-tracker/actions/workflows/ci.yml/badge.svg)

A React Native (Expo) app for tracking job applications. Add each application, move it through Applied, Interview, Offer or Rejected, search and filter your list, and get reminded when a follow-up is due. Data is saved on the device, so it works offline.

Built with TypeScript, tested with Jest and React Native Testing Library, and checked by GitHub Actions on every push.

## Features

- **Track applications:** company, role, status, applied date, follow-up date, job link and notes
- **Follow-up reminders:** applications whose follow-up date has arrived are highlighted and shown first
- **Search and filter:** search by company or role, filter by status with live counts
- **Stats:** total applications, interviews, offers and response rate
- **Offline storage:** saved with AsyncStorage; corrupted or invalid data is ignored instead of crashing the app
- **Form validation:** required fields, real calendar dates, follow-up not before the applied date, valid links
- **Safe delete:** two taps needed to delete an application
- **Accessible:** labels, roles and states on every interactive element, which the tests also use

## Tech Stack

| Area | Technology |
|---|---|
| App | React Native, Expo, TypeScript |
| State | React Context + `useReducer`, memoised derived data |
| Storage | `@react-native-async-storage/async-storage` |
| Testing | Jest (`jest-expo`), React Native Testing Library |
| CI | GitHub Actions: type check and tests on every push |

## Project Structure

```
App.tsx                      Providers + home screen
src/
  types.ts                   Application, Status and Stats types
  logic/applications.ts      Pure functions: reducer, validation, filtering, stats, follow-ups
  storage/                   AsyncStorage load/save with data validation
  context/                   ApplicationsProvider: state, loading and auto-save
  components/                Card, form, stats bar, status filter, badges, empty state
  screens/HomeScreen.tsx     List, search, filters and the add/edit modal
__tests__/                   Unit, storage, component and screen tests
```

Business logic lives in plain functions in `src/logic`, separate from the UI, so it can be unit tested without rendering anything.

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app (Android or iOS), or press `a` for an Android emulator.

## Running Tests

```bash
npm test            # all tests
npm run typecheck   # TypeScript check
```

The tests cover:

- **Logic:** date validation (including leap years), form validation, reducer actions, search, status filter, sorting, stats and follow-up rules
- **Storage:** saving and loading, corrupted JSON, invalid entries
- **Form component:** validation messages, submitting the right values, status selection, edit mode, two-step delete
- **Home screen:** empty state, adding an application, loading saved data, search and filter, editing status, follow-up highlighting, deleting

## Design Decisions

- **Reducer + Context instead of a state library:** the state is a single list with four actions, so Redux would add setup without benefit.
- **Auto-save only after loading:** the app never saves before saved data has loaded, so it can't overwrite existing applications with an empty list.
- **Accessible queries in tests:** tests find elements by label and role, the way a screen-reader user would, rather than by implementation details.
- **"Today" is injectable:** follow-up rules depend on the date, so tests pass a fixed date to stay predictable.

## Author

Farhan Shaikh – [GitHub](https://github.com/Farhan-ShaikhM) · [LinkedIn](https://www.linkedin.com/in/farhan-shaikhm)
