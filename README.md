# PubTrail 🍺🗺️

**PubTrail** is a mobile application for creating, joining, and tracking pub crawls with real-time location features. It is built with React Native and Expo. PubTrail lets users create routes between pubs, invite friends, add photos, document each stop with location information and notes, and discover nearby crawls.

## UX Prize 🏆 winning project 

This application was implemented as a project for the course ID2216 Developing Mobile Applications at KTH, winning the UX Prize, which is awarded to projects that stand out for their attention to the use case, usability, and thoughtful design, possibly creating a need that was previously unknown.

### Team Members
- Filip Todosov
- Bogdan Stefanescu
- Pavlos Spanoudakis

As an award-winning project, we also prepared a [short presentation](./docs/PubTrail_Project_Presentation.pdf) of our project to share our work and inspire our classmates.

## Tech Stack

- **React Native** + **Expo** - cross-platform UI (Android, iOS, Web)
- **TypeScript** - strict type safety across the entire codebase
- **Redux Toolkit** - centralized state management
- **Mapbox** (`@rnmapbox/maps`) - interactive maps with user location tracking
- **Firebase** - authentication (Google OAuth) and backend services
- **Expo Router** - file-based navigation with auth-gated routing

## App Features

### Globally used features

- **User Authentication** - email/password and Google OAuth via Firebase with automatic session handling and logout
- **Auth Navigation** - unauthenticated users are redirected to the login screen; authenticated users land on the home screen
- **Real-Time Location** - GPS permission handling and continuous user location tracking (10-second intervals)
- **Interactive Map** - Mapbox integration with user location puck/marker, point markers, and route lines connecting stops (reused across different screens)
- **Navigation** - Intuitive navigation using drawer menu & quick action buttons 
- **Reusable UI Components**
- **Design System** - color palette, spacing scale, typography tokens, and shared styles
- **Persistence** - connect all crawl, stop, and participant data to a Firestore database

### Business logic features

- **Add/Edit a crawl** - create/edit your own pub crawl
- **Add/Edit a crawl stop** - create/edit stops in your pub crawl
- **Pick stop location using suggestions** - suggest food & drink places near the user's location when the user tries to add a new stop, to avoid typing the pub information manually
- **Share Crawl** - generate and share QR codes or invitation links for your crawl
- **Join Crawl via QR Code or link** - scan a QR code or invitation link to join an existing crawl in real time
- **Media Upload** - upload images taken using the camera to attach to a pub crawl
- **Real Nearby Crawl Queries** - see live crawls that are currently nearby you, based on their latest stop
- **Sobriety checker game** - A game that uses device's gyroscope to determine how drunk/sober you are

## Project File Structure

