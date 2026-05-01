# Reflect cookies (popup ↔ background)

## 1. FLOW

1. **Service worker starts** (`background.js` loads).
   - Runs an initial **cookie snapshot** publish (same path as on change).
2. **Auth cookies change** on `http://localhost:4200/` (`acto_local`, `reto_local`).
   - Browser fires `chrome.cookies.onChanged` for the affected cookie.
3. **Background filters** events to only those two names.
   - Calls **publish**: read both cookies, write one object to **`chrome.storage.local`**.
4. **User opens the popup** (Angular `AppComponent`).
   - **Reads** storage once → binds `acto` / `reto` (or `❌` if empty).
   - **Subscribes** to `chrome.storage.onChanged` → updates UI when storage updates.
5. **User closes the popup**.
   - `onStorageChanged` listener is **removed** in `ngOnDestroy` (no leak; next open re-subscribes).

---

## 2. Implementation

### Why these Chrome APIs (not others)

- **`chrome.cookies` + `cookies` permission + `host_permissions` for localhost**  
  - **What:** Read http-only / site cookies from the extension, and get reliable **change** events.  
  - **Why:** The popup cannot see all cookie details the way the service worker can; the app must **react** to sign-in/out without polling the page.  
  - **How:** `onChanged` runs in the service worker; `cookies.get` uses a concrete **URL + name** (required by the API).

- **`chrome.storage.local` + `storage` permission**  
  - **What:** Small JSON snapshot `{ acto, reto }` under a shared string key.  
  - **Why:** **`chrome.runtime.sendMessage` needs a live listener.** The popup is often **closed**, so messaging produced *“Receiving end does not exist”*. Storage works **with zero UI open**.  
  - **How:** Background **only writes**; popup **reads** on init and **listens** for updates.

- **`NgZone.run` in the popup**  
  - **What:** Run storage callbacks inside Angular’s zone.  
  - **Why:** `chrome.storage` callbacks run **outside** Angular’s zone, so templates might not refresh.  
  - **How:** Wrap snapshot application in `ngZone.run(...)`.

### Steps (what → why → how)

1. **Startup snapshot (`void publishCookieSnapshot()` in `background.js`)**  
   - **What:** Push current `acto` / `reto` values into storage when the worker starts.  
   - **Why:** First open of the popup after install/reload should show **current** cookies, not only after the next change.  
   - **How:** Same `publishCookieSnapshot()` as on cookie events.

2. **`chrome.cookies.onChanged` listener**  
   - **What:** React whenever any cookie changes; filter to `acto_local` / `reto_local`.  
   - **Why:** Single source of truth for “session changed” without touching the web app’s code.  
   - **How:** If name matches → `void publishCookieSnapshot()` (non-blocking).

3. **`publishCookieSnapshot()` — `chrome.cookies.get` × 2**  
   - **What:** Fetch both cookies with `{ url: COOKIE_LOOKUP_URL, name }`.  
   - **Why:** One event might only describe **one** cookie; the UI shows **both** strings, so re-read both for a consistent snapshot.  
   - **How:** `Promise.all` → build `{ acto, reto }` strings (`?? ""`).

4. **`chrome.storage.local.set`**  
   - **What:** Write `{ [STORAGE_KEY]: { acto, reto } }`.  
   - **Why:** Durable handoff to any extension UI; no receiver required.  
   - **How:** Key string must **match** the popup’s `storageKey`.

5. **Popup init — `chrome.storage.local.get`**  
   - **What:** Load the snapshot when the component loads.  
   - **Why:** Show correct values **immediately** if storage was already updated in the background.  
   - **How:** `.then` → `applySnapshot` inside `ngZone.run`.

6. **`chrome.storage.onChanged.addListener`**  
   - **What:** Observe updates to the same key in the `local` area.  
   - **Why:** Live updates while the popup stays open (e.g. user logs in/out in another tab).  
   - **How:** Ignore other keys / areas; read `change.newValue`; `applySnapshot` in `ngZone.run`.

7. **`applySnapshot` mapping to `❌`**  
   - **What:** If a value’s length is 0, show `❌`; else show the cookie value string.  
   - **Why:** Quick visual for “missing / empty” token.  
   - **How:** Simple length check on `acto` / `reto` fields.

8. **`ngOnDestroy` — `removeListener`**  
   - **What:** Detach `onStorageChanged` when the popup component is destroyed.  
   - **Why:** Avoid duplicate handlers if the component is recreated; keep behavior predictable.  
   - **How:** Same function reference used for `addListener` / `removeListener`.

### Contract to keep in sync

1. **`COOKIE_ACTO` / `COOKIE_RETO` in `background.js`** — align with `acto_${environment.env}` / `reto_${environment.env}` in Angular `environment*.ts`.  
2. **`COOKIE_LOOKUP_URL`** — align with `environment.app_url` (origin where cookies are set).  
3. **`STORAGE_KEY` / `storageKey`** — identical string in `background.js` and `app.component.ts`.
