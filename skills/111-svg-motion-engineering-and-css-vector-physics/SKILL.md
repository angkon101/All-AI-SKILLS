---
name: svg-motion-engineering-and-css-vector-physics
description: Pure CSS vector motion engineering in SVG, kinematics simulation (pendulum sway, harmonic oscillation, cable tension, traveling trolleys), co-prime loop synchronization, GPU-composited 60 FPS performance, and zero-JS GitHub markdown compatibility.
---

# ⚙️ SVG Motion Engineering, Kinematics & CSS Vector Physics

## 🎯 Role & Objective
As an **SVG Motion & Vector Kinematics Specialist**, your mandate is to architect high-performance, responsive vector animations entirely within pure SVG and CSS keyframes. You engineer physical simulations—including damped pendulum sway, cable tension, horizontal trolley translation, and vertical rack-and-pinion transit—without relying on JavaScript, ensuring 100% native compatibility with GitHub README markdown previews, Camo proxy sanitizers, and modern web browsers at a locked 60 FPS.

---

## 🏗️ SVG Rendering Pipeline & Vector Compositor Flow

```mermaid
flowchart LR
    subgraph BrowserEngine["Browser Rendering Engine"]
        SVG["SVG DOM Elements (<g>, <path>, <rect>)"] --> Style["CSS @keyframes Engine"]
        Style --> RenderRule{"Animated Property?"}
        RenderRule -->|transform: translate/rotate/scale| GPU["GPU Compositor Thread (Locked 60 FPS, Zero Reflow)"]
        RenderRule -->|opacity / filter| GPU
        RenderRule -->|x, y, width, height, d, r| CPU["CPU Layout & Vector Re-tessellation (Jank / Frame Drops!)"]
    end
```

---

## ⚙️ Standard Implementation Workflow

### Step 1: Zero-JS GitHub Markdown Architecture
GitHub's image sanitization service (`camo.githubusercontent.com`) strips all `<script>` tags, inline `onload` handlers, and external network requests:
1. **Self-Contained Styling**: Enclose all animations in `<style><![CDATA[ ... ]]></style>` inside `<defs>`. The CDATA block protects CSS combinators (`>`, `+`) and entities from XML parser errors.
2. **ViewBox Anchoring**: Always use `viewBox="0 0 W H"` with `width="100%" height="100%"` to allow fluid, responsive scaling without clipping bounding boxes.
3. **No External Fonts**: Use resilient system font stacks (`font-family="'JetBrains Mono', 'SF Pro Display', Courier, monospace"`).

### Step 2: Simulating Mechanical Kinematics with Pure CSS

#### 1. Crane Hoist Cable & Pendulum Sway Physics
When a crane trolley moves, a suspended load experiences pendulum lag and harmonic oscillation:
```css
/* Traveling Trolley along the horizontal jib track */
@keyframes craneTrolleyTravel {
  0%, 100% { transform: translateX(0px); }
  50% { transform: translateX(140px); }
}

/* Suspended Load: Vertical cable elasticity combined with angular sway */
@keyframes hoistPendulumSway {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(24px) rotate(-1.8deg); }
  75% { transform: translateY(-16px) rotate(1.5deg); }
}
```
*Structure in SVG:*
```xml
<g class="crane-trolley-anim">
  <!-- Trolley Body -->
  <rect x="-14" y="20" width="28" height="9" />
  
  <!-- Nested Pendulum Assembly: inherits translation, applies sway -->
  <g class="hoist-sway-anim" style="transform-origin: 0px 20px;">
    <line x1="-5" y1="29" x2="-4" y2="125" stroke="#ffffff" stroke-width="1.8" />
    <line x1="5" y1="29" x2="4" y2="125" stroke="#ffffff" stroke-width="1.8" />
    <!-- Hook Block and Suspended Girder -->
    <g transform="translate(0, 180)">
      <rect x="-70" y="-5" width="140" height="5" fill="#ffffff" />
    </g>
  </g>
</g>
```

#### 2. Rack-and-Pinion Construction Lift Transit
Simulate realistic acceleration, steady speed, deceleration, and dwell times:
```css
@keyframes hoistElevatorTransit {
  0%, 8% { transform: translateY(0px); }              /* Base Loading Dwell */
  45%, 55% { transform: translateY(-290px); }          /* Top Deck Unloading Dwell */
  92%, 100% { transform: translateY(0px); }           /* Return to Base */
}
.elevator-car {
  animation: hoistElevatorTransit 16s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}
```

### Step 3: Eliminating Mechanical Repetition with Co-Prime Timing
If all elements animate on 10-second cycles, the entire scene repeats identically every 10 seconds, looking robotic. Use **co-prime prime numbers** for independent animation loop durations:
- Trolley 1: `11s`
- Trolley 2: `13s`
- Hoist Lift: `17s`
- Welding Arc 1: `4.2s`
- Welding Arc 2: `3.8s` (delay `1.6s`)
- Laser Scanner: `7.5s`
- Excavator Arm: `8s`
- Concrete Pump: `1.6s`
*Result:* The animation has a least common multiple (LCM) of thousands of seconds, ensuring a dynamic, organic visual rhythm that never feels repetitive.

---

## 🚫 Anti-Patterns to Eliminate

- **❌ Animating Coordinate Attributes in CSS**:
  *Anti-pattern*: `@keyframes bad { 0% { x: 100px; width: 50px; } }`. This triggers CPU layout re-tessellation on every single frame.
  *Fix*: Always animate `transform: translate()` and `scale()`.
- **❌ Unanchored `transform-origin` in SVG**:
  *Anti-pattern*: Using percentage origins like `transform-origin: 50% 50%` inside nested SVG groups. Different browsers calculate the bounding box differently (viewBox origin vs element box).
  *Fix*: Specify explicit pixel-coordinate origins based on the SVG grid (e.g. `transform-origin: 315px 30px;`).
- **❌ Unshielded CSS in XML**:
  *Anti-pattern*: Placing raw CSS with `>` or `&` directly in `<style>`. This causes instant XML parsing failures.
  *Fix*: Always wrap with `<![CDATA[ ... ]]>`.

---

## ✅ Verification & Hardening Checklist

- [ ] SVG validates cleanly with zero errors under strict XML parsers (`python xml.etree.ElementTree`).
- [ ] No JavaScript (`<script>`, `onclick`, `onload`) exists in the document.
- [ ] All animations run strictly on the GPU compositor using `transform` and `opacity`.
- [ ] Nested kinematic groups (trolley -> cable -> girder) properly inherit parent coordinates without clipping.
- [ ] Loop durations utilize co-prime offsets to ensure rich, non-repetitive visual variety.
- [ ] Responsive `viewBox` maintains exact aspect ratio across widescreen monitors and mobile screens.
