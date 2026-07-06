# Collaborative Document Editor

## Tech Stack

- Next.js 16
- TypeScript
- Zustand (State Management)
- IndexedDB (idb-keyval) for local document storage
- MongoDB
- Mongoose
- NextAuth (Credentials Authentication)
- Auth.js MongoDB Adapter
- bcrypt.js for password hashing
- Tailwind CSS
- Lodash Debounce

---

# Features

## Instant Loading

When a document is opened, it is loaded from the browser's local IndexedDB first. This makes the document open instantly without waiting for a network request, allowing users to start typing immediately.

---

## Offline Support with Background Sync

Users can continue editing even when there is no internet connection.

- All changes are stored in a local queue.
- Changes are automatically synced to the server when the connection is restored.
- A debounced sync engine is used to reduce unnecessary API requests.

---

## Automatic Collaboration

The editor checks the server every second for updates made by other users.

If there are no pending local changes, remote updates are automatically merged into the document, allowing multiple users to collaborate without manually refreshing the page.

---

## Role-Based Access Control

There are three user roles:

- **Owner** – Full access. Can edit the document and share it with other users.
- **Editor** – Can edit the document.
- **Viewer** – Can only view the document.

The owner can invite other users and assign either Editor or Viewer permissions.

---

## Version History

The editor supports manual document snapshots.

- Users can save the current state of the document at any time.
- Every saved snapshot is stored permanently.
- A history sidebar displays all saved snapshots.
- Users can open previous versions whenever needed.

---

# Scope for Improvement

## Better Conflict Resolution

Currently, the sync engine follows a **Last Write Wins** strategy. While simple, it may overwrite changes when multiple users edit the same content at the same time.

A better conflict resolution or Operational Transformation (OT) / CRDT-based approach could improve collaborative editing.

---

## Replace Polling with WebSockets

The client currently checks the server every second by calling the `/api/documents/[id]` API to detect remote changes.

This works well for the current deployment, but using WebSockets would provide real-time updates with lower network overhead. Since Vercel does not provide a persistent WebSocket connection, polling was chosen for this project.

---

## Rich Text Editor Improvements

The current editor can be improved by preserving the user's cursor position during remote updates, making collaborative editing feel more natural and seamless.