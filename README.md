# SkyPoint Social - Frontend

This is the frontend for SkyPoint Social, a web application designed for users to connect, share posts, and engage with a community.

## Tech Stack

*   **React 19**
*   **TypeScript**
*   **Redux Toolkit** (for state management)
*   **RTK Query** (for data fetching and caching)
*   **React Router DOM v7** (for client-side routing)
*   **Material UI (MUI) v7** (for UI components)
*   **@react-oauth/google** (for Google OAuth integration)
*   **Axios** (though primarily using RTK Query for API calls)
*   **date-fns** (for date utilities)
*   **Create React App** (for project setup and scripts)

## Project Setup

### Prerequisites

*   Node.js (v16.x or higher recommended)
*   npm or yarn

### Installation

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone https://github.com/imadwivedi/skypoint-social-frontend
    cd skypoint-social-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

### Environment Variables

This project requires certain environment variables to be set up for proper functioning, especially for API communication and Google OAuth.

1.  Create a `.env` file in the root of the project (`skypoint-social-frontend/.env`).
2.  Add the following environment variables:

    ```env
    # The base URL for your backend API
    REACT_APP_API_BASE_URL=http://localhost:5159/api

    # Your Google OAuth Client ID (obtained from Google Cloud Console)
    REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
    ```

    *   Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with the actual Client ID you obtained from the Google Cloud Console for your web application.
    *   Adjust `REACT_APP_API_BASE_URL` if your backend API is running on a different port or domain.

### Google OAuth Configuration (Client-Side)

*   Ensure your Google Cloud Project has an OAuth 2.0 Client ID configured for "Web application".
*   The "Authorized JavaScript origins" in your Google Cloud Console credentials must include the URL where your frontend is served (e.g., `http://localhost:3000` for development).
*   If your OAuth consent screen is in "Testing" mode, add your Google accounts to the "Test users" list in the Google Cloud Console.

## Available Scripts

In the project directory, you can run:

### `npm start` or `yarn start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
The page will reload when you make changes. You may also see any lint errors in the console.

### `npm test` or `yarn test`

Launches the test runner in interactive watch mode.

### `npm run build` or `yarn build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.
The build is minified and the filenames include hashes.

### `npm run eject` or `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**
If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

## Key Features

*   **User Authentication:**
    *   Standard email/password registration and login.
    *   Google OAuth 2.0 for seamless sign-in/sign-up.
*   **User Profiles:** View user profiles, including their posts.
*   **Post Management:**
    *   Create, view, upvote, and downvote posts.
    *   View comments on posts.
    *   Create comments and replies.
*   **Social Interaction:**
    *   Follow/Unfollow other users.
*   **Feed:** A central feed displaying posts from followed users or a general feed.
*   **Responsive Design:** UI built with Material UI for adaptability across devices.
*   **Protected Routes:** Certain routes are accessible only to authenticated users.
*   **State Management:** Centralized state management using Redux Toolkit.
*   **API Integration:** Efficient data fetching and caching with RTK Query.

## Folder Structure

The `src` folder is organized as follows:

```
src/
├── App.css               # Main app styles
├── App.test.tsx          # App component tests
├── App.tsx               # Main application component (routing, providers)
├── index.css             # Global CSS styles
├── index.tsx             # Entry point of the React application
├── logo.svg
├── react-app-env.d.ts
├── reportWebVitals.ts
├── setupTests.ts
├── components/           # Reusable UI components
│   ├── auth/             # Authentication related components (LoginForm, RegisterForm, etc.)
│   ├── common/           # Common components like ProtectedRoute
│   ├── layout/           # Layout components (Header, Main Layout)
│   └── post/             # Post and comment related components (PostCard, CommentList, etc.)
├── hooks/                # Custom React hooks (e.g., useAuth)
├── pages/                # Top-level page components (Home, Profile, Login, Register)
├── services/             # API service definitions (RTK Query)
├── store/                # Redux store setup and slices (authSlice)
├── types/                # TypeScript type definitions
└── utils/                # Utility functions (helpers)
```