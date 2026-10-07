---
name: realtime-collaboration-websockets-and-crdts
description: >-
  Use this skill to design real-time multiplayer collaboration systems, WebSockets, and Conflict-Free Replicated Data Types (CRDTs).
  It guides full-duplex WebSockets, Server-Sent Events (SSE) for AI token streaming, Yjs/Automerge CRDTs for collaborative editing,
  live cursor presence awareness, and resilient reconnection state machines.
---

# Real-Time Collaboration, WebSockets & CRDTs Skill

## Overview
This skill guides the AI agent in operating as a Super Expert Real-Time Systems Engineer. It tackles multiplayer collaborative applications (Figma, Notion, Miro, Google Docs) where multiple users edit documents simultaneously across unstable network connections. By implementing **Conflict-Free Replicated Data Types (CRDTs via Yjs)**, full-duplex WebSockets with presence awareness, and Server-Sent Events (SSE) for streaming data, systems achieve mathematically proven eventual consistency.

---

## When to Use This Skill
- Building multiplayer collaborative document editors, live canvases, or shared whiteboards.
- Streaming real-time LLM token generation to web frontends via Server-Sent Events (SSE).
- Synchronizing live cursor positions, user selection highlights, and presence awareness.
- Handling unstable mobile WebSocket connections with automatic reconnection and state catch-up.

---

## Input Context Required
1. Collaboration topology: Centralized server-assisted (WebSocket relay) vs. Peer-to-Peer (WebRTC).
2. Data structure: Rich text (Y.Text), hierarchical JSON trees (Y.Map, Y.Array), or spatial coordinates.
3. Network transport: WebSocket (bidirectional) vs. SSE (unidirectional server-to-client).

---

## Step-by-Step Execution Workflow

### Step 1: Transport Selection: WebSockets vs. Server-Sent Events (SSE)
Match the protocol to the data flow requirement:
- **Server-Sent Events (SSE / `text/event-stream`)**:
  - Unidirectional: Server streams updates to client over standard HTTP/2.
  - *Best for*: Real-time LLM token streaming, notification feeds, stock tickers.
  - *Advantage*: Native browser auto-reconnect, passes through corporate proxies effortlessly.
- **WebSockets (`ws://`, `wss://`)**:
  - Full-duplex: High-frequency bidirectional message passing.
  - *Best for*: Live chat, multiplayer cursor tracking, real-time gaming, collaborative drawing.

### Step 2: Conflict-Free Replicated Data Types (CRDTs - Yjs)
Avoid complex server-side locks or Operational Transformation (OT) servers. Use CRDTs:
- **Mathematical Convergence**: All clients can mutate their local copy offline or concurrently. When updates are exchanged, all clients are **mathematically guaranteed to converge to the exact same state** without data loss.
- **Yjs Shared Types**:
  - `yDoc.getText('content')`: Collaborative text document.
  - `yDoc.getMap('canvas')`: Collaborative key-value dictionary.
  - `yDoc.getArray('elements')`: Ordered list of shapes or items.

```mermaid
flowchart LR
    ClientA[Client A (Edits locally)] -->|Yjs Binary Delta Update| Server[WebSocket Relay / Provider]
    ClientB[Client B (Edits locally)] -->|Yjs Binary Delta Update| Server
    Server -->|Broadcast Update| ClientA
    Server -->|Broadcast Update| ClientB
    note["CRDTs guarantee identical document convergence without server merge conflicts!"]
```

### Step 3: Presence Awareness & Live Cursor Tracking
Stream ephemeral user state (cursors, avatar selections) without polluting the persistent document:
- Use the **Yjs Awareness Protocol**:
  - Broadcasts client metadata: `{ user: { name: 'Alice', color: '#3b82f6' }, cursor: { x: 420, y: 180 } }`.
  - Throttle cursor broadcasts to 30-60 FPS using `requestAnimationFrame` to avoid flooding network bandwidth.
  - Automatically garbage-collects inactive users if heartbeat is missing for $> 30$ seconds.

### Step 4: Resilient WebSocket Reconnection State Machine
Never allow a transient Wi-Fi drop to crash the collaboration session:
1. **Heartbeat (Ping-Pong)**: Client sends `ping` every 25 seconds; server replies `pong`. If no `pong` after 10s, terminate and reconnect.
2. **Exponential Backoff with Full Jitter**:
   $$\text{Delay} = \text{random}(0, \min(10000, 500 \times 2^{\text{attempt}}))\text{ ms}$$
3. **State Sync on Reconnect**: On reconnection, exchange state vectors (`Y.encodeStateVector`) and transmit *only* the delta difference missed during disconnection.

---

## Output Deliverables Template

Generate Collaborative Document & Presence Provider (TypeScript / React):

```typescript
// Collaborative Real-Time Yjs WebSocket & Awareness Provider
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export class CollaborativeSession {
  public doc: Y.Doc;
  public provider: WebsocketProvider;
  public text: Y.Text;

  constructor(roomName: string, serverUrl: string, currentUser: { id: string; name: string; color: string }) {
    this.doc = new Y.Doc();
    this.text = this.doc.getText('document_content');

    // 1. Establish resilient WebSocket connection
    this.provider = new WebsocketProvider(serverUrl, roomName, this.doc, {
      connect: true,
      maxBackoffTime: 10000,
    });

    // 2. Configure Presence Awareness (Cursors & Avatars)
    const awareness = this.provider.awareness;
    awareness.setLocalStateField('user', currentUser);

    // 3. Track remote user cursors
    awareness.on('change', () => {
      const states = Array.from(awareness.getStates().entries());
      const remoteUsers = states
        .filter(([clientId]) => clientId !== this.doc.clientID)
        .map(([clientId, state]) => ({
          clientId,
          user: state.user,
          cursor: state.cursor,
        }));
      this.onPresenceUpdate(remoteUsers);
    });
  }

  public updateCursor(x: number, y: number) {
    this.provider.awareness.setLocalStateField('cursor', { x, y, timestamp: Date.now() });
  }

  public onPresenceUpdate: (users: unknown[]) => void = () => {};

  public destroy() {
    this.provider.destroy();
    this.doc.destroy();
  }
}
```

---

## Quality Checklist & Guardrails
- [ ] Is collaborative document state managed via CRDTs (Yjs/Automerge) for conflict-free convergence?
- [ ] Is presence/cursor tracking separated from persistent document updates?
- [ ] Are cursor position broadcasts throttled via `requestAnimationFrame`?
- [ ] Does the WebSocket connection implement automated ping-pong heartbeats and exponential backoff?
- [ ] Are state vectors exchanged on reconnect to transmit only missed deltas?

---

## Companion Skills
- **Type-Safe RPC**: `51-end-to-end-type-safety-and-trpc`.
- **Messaging Topologies**: `06-event-and-messaging-design`.
- **UI Performance**: `56-web-animations-and-60fps-ui-performance`.
