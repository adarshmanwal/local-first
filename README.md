# Local-First Editor


## Key Features & How They Work

- **Local-First Architecture (IndexedDB)**: 
  Saves your work directly to your browser's IndexedDB using `idb-keyval`. This ensures instant load times, immediate feedback, and full offline capability without waiting for network requests.

- **Cloud Sync & Conflict Resolution**:
  Modifications are kept in a local `sync_queue`. The app utilizes a debounced background sync (`lodash.debounce`) to periodically push changes to the `/api/sync` endpoint. Server state is fetched in the background, updating your local view to ensure smooth multi-device usage.

- **Version Control (History)**:
  Document snapshots can be generated and securely stored in the MongoDB database via the `/api/versions` route. This allows you to view historical versions and restore the editor to any past state.

- **User Authentication (NextAuth)**:
  Secure session management and user authentication are powered by NextAuth, ensuring document scopes and API endpoints remain protected.

- **Serverless Database (MongoDB & Mongoose)**:
  Leverages a globally cached MongoDB connection via Mongoose, optimized specifically for Next.js serverless environments (handling connection pooling, timeouts, and idle socket cleanup).