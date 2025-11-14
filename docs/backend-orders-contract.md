# Backend Orders Contract (Frontend integration)

One-line summary

Backend is authoritative for order workflow, action metadata and authorization. Frontend will call server endpoints for allowed actions, render forms from server `requires` metadata, and submit changes (FormData when files are required). Permission strings use lowercase dot-form (namespace.action.resource).

---

## Canonical permission format

Use lowercase dot-form. Examples (frontend will compare exactly with these strings):

- `orders.processing.start`
- `orders.processing.complete`
- `orders.dispatch.assign`
- `orders.delivery.confirm`
- `orders.override.cancel`

The backend MUST return these exact lowercase permission strings in the action objects under the `permission` key.

---

## Endpoints (summary)

- GET /api/admin/orders
  - Query params: `status`, `page`, `limit`, `search`, `ownerRole`, `sort`, `date`, `includeAssigned` (opt), `assignedTo` (admins only)
  - Behavior: super-admins see all; non-super-admins are filtered to their `adminRole` by default and must include orders assigned to the caller automatically (see "includeAssigned default" section).
  - Response envelope supported: both top-level arrays and the `{ data: { orders: [...] } }` envelope. Frontend normalizes both.

- GET /api/admin/orders/:id/actions
  - Returns the server-filtered list of allowed actions for the caller. Frontend MUST call this before rendering action buttons/forms.

- PATCH /api/admin/orders/:id/actions/:action
  - Server-authoritative execution of an action. Validates authorization and payload, appends `statusHistory`, writes audit, returns canonical updated order.

- GET /orders?assignedTo=<userId>&status=...
  - For rider/assignee specific lists (or use `/api/admin/orders?assignedTo=` if admin-only).

---

## Action object schema (exact keys frontend expects)

Each action object in `GET /api/admin/orders/:id/actions` MUST contain:

- `action` (string) — machine id (e.g. `confirm-delivery`).
- `label` (string) — human label.
- `targetStatus` (string) — resulting status when action succeeds.
- `permission` (string) — canonical permission in lowercase dot-form (e.g., `orders.delivery.confirm`).
- `ownerRoles` (string[]) — roles that are allowed to perform the action even if they lack the explicit permission.
- `requires` (object) — keys (hand over fields) with boolean indicating required inputs. Example: `{ handoverCode: true, proof: false, riderId: true, note: true }`.
- `from` (string[]) — source statuses from which this action is valid.
- `guard` (boolean) — whether server-side guard/validation exists for transition.

Example action object:

```json
{
  "action": "confirm-delivery",
  "label": "Confirm Delivery",
  "targetStatus": "delivered",
  "permission": "orders.delivery.confirm",
  "ownerRoles": ["logistics","rider"],
  "requires": { "handoverCode": true, "proof": false },
  "from": ["en_route"],
  "guard": true
}
```

---

## Authorization semantics (exact rule the backend must enforce)

An action request (PATCH) is allowed if ANY of:

1. Caller has the exact permission string (e.g., `orders.dispatch.assign`).
2. Caller.adminRole is included in the action's `ownerRoles` array.
3. Caller is assigned/invited for the order (assigned user/rider) and assignment semantics allow this action.

Otherwise return 403.

Return 422 for payload validation errors, and 409 for concurrent state conflicts.

---

## FormData / attachments (exact field names)

When `requires.proof === true` or other file requirements are present, frontend will submit `multipart/form-data`.

Canonical form fields (frontend will use these exact names):

- Files:
  - `proof` — primary file field. Backend MUST accept multiple files submitted as multiple `proof` fields (e.g. `multer().array('proof')`). The backend may also accept `attachments[]` as an alias but `proof` is canonical.
- Scalars (FormData or JSON when no files):
  - `note` (string)
  - `handoverCode` (string)
  - `riderId` (string) — MongoDB _id for assign actions
  - `reason` (string)
  - `metadata` (string) — JSON string, backend will parse to object if present
- Optional header for idempotency (recommended):
  - `Idempotency-Key: <uuid>` — backend may use to dedupe repeated submissions/uploads.