```
├── app.config.ts                    # Expo app configuration (name, icons, plugins, permissions)
├── babel.confg.cjs                  # Babel config with expo preset and module-resolver aliases
├── eas.json                         # EAS Build profiles (development, preview, production)
├── firebase.json                    # Firebase Hosting + Firestore config
├── metro.config.js                  # Metro bundler config (enables CSS support for web)
├── package.json                     # Dependencies, scripts, and project metadata
├── pubtrail-firebase-android.json   # Firebase Android config (used by app.config.ts)
├── pubtrail-firebase-ios.plist      # Firebase iOS config (used by app.config.ts)
├── tsconfig.json                    # TypeScript config
│
├── assets/
│   └── images/                      # App icons and image assets
│
└── src/
   ├── app/                         # Expo Router file-based routes
   │   ├── _layout.tsx              # Root layout: Redux Provider, SafeArea, AuthGate (redirects)
   │   ├── (auth)/
   │   │   ├── _layout.tsx          # Auth stack layout
   │   │   └── login.tsx            # Login screen
   │   ├── (public)/
   │   │   ├── _layout.tsx          # Drawer layout for the map home
   │   │   └── index.tsx            # Map home + quick actions
   │   └── (app)/
   │       ├── _layout.tsx          # App stack header config
   │       ├── activeCrawl/
   │       │   ├── index.tsx            # Active crawl overview
   │       │   ├── captureMedia.tsx     # Capture photo
   │       │   ├── newStop.tsx          # Add a stop
   │       │   └── stops/[stopUid].tsx  # Edit stop
   │       ├── album/[crawlUid].tsx     # Crawl media album
   │       ├── crawlHistory.tsx         # Past crawls
   │       ├── join/[code].tsx          # External join link
   │       ├── joinCrawl.tsx            # Join via QR / link
   │       ├── nearbyCrawls.tsx         # Nearby public crawls
   │       ├── newCrawl.tsx             # Create a crawl
   │       ├── placeholder.tsx          # Placeholder screen
   │       ├── shareCrawl.tsx           # Share link / QR
   │       ├── soberCheck.tsx           # Sobriety mini-game
   │       └── viewCrawl/
   │           └── [crawlUid]/
   │               ├── index.tsx        # Crawl details
   │               └── stops/[stopUid].tsx # View stop details
   │
   ├── firebaseConfig.ts            # Firebase client and auth initialization
   ├── firebaseEnv.ts               # Firebase env var validation
   ├── mapboxConfig.ts              # Mapbox setup + nearby search helpers
   ├── weatherService.ts            # Weather API helpers + crawl tips
   │
   ├── presenters/                  # Business logic layer (connects state to views)
   │   ├── appLayoutPresenter.tsx
   │   ├── captureMediaPresenter.tsx
   │   ├── crawlDetailsPresenter.tsx
   │   ├── crawlHistoryPresenter.tsx
   │   ├── editCrawlPresenter.tsx
   │   ├── editStopPresenter.tsx
   │   ├── externalJoinPresenter.tsx
   │   ├── joinCrawlPresenter.tsx
   │   ├── loginPresenter.tsx
   │   ├── mapHomePresenter.tsx
   │   ├── mapPresenter.tsx
   │   ├── mediaAlbumPresenter.tsx
   │   ├── nearbyCrawlsPresenter.tsx
   │   ├── newStopPresenter.tsx
   │   ├── placeholderPresenter.tsx
   │   ├── shareCrawlPresenter.tsx
   │   ├── soberCheckPresenter.tsx
   │   └── viewCrawlStopPresenter.tsx
   │
   ├── views/                       # Pure UI components (receive data via props)
   │   ├── ExternalJoinView.tsx
   │   ├── captureMediaView.tsx
   │   ├── crawlDetailsView.tsx
   │   ├── crawlHistoryView.tsx
   │   ├── editCrawlView.tsx
   │   ├── editStopView.tsx
   │   ├── joinCrawlView.tsx
   │   ├── loginView.tsx
   │   ├── mapView.tsx
   │   ├── mediaAlbumView.tsx
   │   ├── nearbyCrawlsView.tsx
   │   ├── newStopView.tsx
   │   ├── placeholderView.tsx
   │   ├── shareCrawlView.tsx
   │   ├── soberCheckView.tsx
   │   ├── viewCrawlStopView.tsx
   │   ├── components/              # Map + UI building blocks
   │   ├── navigation/              # Drawer + overlay UI
   │   └── shared/                  # View helpers
   │
   ├── redux/                       # Redux state management
   │   ├── actions/                 # Thunks and action creators
   │   │   ├── activeCrawlActions.ts
   │   │   ├── authActions.ts
   │   │   ├── mapActions.ts
   │   │   ├── nearbyCrawlsActions.ts
   │   │   ├── newCrawlDraftActions.ts
   │   │   ├── stopEditorActions.ts
   │   │   └── weatherActions.ts
   │   ├── reducers/                # Slice reducers and root reducer
   │   │   ├── activeCrawlReducer.ts
   │   │   ├── authReducer.ts
   │   │   ├── mapReducer.ts
   │   │   ├── nearbyCrawlsReducer.ts
   │   │   ├── newCrawlDraftReducer.ts
   │   │   ├── stopEditorReducer.ts
   │   │   ├── weatherReducer.ts
   │   │   └── index.ts
   │   ├── selectors/               # Derived state selectors
   │   │   ├── activeCrawlSelectors.ts
   │   │   ├── authSelectors.ts
   │   │   ├── nearbyCrawlsSelectors.ts
   │   │   ├── newCrawlDraftSelectors.ts
   │   │   └── stopEditorSelectors.ts
   │   ├── gateways/                # Firestore and data access
   │   │   ├── activeCrawlGateway.ts
   │   │   ├── firestoreGatewayUtils.ts
   │   │   └── userGateway.ts
   │   ├── mappers/                 # Firestore data mappers
   │   │   └── activeCrawlMappers.ts
   │   └── store/                   # Store config and typed hooks
   │       ├── store.ts
   │       └── hooks.ts
   │
   ├── services/                    # External service helpers (Cloudinary)
   ├── hooks/                       # App-specific hooks
   ├── styles/                      # Design system
   ├── types/                       # Shared types
   └── utils/                       # Shared utilities
```

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables** - create a `.env` file:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=<your-firebase-project-id>
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-messaging-sender-id>
   EXPO_PUBLIC_FIREBASE_APP_ID=<your-firebase-app-id>
   EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=<your-google-oauth-client-id>
   EXPO_PUBLIC_MAPBOX_TOKEN=<your-mapbox-access-token>
   EXPO_PUBLIC_OPENWEATHER_API_KEY=<your-openweather-api-key>
   ```

3. **Configure native Firebase** (for Android/iOS builds)
   - Download `pubtrail-firebase-android.json` from Firebase Console → place at the project root
   - Download `pubtrail-firebase-ios.plist` from Firebase Console → place at the project root
   - Ensure your package name (`com.anonymous.pubtrail`) matches your Firebase project settings

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Run on Android device/emulator**
   ```bash
   npm run android:dev
   ```


6. **Build an Android APK locally**
   ```bash
   npm run android:build_apk
   ```

7. **Publish web update**
   ```bash
   npm run web:publish
   ```

## 3rd-Party UI Components

We have used these user visible components from external libraries in our project:

| Library | Which component | Where |
|---------|-----------|---------|
| `@rnmapbox/maps` | `MapView`, `Camera`, `MarkerView`, route `ShapeSource`/`LineLayer` | `src/views/components/FullScreenMap.native.tsx`, `src/views/components/FullScreenMap.web.tsx`, `src/views/components/mapOverlay.native.tsx`, `src/views/components/mapOverlay.web.tsx`, `src/views/components/MapUserLocationMarker.tsx` |
| `@react-native-community/datetimepicker` | `DateTimePicker` | `src/views/editStopView.tsx` |
| `react-native-qrcode-svg` | `QRCode` | `src/views/shareCrawlView.tsx` |
| `expo-camera` | `CameraView` | `src/views/captureMediaView.tsx`, `src/views/joinCrawlView.tsx` |
| `expo-sensors` | `Gyroscope` | `src/presenters/soberCheckPresenter.tsx` |
| `@react-navigation/drawer` | `DrawerContentScrollView` | `src/views/navigation/AppDrawerContent.tsx` |
| `react-native-safe-area-context` | `useSafeAreaInsets` | `src/views/navigation/IndexQuickActionsOverlay.tsx`, `src/views/navigation/AppDrawerContent.tsx` |
