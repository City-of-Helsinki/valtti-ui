# Valtti

<img src="https://play-lh.googleusercontent.com/PS6HgNEEM6FTCDhWCsNrnTBhtTzjbsziIh9PACvET8vKkDK2Ch1DeBc6GksFwTCDGUPb=w480-h960-rw" width="65" align="left" alt="Valtti Logo" />

Valtti is a secure instant messaging application for child protection and family social work. It allows professionals and customers to communicate securely with each other.

Valtti on tietoturvallinen pikaviestisovellus lastensuojelun ja perhesosiaalityön käyttöön. Sen avulla ammattilaiset ja asiakkaat voivat viestiä keskenään tietoturvallisesti.

## Table of Contents

- [Getting Started](#getting-started)
- [Development](#development)
- [Building](#building)
- [APK preview for Android](#apk-preview-for-android)
- [Notes](#notes)
- [Screenshots](#screenshots)

## Getting Started

To get started, install the dependencies:

```terminal
yarn install # or npm install
```

### Development

To start developing, start the Metro bundler by running the following command in the project root:

```terminal
yarn start # or npm start
```

### Building

#### APK preview for Android

Run the following command in the project root:

```terminal
eas build --profile preview --platform andoird
```

Wait a few seconds and the link should appear in the terminal [(See more documentation on Expo.dev)](https://docs.expo.dev/build-reference/apk/)

## Notes

WARNING: For Mac OSX, npm 8.19.2, node v19.0.1, `npm install` fails, but `yarn install` works

## Screenshots

Google Play & App Store screenshots can be found in the [here](/assets/screenshots).