Example: multipart request fields for delivery proof

- `handoverCode`: "123456"
- `note`: "Delivery completed"
- `proof`: <File> (append file multiple times for multiple files)
- Header: `Idempotency-Key: <uuid>` (optional)

---

## includeAssigned default behaviour (clarification)

Backend behaviour implemented:

- Super-admins: see all orders.
- Admin users with `adminRole`: server will default ownerRole to the caller's `adminRole` if ownerRole is not provided. The server will also automatically include orders where `assignedRider._id === caller._id` (or equivalent assigned field) when returning lists for that ownerRole.
- If caller provides explicit `ownerRole` query param, server returns orders for that ownerRole OR orders assigned to the caller.
- Non-admin callers with no `adminRole`: to include assigned orders they must pass `includeAssigned=true`.

Frontend guidance:

- Admin UIs: do NOT need to set `includeAssigned=true` for admins — assigned orders for the caller will be included automatically.
- To view orders assigned to a particular user/admin, use `assignedTo=<id>` (admins only).

---

## Event bus & real-time (note / options)

- The backend will publish internal events on `eventBus.ts` such as `order.status_changed` with payload:
  ```json
  { "orderId": "...", "previousStatus": "...", "newStatus": "...", "action": "...", "metadata": {...}, "note": "..." }
  ```
- This event bus is internal. If the frontend requires real-time push, implement a socket bridge (socket.io) that subscribes to the event bus and forwards events to connected clients.

Options:
- Implement socket bridge now (recommended) — add `src/services/socketBridge.ts`, wire `socket.io` in `app.ts`, protect sockets with admin auth. I can implement this quickly.
- Defer socket bridge — frontend will rely on polling/refetch for now.

---

## Response envelope / error shapes (exact shapes frontend expects)

- Success (list / actions / patch):
  ```json
  { "success": true, "data": { /* payload */ }, "message": "optional" }
  ```

- Error (authorization):
  ```json
  { "success": false, "message": "Not authorized" }
  ```

- Validation error:
  ```json
  { "success": false, "message": "Validation failed", "errors": { "field": "message" } }
  ```

- Conflict (concurrent state change):
  ```json
  { "success": false, "message": "State conflict", "errors": { "currentStatus": "processing" } }
  ```

---

## Samples

GET available actions response (example):

```json
{
  "success": true,
  "data": {
    "actions": [
      {
        "action": "confirm-delivery",
        "label": "Confirm Delivery",
        "targetStatus": "delivered",
        "permission": "orders.delivery.confirm",
        "ownerRoles": ["logistics","rider"],
        "requires": { "handoverCode": true, "proof": false },
        "from": ["en_route"],
        "guard": true
      }
    ]
  }
}
```

PATCH perform action (FormData when files involved):
- Endpoint: `PATCH /api/admin/orders/:id/actions/confirm-delivery`
- Headers: `Content-Type: multipart/form-data`, optional `Idempotency-Key: <uuid>`
- FormData fields: `handoverCode`, `note`, `proof`(file)

Response:
```json
{ "success": true, "data": { "order": { /* canonical order object */ } } }
```

---

## Acceptance criteria (quick)

- Frontend calls `GET /api/admin/orders/:id/actions` and receives action list with `permission` strings in lowercase dot-form.
- Frontend builds action forms from `requires` and submits `PATCH` actions with FormData when required.
- Backend enforces auth: returns 403/422/409 as appropriate and emits `order.status_changed` events.

---

## Next steps (recommended)

1. Confirm FormData field names & idempotency policy (we used `proof` and `Idempotency-Key` by default).
2. If real-time UI is needed, I can implement the `socketBridge` (socket.io) now and wire authentication.
3. Backend: add unit/integration tests for role/permission/assignment logic.

---

Prepared for frontend consumption by the engineering team. If you want, I will also commit a short example client snippet showing how to call `GET /api/admin/orders/:id/actions`, render a modal for a selected action, and submit `PATCH` with `FormData`.
