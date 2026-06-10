# electron-skd

Vue 3 + Vite + Vue Router + Pinia + Electron + Node backend + IPC request scaffold.

## Scripts

- `npm.cmd install` installs dependencies.
- `npm.cmd run dev` starts Vite and Electron together.
- `npm.cmd run lint` checks Electron and Node backend syntax.

## Structure

- `electron/main.cjs` creates the always-on-top transparent overlay window and registers IPC.
- `electron/preload.cjs` exposes safe APIs to Vue.
- `server/backend.cjs` is the Node backend service used by IPC.
- `src/router` defines small-screen and full-screen routes.
- `src/components/FloatingBall.vue` implements the draggable floating ball menu.
