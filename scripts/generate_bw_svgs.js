// Script to generate high-fidelity, White Background Architectural Drafting SVG animations for:
// 1. assets/commercial-building-site.svg (Widescreen 1200x540 commercial construction site on white paper)
// 2. assets/animated-banner.svg (Header hero banner 1200x440 with white background architectural construction site)
// and mirror both into docs/assets/

const fs = require('fs');
const path = require('path');

function generateCommercialBuildingSiteSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 540" width="100%" height="100%">
  <defs>
    <!-- Crisp White Architectural Paper Background -->
    <linearGradient id="whitePaperBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#fafafa" />
      <stop offset="100%" stop-color="#f4f4f5" />
    </linearGradient>

    <!-- Structural Steel Grayscale Gradients (Dark Inks) -->
    <linearGradient id="inkSteel" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="35%" stop-color="#27272a" />
      <stop offset="70%" stop-color="#3f3f46" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>

    <linearGradient id="craneInk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#000000" />
      <stop offset="40%" stop-color="#18181b" />
      <stop offset="80%" stop-color="#27272a" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>

    <!-- Glass Curtain Wall (White Blueprint Reflective Glazing) -->
    <linearGradient id="inkGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f4f4f5" stop-opacity="0.9" />
      <stop offset="30%" stop-color="#e4e4e7" stop-opacity="0.8" />
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#d4d4d8" stop-opacity="0.9" />
    </linearGradient>

    <!-- Architectural CAD Grid (Faint Drafting Graph on White) -->
    <pattern id="cadGridWhite" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000000" stroke-width="0.75" stroke-opacity="0.06" />
      <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#000000" stroke-width="0.35" stroke-opacity="0.03" />
    </pattern>

    <!-- Black and White 45-degree Safety Hazard Chevrons -->
    <pattern id="hazardStripeWhite" width="20" height="20" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="10" height="20" fill="#000000" />
      <rect x="10" width="10" height="20" fill="#ffffff" />
    </pattern>

    <!-- Drop Shadow and Flare Filters -->
    <filter id="draftingShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.12" />
    </filter>

    <filter id="arcFlashFilter" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- ====================================================================
         BOLD, PROMINENT, CONTINUOUS PHYSICAL MOVEMENTS (60 FPS PURE CSS)
         ==================================================================== -->
    <style>
    <![CDATA[
      /* 1. Tower Crane 1: BOLD Trolley Travel Across Working Jib (220px sweep!) */
      @keyframes crane1TrolleySweep {
        0%, 100% { transform: translateX(0px); }
        50%      { transform: translateX(230px); }
      }

      /* 2. Tower Crane 1: ACTUAL VERTICAL HOISTING + PENDULUM SWAY (lowers 65px and lifts back up) */
      @keyframes crane1HoistLift {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        20%      { transform: translateY(65px) rotate(-2.8deg); }
        50%      { transform: translateY(65px) rotate(2.2deg); }
        75%      { transform: translateY(15px) rotate(-1.5deg); }
      }

      /* 3. Core Luffing Crane 3: PROMINENT BOOM ANGLE ARTICULATION (swings from -28deg to -64deg) */
      @keyframes crane3BoomLuffing {
        0%, 100% { transform: rotate(-28deg); }
        50%      { transform: rotate(-64deg); }
      }
      @keyframes crane3CableTravel {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50%      { transform: translateY(-38px) rotate(2.5deg); }
      }

      /* 4. Tower Crane 2 (East Wing): Trolley Runs Across and Hoists Concrete Skip */
      @keyframes crane2TrolleyRun {
        0%, 100% { transform: translateX(0px); }
        50%      { transform: translateX(-160px); }
      }
      @keyframes crane2SkipHoist {
        0%, 100% { transform: translateY(0px); }
        35%      { transform: translateY(50px); }
        70%      { transform: translateY(-10px); }
      }

      /* 5. Alimak Construction Hoist: FULL-HEIGHT TRANSIT UP AND DOWN (310px travel!) */
      @keyframes alimakCarAscent {
        0%, 5%   { transform: translateY(0px); }
        45%, 55% { transform: translateY(-310px); }
        95%, 100%{ transform: translateY(0px); }
      }
      @keyframes alimakCarDescent {
        0%, 5%   { transform: translateY(-310px); }
        45%, 55% { transform: translateY(0px); }
        95%, 100%{ transform: translateY(-310px); }
      }

      /* 6. Hydraulic Excavator: ACTUAL FULL DIGGING and LOADING CYCLE (Boom + Stick + Bucket) */
      @keyframes excavatorBoomDig {
        0%, 100% { transform: rotate(0deg); }
        25%      { transform: rotate(-14deg); }
        50%      { transform: rotate(8deg); }
        75%      { transform: rotate(-4deg); }
      }
      @keyframes excavatorBucketDig {
        0%, 100% { transform: rotate(0deg); }
        30%      { transform: rotate(-35deg); }
        60%      { transform: rotate(28deg); }
        85%      { transform: rotate(-10deg); }
      }

      /* 7. Dump Truck Bed: Tilts Up and Shakes While Loading */
      @keyframes dumpBedTilt {
        0%, 100% { transform: rotate(0deg); }
        40%, 60% { transform: rotate(-16deg); }
      }

      /* 8. Concrete Mixer Truck Drum: FAST VISIBLE ROTATION */
      @keyframes mixerDrumSpin {
        0%   { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 80; }
      }

      /* 9. Concrete Boom Pump: High-Frequency Slurry Flow Pulse */
      @keyframes concreteSlurryFlow {
        0%   { stroke-dashoffset: 80; }
        100% { stroke-dashoffset: 0; }
      }

      /* 10. Mobile Crawler Crane: Lifts Pipe Cargo High into the Air */
      @keyframes crawlerCargoLift {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        45%, 55% { transform: translateY(-38px) rotate(-2.5deg); }
        80%      { transform: translateY(-10px) rotate(1.8deg); }
      }

      /* 11. Electric Arc Welding: HIGH INTENSITY FLASH and CASCADING SPARKS */
      @keyframes arcWeldingFlash {
        0%, 100% { opacity: 0; transform: scale(0.5); }
        12%      { opacity: 1; transform: scale(1.7); }
        18%      { opacity: 0.15; transform: scale(0.7); }
        25%      { opacity: 1; transform: scale(2.0); }
        35%      { opacity: 0.2; transform: scale(0.8); }
        45%      { opacity: 0.95; transform: scale(1.5); }
        55%, 95% { opacity: 0; }
      }
      @keyframes sparkCascade1 {
        0%   { transform: translate(0, 0) scale(1); opacity: 1; }
        100% { transform: translate(-24px, 58px) scale(0.2); opacity: 0; }
      }
      @keyframes sparkCascade2 {
        0%   { transform: translate(0, 0) scale(1); opacity: 1; }
        100% { transform: translate(18px, 66px) scale(0.2); opacity: 0; }
      }
      @keyframes sparkCascade3 {
        0%   { transform: translate(0, 0) scale(1); opacity: 1; }
        100% { transform: translate(-8px, 50px) scale(0.2); opacity: 0; }
      }

      /* 12. Laser Datum Elevation Scanner: Bold Vertical Sweep Across All Floors */
      @keyframes laserDatumSweep {
        0%   { transform: translateY(0px); opacity: 0.9; }
        50%  { transform: translateY(320px); opacity: 1; }
        100% { transform: translateY(0px); opacity: 0.9; }
      }

      /* 13. High-Visibility Strobe Flasher Beacons (Dark / High Contrast) */
      @keyframes strobeFlashDark {
        0%, 100% { opacity: 0.15; }
        50%      { opacity: 1; filter: drop-shadow(0 0 6px #000000); }
      }

      /* 14. Autonomous Site Drone 1: Active Aerial Patrol across Sky */
      @keyframes dronePatrol1 {
        0%, 100% { transform: translate(0, 0); }
        30%      { transform: translate(35px, -24px); }
        70%      { transform: translate(-25px, 16px); }
      }

      /* 15. Rigger Signalman: Rapid Baton Waving */
      @keyframes riggerBatonWave {
        0%, 100% { transform: rotate(0deg); }
        25%      { transform: rotate(-45deg); }
        75%      { transform: rotate(35deg); }
      }

      /* 16. Distant Background Crane Slew */
      @keyframes distantCraneSlew {
        0%, 100% { transform: rotate(0deg); }
        50%      { transform: rotate(-8deg); }
      }

      /* Applied Animation Classes */
      .anim-crane1-trolley { animation: crane1TrolleySweep 12s ease-in-out infinite; }
      .anim-crane1-hoist { animation: crane1HoistLift 12s ease-in-out infinite; }
      .anim-crane2-trolley { animation: crane2TrolleyRun 14s ease-in-out infinite; }
      .anim-crane2-skip { animation: crane2SkipHoist 14s ease-in-out infinite; }
      .anim-crane3-boom { animation: crane3BoomLuffing 10s ease-in-out infinite; transform-origin: 483px 26px; }
      .anim-crane3-cable { animation: crane3CableTravel 10s ease-in-out infinite; }
      .anim-alimak-up { animation: alimakCarAscent 16s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
      .anim-alimak-down { animation: alimakCarDescent 16s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
      .anim-excavator-arm { animation: excavatorBoomDig 7s ease-in-out infinite; transform-origin: 105px 455px; }
      .anim-excavator-bucket { animation: excavatorBucketDig 7s ease-in-out infinite; transform-origin: 65px 440px; }
      .anim-dump-bed { animation: dumpBedTilt 7s ease-in-out infinite; transform-origin: 145px 458px; }
      .anim-mixer-drum { stroke-dasharray: 8 12; animation: mixerDrumSpin 2s linear infinite; }
      .anim-concrete-slurry { stroke-dasharray: 8 14; animation: concreteSlurryFlow 1.4s linear infinite; }
      .anim-crawler-cargo { animation: crawlerCargoLift 9s ease-in-out infinite; }
      .anim-weld-flash1 { animation: arcWeldingFlash 4s ease-in-out infinite; transform-origin: center; }
      .anim-weld-flash2 { animation: arcWeldingFlash 3.6s ease-in-out 1.5s infinite; transform-origin: center; }
      .anim-weld-flash3 { animation: arcWeldingFlash 4.4s ease-in-out 2.5s infinite; transform-origin: center; }
      .anim-spark1 { animation: sparkCascade1 1.1s ease-out infinite; }
      .anim-spark2 { animation: sparkCascade2 1.3s ease-out 0.25s infinite; }
      .anim-spark3 { animation: sparkCascade3 1.1s ease-out 0.5s infinite; }
      .anim-laser-sweep { animation: laserDatumSweep 7s ease-in-out infinite; }
      .anim-strobe { animation: strobeFlashDark 0.9s ease-in-out infinite; }
      .anim-drone-patrol { animation: dronePatrol1 8s ease-in-out infinite; }
      .anim-rigger-wave { animation: riggerBatonWave 1.8s ease-in-out infinite; transform-origin: 18px -10px; }
      .anim-distant-crane { animation: distantCraneSlew 14s ease-in-out infinite; transform-origin: 220px 240px; }
    ]]>
    </style>
  </defs>

  <!-- ======================================================================
       1. WHITE ARCHITECTURAL CANVAS and TECHNICAL GRID
       ====================================================================== -->
  <!-- Clean White Paper Base -->
  <rect width="1200" height="540" fill="url(#whitePaperBg)" />

  <!-- CAD Drafting Coordinate Grid on White -->
  <rect width="1200" height="490" fill="url(#cadGridWhite)" />

  <!-- Elevation Ruler Calibration Lines (Left Technical Margin) -->
  <g font-family="'JetBrains Mono', Courier, monospace" font-size="8.5" fill="#52525b" opacity="0.9">
    <line x1="20" y1="35" x2="32" y2="35" stroke="#000000" stroke-width="1.2" />
    <text x="36" y="38" font-weight="700">+225.0m [CORE LUFFING CRANE]</text>
    <line x1="20" y1="80" x2="32" y2="80" stroke="#000000" stroke-width="1" />
    <text x="36" y="83">+185.0m [TOWER APEX JIB]</text>
    <line x1="20" y1="140" x2="32" y2="140" stroke="#000000" stroke-width="1" />
    <text x="36" y="143">+140.0m [CORE SLIPFORM L-34]</text>
    <line x1="20" y1="230" x2="32" y2="230" stroke="#000000" stroke-width="1" />
    <text x="36" y="233">+95.0m  [STEEL ERECTION L-24]</text>
    <line x1="20" y1="330" x2="32" y2="330" stroke="#000000" stroke-width="1" />
    <text x="36" y="333">+50.0m  [CURTAIN WALL GLZ]</text>
    <line x1="20" y1="480" x2="32" y2="480" stroke="#000000" stroke-width="1.5" />
    <text x="36" y="483" font-weight="700">±0.0m   [GROUND LEVEL DATUM]</text>
  </g>

  <!-- ======================================================================
       2. DISTANT BACKGROUND MEGA-SKYLINE (Crisp Grey Drafting Silhouettes)
       ====================================================================== -->
  <g fill="#f4f4f5" stroke="#a1a1aa" stroke-width="1.2">
    <!-- Skyscraper A (Far Left) -->
    <rect x="50" y="310" width="85" height="170" />
    <line x1="95" y1="310" x2="95" y2="255" stroke="#71717a" stroke-width="1.2" />
    <line x1="70" y1="260" x2="130" y2="260" stroke="#71717a" stroke-width="1" />
    <circle cx="95" cy="255" r="2" fill="#000000" class="anim-strobe" />

    <!-- Skyscraper B (Mid Left) with Slewing Crane -->
    <rect x="165" y="255" width="110" height="225" />
    <g class="anim-distant-crane">
      <line x1="220" y1="255" x2="220" y2="210" stroke="#52525b" stroke-width="1.5" />
      <line x1="175" y1="215" x2="265" y2="215" stroke="#52525b" stroke-width="1.2" />
      <line x1="220" y1="202" x2="255" y2="215" stroke="#71717a" stroke-width="0.8" />
      <circle cx="220" cy="202" r="2" fill="#000000" class="anim-strobe" />
      <circle cx="265" cy="215" r="1.5" fill="#000000" class="anim-strobe" />
    </g>

    <!-- Skyscraper C (Mid-Right) -->
    <rect x="715" y="275" width="95" height="205" />
    <line x1="760" y1="275" x2="760" y2="230" stroke="#71717a" stroke-width="1.2" />
    <line x1="730" y1="235" x2="800" y2="235" stroke="#71717a" stroke-width="1" />
    <circle cx="760" cy="230" r="2" fill="#000000" class="anim-strobe" />

    <!-- Skyscraper D (Far Right) with Twin Cranes -->
    <rect x="1050" y="235" width="125" height="245" />
    <line x1="1090" y1="235" x2="1090" y2="190" stroke="#52525b" stroke-width="1.5" />
    <line x1="1060" y1="195" x2="1135" y2="195" stroke="#52525b" stroke-width="1.2" />
    <circle cx="1090" cy="190" r="2" fill="#000000" class="anim-strobe" />
    <line x1="1145" y1="235" x2="1145" y2="205" stroke="#71717a" stroke-width="1.2" />
    <line x1="1125" y1="210" x2="1170" y2="210" stroke="#71717a" stroke-width="1" />
    <circle cx="1145" cy="205" r="2" fill="#000000" class="anim-strobe" />
  </g>

  <!-- Distant Window Array Matrix -->
  <g fill="#d4d4d8">
    <rect x="180" y="270" width="80" height="3" />
    <rect x="180" y="285" width="80" height="3" />
    <rect x="180" y="300" width="80" height="3" />
    <rect x="180" y="315" width="80" height="3" />
    <rect x="180" y="330" width="80" height="3" />
    <rect x="1065" y="250" width="95" height="3" />
    <rect x="1065" y="265" width="95" height="3" />
    <rect x="1065" y="280" width="95" height="3" />
    <rect x="1065" y="295" width="95" height="3" />
  </g>

  <!-- ======================================================================
       3. EAST COMMERCIAL TOWER WING (Midground: x=780 to x=980)
       ====================================================================== -->
  <g id="east-commercial-wing" filter="url(#draftingShadow)">
    <rect x="780" y="160" width="200" height="320" fill="#fafafa" stroke="#000000" stroke-width="2.5" />

    <!-- Ribbon Glazing Window Arrays (Levels 1 to 14) -->
    <g fill="url(#inkGlass)" stroke="#000000" stroke-width="1.2">
      <rect x="795" y="180" width="170" height="13" />
      <rect x="795" y="202" width="170" height="13" />
      <rect x="795" y="224" width="170" height="13" />
      <rect x="795" y="246" width="170" height="13" />
      <rect x="795" y="268" width="170" height="13" />
      <rect x="795" y="290" width="170" height="13" />
      <rect x="795" y="312" width="170" height="13" />
      <rect x="795" y="334" width="170" height="13" />
      <rect x="795" y="356" width="170" height="13" />
      <rect x="795" y="378" width="170" height="13" />
      <rect x="795" y="400" width="170" height="13" />
      <rect x="795" y="422" width="170" height="13" />
      <rect x="795" y="444" width="170" height="13" />
    </g>

    <!-- Vertical Architectural Mullions in Crisp Black -->
    <g stroke="#000000" stroke-width="1.5">
      <line x1="835" y1="160" x2="835" y2="480" />
      <line x1="880" y1="160" x2="880" y2="480" />
      <line x1="925" y1="160" x2="925" y2="480" />
    </g>

    <!-- Rooftop Mechanical Chiller Enclosure -->
    <rect x="805" y="138" width="150" height="22" fill="#e4e4e7" stroke="#000000" stroke-width="2" />
    <circle cx="840" cy="149" r="6" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
    <circle cx="870" cy="149" r="6" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
    <circle cx="900" cy="149" r="6" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
    <circle cx="805" cy="136" r="3" fill="#000000" class="anim-strobe" />
    <circle cx="955" cy="136" r="3" fill="#000000" class="anim-strobe" />

    <!-- Exterior Modular Scaffolding with Climbing Worker (x=760 to x=780) -->
    <g id="east-scaffolding">
      <line x1="765" y1="280" x2="765" y2="480" stroke="#000000" stroke-width="1.8" />
      <line x1="778" y1="280" x2="778" y2="480" stroke="#000000" stroke-width="1.8" />
      <path d="M 765 295 L 778 295 M 765 315 L 778 315 M 765 335 L 778 335
               M 765 355 L 778 355 M 765 375 L 778 375 M 765 395 L 778 395
               M 765 415 L 778 415 M 765 435 L 778 435 M 765 455 L 778 455" stroke="#000000" stroke-width="1.2" />
      <!-- Worker on scaffolding -->
      <circle cx="771" cy="350" r="3.2" fill="#000000" />
      <circle cx="771" cy="349" r="2.2" fill="#ffffff" /> <!-- Hardhat -->
      <rect x="768" y="353" width="6" height="10" fill="#000000" />
    </g>
  </g>

  <!-- ======================================================================
       4. SECONDARY TOWER CRANE #2 (Mounted behind East Wing at x=995)
       ====================================================================== -->
  <g id="secondary-tower-crane-2">
    <!-- Crane 2 Mast Tower (Solid Black Lattice) -->
    <g stroke="#000000" stroke-width="2" fill="none">
      <line x1="990" y1="95" x2="990" y2="480" stroke-width="3" />
      <line x1="1010" y1="95" x2="1010" y2="480" stroke-width="3" />
      <path d="M 990 95 L 1010 115 M 1010 95 L 990 115
               M 990 115 L 1010 135 M 1010 135 L 990 135
               M 990 135 L 1010 155 M 1010 155 L 990 155
               M 990 155 L 1010 175 M 1010 175 L 990 175
               M 990 175 L 1010 195 M 1010 195 L 990 195
               M 990 195 L 1010 215 M 1010 215 L 990 215
               M 990 215 L 1010 235 M 1010 235 L 990 235
               M 990 235 L 1010 255 M 1010 255 L 990 255
               M 990 255 L 1010 275 M 1010 275 L 990 275" stroke="#3f3f46" stroke-width="1.5" />
    </g>

    <!-- Turntable and Cab -->
    <rect x="985" y="85" width="30" height="12" rx="2" fill="#18181b" stroke="#000000" stroke-width="1.8" />
    <rect x="988" y="87" width="10" height="8" fill="#ffffff" stroke="#000000" stroke-width="1" />

    <!-- A-Frame Peak -->
    <polygon points="990,85 1010,85 1000,60" fill="#27272a" stroke="#000000" stroke-width="2.5" />
    <circle cx="1000" cy="58" r="3.5" fill="#000000" class="anim-strobe" />

    <!-- Jib Arm -->
    <g stroke="#000000" stroke-width="1.8" fill="none">
      <line x1="1000" y1="80" x2="790" y2="80" stroke-width="3" />
      <line x1="1000" y1="70" x2="800" y2="80" stroke-width="2" />
      <line x1="1000" y1="80" x2="1060" y2="80" stroke-width="3" />
      <rect x="1040" y="76" width="22" height="14" rx="1" fill="#27272a" stroke="#000000" stroke-width="2" />
      <line x1="1000" y1="60" x2="850" y2="80" stroke="#000000" stroke-width="1.5" />
      <line x1="1000" y1="60" x2="1055" y2="80" stroke="#000000" stroke-width="1.5" />
      <path d="M 1000 80 L 980 72 L 960 80 L 940 73 L 920 80 L 900 74 L 880 80 L 860 75 L 840 80 L 820 76 L 800 80" stroke="#52525b" />
    </g>

    <!-- PROMINENT MOVEMENT: Crane 2 Traveling Trolley & Lowering Concrete Skip -->
    <g transform="translate(950, 0)">
      <g class="anim-crane2-trolley">
        <rect x="-8" y="77" width="16" height="7" rx="1.5" fill="#000000" />
        <g class="anim-crane2-skip">
          <line x1="0" y1="84" x2="0" y2="135" stroke="#000000" stroke-width="1.5" stroke-dasharray="3 1" />
          <polygon points="-6,135 6,135 4,152 -4,152" fill="#18181b" stroke="#000000" stroke-width="1.8" />
          <rect x="-3" y="152" width="6" height="5" fill="#000000" />
          <line x1="0" y1="157" x2="8" y2="182" stroke="#52525b" stroke-width="1" /> <!-- Guide tag line -->
        </g>
      </g>
    </g>
  </g>

  <!-- ======================================================================
       5. MAIN COMMERCIAL HIGH-RISE SUPERSTRUCTURE (Center: x=370 to x=650)
       ====================================================================== -->
  <g id="main-commercial-skyscraper" filter="url(#draftingShadow)">
    <!-- Solid Concrete Core Box -->
    <rect x="370" y="55" width="280" height="425" fill="#fafafa" stroke="#000000" stroke-width="3" />

    <!-- Crown Penthouse Structure (Floors 28 - 34) -->
    <polygon points="415,55 605,55 605,130 415,130" fill="#f4f4f5" stroke="#000000" stroke-width="2" />

    <!-- Self-Climbing Slipform Core Jump Rig (Roof Level: y=34) -->
    <g id="slipform-jump-rig">
      <rect x="465" y="34" width="90" height="24" fill="#000000" stroke="#000000" stroke-width="2" />
      <rect x="470" y="38" width="80" height="5" fill="#ffffff" />
      <text x="510" y="51" fill="#ffffff" font-family="'JetBrains Mono', Courier" font-size="7.5" font-weight="900" text-anchor="middle">SLIPFORM L-34</text>
      <!-- Rebar dowel rods protruding vertically -->
      <line x1="475" y1="34" x2="475" y2="24" stroke="#000000" stroke-width="2" />
      <line x1="485" y1="34" x2="485" y2="24" stroke="#000000" stroke-width="2" />
      <line x1="495" y1="34" x2="495" y2="24" stroke="#000000" stroke-width="2" />
      <line x1="505" y1="34" x2="505" y2="24" stroke="#000000" stroke-width="2" />
      <line x1="515" y1="34" x2="515" y2="24" stroke="#000000" stroke-width="2" />
      <line x1="525" y1="34" x2="525" y2="24" stroke="#000000" stroke-width="2" />
      <line x1="535" y1="34" x2="535" y2="24" stroke="#000000" stroke-width="2" />
      <line x1="545" y1="34" x2="545" y2="24" stroke="#000000" stroke-width="2" />
      <line x1="545" y1="34" x2="545" y2="18" stroke="#000000" stroke-width="2" />
      <circle cx="545" cy="16" r="4" fill="#000000" class="anim-strobe" />

      <!-- ================================================================
           PROMINENT MOVEMENT: TOWER CRANE #3 (CORE-MOUNTED LUFFING BOOM)
           ================================================================ -->
      <g id="climbing-crane-3">
        <!-- Climbing Base -->
        <rect x="476" y="16" width="14" height="20" fill="#27272a" stroke="#000000" stroke-width="1.8" />
        <rect x="473" y="10" width="20" height="8" rx="1.5" fill="#000000" />
        <polygon points="475,10 491,10 483,-2" fill="#000000" />
        <circle cx="483" cy="-3" r="3.5" fill="#000000" class="anim-strobe" />

        <!-- ACTUAL PIVOTING LUFFING JIB BOOM (Swings between -28deg and -64deg) -->
        <g class="anim-crane3-boom">
          <line x1="483" y1="24" x2="540" y2="-12" stroke="#000000" stroke-width="3" />
          <line x1="483" y1="18" x2="536" y2="-12" stroke="#000000" stroke-width="2" />
          <path d="M 483 24 L 495 18 L 507 22 L 519 14 L 531 18 L 540 -12" stroke="#000000" stroke-width="1.2" fill="none" />
          <circle cx="540" cy="-12" r="3.5" fill="#000000" class="anim-strobe" />

          <!-- Cable Lowering and Raising Rebar Load -->
          <g transform="translate(540, -12)">
            <g class="anim-crane3-cable">
              <line x1="0" y1="0" x2="0" y2="42" stroke="#000000" stroke-width="1.5" stroke-dasharray="2 1" />
              <!-- Heavy Rebar Cage -->
              <g transform="translate(-10, 42)">
                <rect width="20" height="24" fill="#ffffff" stroke="#000000" stroke-width="2" />
                <line x1="5" y1="0" x2="5" y2="24" stroke="#000000" stroke-width="1.5" />
                <line x1="10" y1="0" x2="10" y2="24" stroke="#000000" stroke-width="1.5" />
                <line x1="15" y1="0" x2="15" y2="24" stroke="#000000" stroke-width="1.5" />
                <line x1="0" y1="6" x2="20" y2="6" stroke="#000000" stroke-width="1.5" />
                <line x1="0" y1="12" x2="20" y2="12" stroke="#000000" stroke-width="1.5" />
                <line x1="0" y1="18" x2="20" y2="18" stroke="#000000" stroke-width="1.5" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>

    <!-- Structural High-Rise Heavy Steel Framework (Floors 18 - 32: y=60 to y=250) -->
    <g stroke="url(#inkSteel)" stroke-width="2.5" fill="none">
      <!-- Super-Columns -->
      <line x1="385" y1="55" x2="385" y2="260" stroke="#000000" stroke-width="3.5" />
      <line x1="440" y1="55" x2="440" y2="260" stroke="#000000" stroke-width="2.8" />
      <line x1="510" y1="55" x2="510" y2="260" stroke="#000000" stroke-width="3.8" />
      <line x1="580" y1="55" x2="580" y2="260" stroke="#000000" stroke-width="2.8" />
      <line x1="635" y1="55" x2="635" y2="260" stroke="#000000" stroke-width="3.5" />

      <!-- Horizontal Girders -->
      <line x1="370" y1="75" x2="650" y2="75" stroke="#000000" stroke-width="2.5" />
      <line x1="370" y1="95" x2="650" y2="95" stroke="#27272a" stroke-width="2" />
      <line x1="370" y1="115" x2="650" y2="115" stroke="#27272a" stroke-width="2" />
      <line x1="370" y1="135" x2="650" y2="135" stroke="#000000" stroke-width="3" />
      <line x1="370" y1="155" x2="650" y2="155" stroke="#27272a" stroke-width="2" />
      <line x1="370" y1="175" x2="650" y2="175" stroke="#27272a" stroke-width="2" />
      <line x1="370" y1="195" x2="650" y2="195" stroke="#000000" stroke-width="3" />
      <line x1="370" y1="215" x2="650" y2="215" stroke="#27272a" stroke-width="2" />
      <line x1="370" y1="235" x2="650" y2="235" stroke="#27272a" stroke-width="2" />
      <line x1="370" y1="255" x2="650" y2="255" stroke="#000000" stroke-width="3" />

      <!-- Seismic Chevron & X-Bracing Trusses -->
      <path d="M 385 75 L 440 95 M 440 75 L 385 95
               M 440 75 L 510 95 M 510 75 L 440 95
               M 510 75 L 580 95 M 580 75 L 510 95
               M 580 75 L 635 95 M 635 75 L 580 95
               M 385 115 L 440 135 M 440 115 L 385 135
               M 580 115 L 635 135 M 635 115 L 580 135
               M 385 155 L 510 195 M 510 155 L 385 195
               M 510 155 L 635 195 M 635 155 L 510 195
               M 385 195 L 510 235 M 510 195 L 385 235
               M 510 195 L 635 235 M 635 195 L 510 235" stroke="#3f3f46" stroke-width="2" />
    </g>

    <!-- Corrugated Metal Floor Decking -->
    <g stroke="#000000" stroke-width="1.2" opacity="0.6">
      <line x1="385" y1="133" x2="635" y2="133" stroke-dasharray="2 2" />
      <line x1="385" y1="173" x2="635" y2="173" stroke-dasharray="2 2" />
      <line x1="385" y1="213" x2="635" y2="213" stroke-dasharray="2 2" />
    </g>

    <!-- High-Rise Construction Safety Netting (Floors 16 - 22: y=175 to y=235) -->
    <g opacity="0.6">
      <rect x="372" y="177" width="276" height="16" fill="#e4e4e7" stroke="#000000" stroke-width="1.5" stroke-dasharray="3 3" />
      <rect x="372" y="217" width="276" height="16" fill="#e4e4e7" stroke="#000000" stroke-width="1.5" stroke-dasharray="3 3" />
    </g>

    <!-- Mid-Level Active Curtain Wall Glazing (Floors 11 - 16: y=255 to y=345) -->
    <g>
      <rect x="380" y="258" width="80" height="18" rx="1" fill="url(#inkGlass)" stroke="#000000" stroke-width="1.8" />
      <rect x="470" y="258" width="90" height="18" rx="1" fill="url(#inkGlass)" stroke="#000000" stroke-width="1.8" />
      <rect x="380" y="280" width="130" height="18" rx="1" fill="url(#inkGlass)" stroke="#000000" stroke-width="1.8" />
      <rect x="520" y="280" width="120" height="18" rx="1" fill="url(#inkGlass)" stroke="#000000" stroke-width="1.8" />
      <rect x="380" y="302" width="260" height="18" rx="1" fill="url(#inkGlass)" stroke="#000000" stroke-width="1.8" />
      <rect x="380" y="324" width="260" height="18" rx="1" fill="url(#inkGlass)" stroke="#000000" stroke-width="1.8" />
    </g>

    <!-- Completed Commercial Base Floors (Floors 1 - 10: y=346 to y=480) -->
    <g>
      <rect x="378" y="346" width="264" height="19" fill="url(#inkGlass)" stroke="#000000" stroke-width="1.8" />
      <rect x="378" y="368" width="264" height="19" fill="url(#inkGlass)" stroke="#000000" stroke-width="1.8" />
      <rect x="378" y="390" width="264" height="19" fill="url(#inkGlass)" stroke="#000000" stroke-width="1.8" />
      <rect x="378" y="412" width="264" height="19" fill="url(#inkGlass)" stroke="#000000" stroke-width="1.8" />
      <rect x="378" y="434" width="264" height="19" fill="url(#inkGlass)" stroke="#000000" stroke-width="1.8" />
      <rect x="378" y="456" width="264" height="24" fill="url(#inkGlass)" stroke="#000000" stroke-width="2" />

      <!-- Vertical Exterior Structural Fins in Solid Black -->
      <g stroke="#000000" stroke-width="2">
        <line x1="415" y1="346" x2="415" y2="480" />
        <line x1="465" y1="346" x2="465" y2="480" />
        <line x1="510" y1="346" x2="510" y2="480" />
        <line x1="555" y1="346" x2="555" y2="480" />
        <line x1="605" y1="346" x2="605" y2="480" />
      </g>
    </g>

    <!-- Technical Floor Level Markers -->
    <g font-family="'JetBrains Mono', Courier, monospace" font-size="7.5" font-weight="900" fill="#000000">
      <text x="372" y="93" text-anchor="end">L-30</text>
      <text x="372" y="153" text-anchor="end">L-24</text>
      <text x="372" y="233" text-anchor="end">L-18</text>
      <text x="372" y="323" text-anchor="end">L-12</text>
      <text x="372" y="413" text-anchor="end">L-06</text>
      <text x="372" y="473" text-anchor="end">L-01</text>
    </g>

    <!-- Ironworker Crew on L-26 Girder -->
    <g transform="translate(460, 95)">
      <circle cx="0" cy="-6" r="3.2" fill="#000000" />
      <circle cx="0" cy="-7" r="2" fill="#ffffff" /> <!-- Hardhat -->
      <rect x="-3" y="-2" width="6" height="10" fill="#000000" />
      <line x1="0" y1="2" x2="0" y2="-12" stroke="#000000" stroke-width="1.2" />
      <line x1="-30" y1="-12" x2="40" y2="-12" stroke="#000000" stroke-width="1" stroke-dasharray="2 2" />
    </g>

    <!-- Cantilevered Rigger Platform with RAPID ARM WAVING (x=635, y=175) -->
    <g transform="translate(635, 175)">
      <line x1="0" y1="0" x2="25" y2="0" stroke="#000000" stroke-width="3" />
      <line x1="15" y1="0" x2="0" y2="-15" stroke="#000000" stroke-width="2" />
      <rect x="15" y="-12" width="10" height="12" fill="none" stroke="#000000" stroke-width="1.5" />
      <!-- Signalman Worker -->
      <circle cx="20" cy="-16" r="3" fill="#000000" />
      <rect x="18" y="-13" width="5" height="11" fill="#000000" />
      <!-- PROMINENT MOVEMENT: Waving Baton Arm -->
      <g class="anim-rigger-wave">
        <line x1="20" y1="-10" x2="30" y2="-20" stroke="#000000" stroke-width="2.5" />
        <circle cx="30" cy="-20" r="2.5" fill="#000000" />
      </g>
    </g>
  </g>

  <!-- ======================================================================
       6. PROMINENT MOVEMENT: DUAL-CAR CLIMBING ALIMAK HOIST (Full-Height Run)
       ====================================================================== -->
  <g id="dual-climbing-hoist">
    <!-- Vertical Mast Tower -->
    <g stroke="#000000" stroke-width="2" fill="none">
      <line x1="662" y1="75" x2="662" y2="480" stroke-width="3" />
      <line x1="676" y1="75" x2="676" y2="480" stroke-width="3" />
      <path d="M 662 85 L 676 85 M 662 100 L 676 100 M 662 115 L 676 115
               M 662 130 L 676 130 M 662 145 L 676 145 M 662 160 L 676 160
               M 662 175 L 676 175 M 662 190 L 676 190 M 662 205 L 676 205
               M 662 220 L 676 220 M 662 235 L 676 235 M 662 250 L 676 250
               M 662 265 L 676 265 M 662 280 L 676 280 M 662 295 L 676 295
               M 662 310 L 676 310 M 662 325 L 676 325 M 662 340 L 676 340
               M 662 355 L 676 355 M 662 370 L 676 370 M 662 385 L 676 385
               M 662 400 L 676 400 M 662 415 L 676 415 M 662 430 L 676 430
               M 662 445 L 676 445 M 662 460 L 676 460 M 662 475 L 676 475" stroke="#3f3f46" stroke-width="1.2" />
    </g>

    <!-- Wall Ties to Building -->
    <line x1="650" y1="135" x2="662" y2="135" stroke="#000000" stroke-width="2.5" />
    <line x1="650" y1="235" x2="662" y2="235" stroke="#000000" stroke-width="2.5" />
    <line x1="650" y1="335" x2="662" y2="335" stroke="#000000" stroke-width="2.5" />
    <line x1="650" y1="435" x2="662" y2="435" stroke="#000000" stroke-width="2.5" />

    <!-- ALIMAK CAR A: ASCENDING 310px FROM GROUND TO FLOOR 28 -->
    <g transform="translate(0, 440)" class="anim-alimak-up">
      <rect x="642" y="0" width="18" height="32" rx="2" fill="#ffffff" stroke="#000000" stroke-width="2.5" />
      <rect x="644" y="4" width="14" height="14" fill="#e4e4e7" stroke="#000000" stroke-width="1" stroke-dasharray="2 2" />
      <rect x="642" y="24" width="18" height="8" fill="url(#hazardStripeWhite)" />
      <circle cx="651" cy="-3" r="3" fill="#000000" class="anim-strobe" />
    </g>

    <!-- ALIMAK CAR B: DESCENDING 310px FROM FLOOR 28 TO GROUND -->
    <g transform="translate(0, 440)" class="anim-alimak-down">
      <rect x="678" y="0" width="18" height="32" rx="2" fill="#ffffff" stroke="#000000" stroke-width="2.5" />
      <rect x="680" y="4" width="14" height="14" fill="#e4e4e7" stroke="#000000" stroke-width="1" stroke-dasharray="2 2" />
      <rect x="678" y="24" width="18" height="8" fill="url(#hazardStripeWhite)" />
      <circle cx="687" cy="-3" r="3" fill="#000000" class="anim-strobe" />
    </g>
  </g>

  <!-- ======================================================================
       7. PROMINENT MOVEMENT: PRIMARY TOWER CRANE #1 (Centerpiece: x=315)
       ====================================================================== -->
  <g id="heavy-tower-crane-1">
    <!-- Crane Vertical Lattice Mast -->
    <g stroke="url(#craneInk)" stroke-width="2" fill="none">
      <line x1="305" y1="30" x2="305" y2="480" stroke-width="4" />
      <line x1="325" y1="30" x2="325" y2="480" stroke-width="4" />
      <path d="M 305 30 L 325 50 M 325 30 L 305 50
               M 305 50 L 325 70 M 325 50 L 305 70
               M 305 70 L 325 90 M 325 70 L 305 90
               M 305 90 L 325 110 M 325 90 L 305 110
               M 305 110 L 325 130 M 325 110 L 305 130
               M 305 130 L 325 150 M 325 130 L 305 150
               M 305 150 L 325 170 M 325 150 L 305 170
               M 305 170 L 325 190 M 325 170 L 305 190
               M 305 190 L 325 210 M 325 190 L 305 210
               M 305 210 L 325 230 M 325 210 L 305 230
               M 305 230 L 325 250 M 325 230 L 305 250
               M 305 250 L 325 270 M 325 250 L 305 270
               M 305 270 L 325 290 M 325 270 L 305 290
               M 305 290 L 325 310 M 325 290 L 305 310
               M 305 310 L 325 330 M 325 310 L 305 330
               M 305 330 L 325 350 M 325 330 L 305 350
               M 305 350 L 325 370 M 325 350 L 305 370
               M 305 370 L 325 390 M 325 370 L 305 390
               M 305 390 L 325 410 M 325 390 L 305 410
               M 305 410 L 325 430 M 325 410 L 305 430
               M 305 430 L 325 450 M 325 430 L 305 450
               M 305 450 L 325 470 M 325 450 L 305 470
               M 305 470 L 325 480 M 325 470 L 305 480" stroke="#3f3f46" stroke-width="1.8" />
    </g>

    <!-- Collar Ties to Building -->
    <g stroke="#000000" stroke-width="3.5">
      <line x1="325" y1="135" x2="370" y2="135" />
      <line x1="325" y1="235" x2="370" y2="235" />
      <line x1="325" y1="345" x2="370" y2="345" />
    </g>

    <!-- Turntable and Operator Cab -->
    <rect x="298" y="24" width="34" height="8" rx="2" fill="#000000" />
    <rect x="318" y="18" width="22" height="20" rx="3" fill="#18181b" stroke="#000000" stroke-width="2" />
    <rect x="323" y="21" width="14" height="13" fill="#ffffff" stroke="#000000" stroke-width="1.2" />

    <!-- A-Frame Peak -->
    <polygon points="305,24 325,24 315,3" fill="#000000" stroke="#000000" stroke-width="3" />
    <circle cx="315" cy="2" r="5" fill="#000000" class="anim-strobe" />

    <!-- Counter-Jib -->
    <g stroke="#000000" stroke-width="2.5">
      <line x1="315" y1="22" x2="205" y2="22" stroke-width="4" />
      <line x1="315" y1="14" x2="215" y2="22" stroke-width="2.5" />
      <rect x="210" y="16" width="36" height="22" rx="2" fill="#27272a" stroke="#000000" stroke-width="2" />
      <line x1="222" y1="16" x2="222" y2="38" stroke="#ffffff" stroke-width="1.5" />
      <line x1="234" y1="16" x2="234" y2="38" stroke="#ffffff" stroke-width="1.5" />
      <line x1="315" y1="3" x2="215" y2="18" stroke="#000000" stroke-width="2.5" />
    </g>

    <!-- Working Jib Truss -->
    <g stroke="#000000" stroke-width="2.5" fill="none">
      <line x1="315" y1="22" x2="705" y2="22" stroke-width="4" />
      <line x1="315" y1="10" x2="695" y2="22" stroke-width="2.5" />
      <path d="M 315 22 L 335 11 L 355 22 L 375 12 L 395 22 L 415 13 L 435 22
               L 455 14 L 475 22 L 495 15 L 515 22 L 535 16 L 555 22
               L 575 17 L 595 22 L 615 18 L 635 22 L 655 19 L 675 22 L 695 22" stroke="#3f3f46" stroke-width="1.8" />
      <line x1="315" y1="3" x2="490" y2="18" stroke="#000000" stroke-width="2.8" />
      <line x1="315" y1="3" x2="640" y2="20" stroke="#000000" stroke-width="2" />
    </g>
    <circle cx="705" cy="22" r="4" fill="#000000" class="anim-strobe" />

    <!-- PROMINENT MOVEMENT: 230px Traveling Trolley + Dynamic 65px Vertical Hoist Lift -->
    <g transform="translate(360, 0)">
      <g class="anim-crane1-trolley">
        <!-- Traveling Trolley on Track -->
        <rect x="-14" y="20" width="28" height="9" rx="2" fill="#000000" />
        <circle cx="-6" cy="24" r="3" fill="#ffffff" />
        <circle cx="6" cy="24" r="3" fill="#ffffff" />

        <!-- Actual Dynamic Vertical Lift & Pendulum Sway of Suspended Girder -->
        <g class="anim-crane1-hoist">
          <line x1="-6" y1="29" x2="-5" y2="120" stroke="#000000" stroke-width="2" />
          <line x1="6" y1="29" x2="5" y2="120" stroke="#000000" stroke-width="2" />

          <!-- Hook Sheave Block -->
          <rect x="-9" y="120" width="18" height="14" rx="2" fill="#18181b" stroke="#000000" stroke-width="2" />
          <path d="M 0 134 C -5 136 -6 143 0 145 C 6 146 7 141 3 137" fill="none" stroke="#000000" stroke-width="3.5" stroke-linecap="round" />

          <!-- Rigging Slings -->
          <line x1="0" y1="145" x2="-60" y2="175" stroke="#000000" stroke-width="1.8" />
          <line x1="0" y1="145" x2="60" y2="175" stroke="#000000" stroke-width="1.8" />

          <!-- Suspended Heavy Commercial I-Beam Girder in Crisp Black -->
          <g transform="translate(0, 175)">
            <rect x="-70" y="-5" width="140" height="5" rx="1" fill="#000000" />
            <rect x="-65" y="0" width="130" height="7" fill="#27272a" />
            <rect x="-70" y="7" width="140" height="5" rx="1" fill="#000000" />
            <text x="0" y="6" fill="#ffffff" font-family="'JetBrains Mono', Courier" font-size="6.5" font-weight="900" text-anchor="middle" letter-spacing="1">GIRDER #W24x162 • SWL 25T</text>
            <circle cx="-60" cy="-3" r="2.5" fill="#000000" />
            <circle cx="60" cy="-3" r="2.5" fill="#000000" />
          </g>
        </g>
      </g>
    </g>
  </g>

  <!-- ======================================================================
       8. PROMINENT MOVEMENT: WELDING STATIONS & CASCADING SPARK RAIN
       ====================================================================== -->
  <!-- Welding Station 1: Joint at (440, 135) on Level 24 -->
  <g transform="translate(440, 135)">
    <!-- High-Contrast Arc Welding Flare (Black Glow / White Core) -->
    <circle cx="0" cy="0" r="18" fill="#000000" opacity="0.3" filter="url(#arcFlashFilter)" class="anim-weld-flash1" />
    <circle cx="0" cy="0" r="7" fill="#000000" class="anim-weld-flash1" />
    <!-- Falling Dark Molten Sparks (Cascading 58px Downward) -->
    <circle cx="-3" cy="0" r="2.2" fill="#000000" class="anim-spark1" />
    <circle cx="3" cy="0" r="2.5" fill="#000000" class="anim-spark2" />
    <circle cx="0" cy="0" r="2" fill="#000000" class="anim-spark3" />
    <!-- Ironworker -->
    <circle cx="12" cy="-6" r="3.5" fill="#000000" />
    <circle cx="12" cy="-7" r="2" fill="#ffffff" /> <!-- Helmet -->
    <rect x="8" y="-2" width="8" height="13" rx="1" fill="#000000" />
  </g>

  <!-- Welding Station 2: Joint at (580, 195) on Level 18 -->
  <g transform="translate(580, 195)">
    <circle cx="0" cy="0" r="16" fill="#000000" opacity="0.3" filter="url(#arcFlashFilter)" class="anim-weld-flash2" />
    <circle cx="0" cy="0" r="6" fill="#000000" class="anim-weld-flash2" />
    <circle cx="-2" cy="0" r="2.2" fill="#000000" class="anim-spark2" />
    <circle cx="2" cy="0" r="1.8" fill="#000000" class="anim-spark3" />
    <circle cx="-12" cy="-6" r="3.5" fill="#000000" />
    <rect x="-16" y="-2" width="8" height="13" rx="1" fill="#000000" />
  </g>

  <!-- Welding Station 3: Joint at (510, 75) on Level 30 -->
  <g transform="translate(510, 75)">
    <circle cx="0" cy="0" r="15" fill="#000000" opacity="0.3" filter="url(#arcFlashFilter)" class="anim-weld-flash3" />
    <circle cx="0" cy="0" r="6" fill="#000000" class="anim-weld-flash3" />
    <circle cx="1" cy="0" r="2" fill="#000000" class="anim-spark1" />
    <circle cx="-2" cy="0" r="1.8" fill="#000000" class="anim-spark2" />
  </g>

  <!-- ======================================================================
       9. PROMINENT MOVEMENT: CAD LASER LEVELING ELEVATION SCANNER
       ====================================================================== -->
  <!-- Sweeps across entire skyscraper (320px vertical sweep!) -->
  <g class="anim-laser-sweep" transform="translate(0, 120)">
    <line x1="340" y1="0" x2="670" y2="0" stroke="#000000" stroke-width="2.5" />
    <circle cx="340" cy="0" r="4" fill="#000000" />
    <rect x="675" y="-10" width="90" height="20" rx="3" fill="#000000" />
    <text x="720" y="4" fill="#ffffff" font-family="'JetBrains Mono', Courier" font-size="8" font-weight="900" text-anchor="middle">DATUM ±0.01mm</text>
  </g>

  <!-- ======================================================================
       10. PROMINENT MOVEMENT: AUTONOMOUS BIM INSPECTION DRONE (Active Patrol)
       ====================================================================== -->
  <g transform="translate(710, 190)" class="anim-drone-patrol">
    <line x1="-16" y1="-8" x2="16" y2="8" stroke="#000000" stroke-width="2.5" />
    <line x1="-16" y1="8" x2="16" y2="-8" stroke="#000000" stroke-width="2.5" />
    <ellipse cx="-16" cy="-8" rx="8" ry="2.5" fill="#000000" opacity="0.6" />
    <ellipse cx="16" cy="8" rx="8" ry="2.5" fill="#000000" opacity="0.6" />
    <ellipse cx="-16" cy="8" rx="8" ry="2.5" fill="#000000" opacity="0.6" />
    <ellipse cx="16" cy="-8" rx="8" ry="2.5" fill="#000000" opacity="0.6" />
    <rect x="-8" y="-6" width="16" height="12" rx="3" fill="#000000" />
    <circle cx="0" cy="2" r="3" fill="#ffffff" />
    <!-- Dynamic target sensor beam -->
    <line x1="-8" y1="2" x2="-65" y2="8" stroke="#000000" stroke-width="1.5" stroke-dasharray="3 3" />
  </g>

  <!-- ======================================================================
       11. PROMINENT MOVEMENT: ACTIVE GROUND EXCAVATION, TRUCKS & MACHINERY
       ====================================================================== -->
  <!-- Concrete Ground Grade Base -->
  <rect x="0" y="480" width="1200" height="60" fill="#f4f4f5" stroke="#000000" stroke-width="2.5" />

  <!-- Foundation Piling Caps in Solid Black -->
  <g stroke="#000000" stroke-width="4">
    <line x1="280" y1="480" x2="350" y2="480" stroke-width="7" />
    <line x1="630" y1="480" x2="760" y2="480" stroke-width="7" />
  </g>

  <!-- Perimeter Safety Barrier (Black & White Chevrons) -->
  <rect x="0" y="473" width="1200" height="8" fill="url(#hazardStripeWhite)" stroke="#000000" stroke-width="1" />

  <!-- A. ACTIVE EXCAVATION PIT: HYDRAULIC EXCAVATOR + TILTING DUMP TRUCK -->
  <g id="excavator-pit-zone" transform="translate(15, 435)">
    <!-- Earth Trench Bank -->
    <path d="M 0 45 L 35 45 L 50 35 L 140 35" fill="none" stroke="#27272a" stroke-width="2.5" />

    <!-- 1. ACTUAL DIGGING HYDRAULIC EXCAVATOR -->
    <g id="hydraulic-excavator">
      <rect x="45" y="32" width="60" height="14" rx="4" fill="#000000" stroke="#000000" stroke-width="2" />
      <circle cx="53" cy="39" r="4" fill="#ffffff" stroke="#000000" stroke-width="1.8" />
      <circle cx="65" cy="39" r="4" fill="#ffffff" stroke="#000000" stroke-width="1.8" />
      <circle cx="77" cy="39" r="4" fill="#ffffff" stroke="#000000" stroke-width="1.8" />
      <circle cx="89" cy="39" r="4" fill="#ffffff" stroke="#000000" stroke-width="1.8" />
      <circle cx="99" cy="39" r="4" fill="#ffffff" stroke="#000000" stroke-width="1.8" />
      <!-- Cab -->
      <rect x="60" y="14" width="45" height="20" rx="3" fill="#18181b" stroke="#000000" stroke-width="2" />
      <rect x="63" y="17" width="16" height="12" fill="#ffffff" stroke="#000000" stroke-width="1.2" />
      <rect x="98" y="16" width="12" height="18" rx="2" fill="#000000" />

      <!-- PROMINENT MOVEMENT: Articulated Boom Dips into Trench and Scoops -->
      <g class="anim-excavator-arm">
        <polygon points="70,20 45,-12 35,-6 65,24" fill="#000000" stroke="#000000" stroke-width="2" />
        <circle cx="70" cy="22" r="3.5" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
        <line x1="75" y1="20" x2="53" y2="4" stroke="#000000" stroke-width="3" />

        <!-- Stick and Bucket Scooping -->
        <g class="anim-excavator-bucket">
          <polygon points="40,-12 10,15 17,18 45,-6" fill="#27272a" stroke="#000000" stroke-width="2" />
          <circle cx="40" cy="-9" r="3.5" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
          <path d="M 10 15 L -6 32 L 8 38 L 17 18 Z" fill="#000000" stroke="#000000" stroke-width="2" />
          <polygon points="-6,32 -11,36 -2,35" fill="#ffffff" stroke="#000000" stroke-width="1" />
          <polygon points="-2,35 -6,40 2,37" fill="#ffffff" stroke="#000000" stroke-width="1" />
        </g>
      </g>
    </g>

    <!-- 2. ACTUAL MOVEMENT: Heavy Dump Truck with Tilting Cargo Bed at x=115 -->
    <g id="dump-truck" transform="translate(112, 10)">
      <rect x="35" y="10" width="25" height="24" rx="2" fill="#000000" />
      <rect x="42" y="13" width="16" height="10" fill="#ffffff" stroke="#000000" stroke-width="1.2" />
      <!-- PROMINENT MOVEMENT: Tilting Bed -->
      <g class="anim-dump-bed">
        <polygon points="0,6 32,6 30,26 0,26" fill="#18181b" stroke="#000000" stroke-width="2" />
        <rect x="0" y="20" width="10" height="6" fill="url(#hazardStripeWhite)" />
      </g>
      <circle cx="8" cy="34" r="6" fill="#000000" />
      <circle cx="8" cy="34" r="2.5" fill="#ffffff" />
      <circle cx="22" cy="34" r="6" fill="#000000" />
      <circle cx="22" cy="34" r="2.5" fill="#ffffff" />
      <circle cx="48" cy="34" r="6" fill="#000000" />
      <circle cx="48" cy="34" r="2.5" fill="#ffffff" />
    </g>
  </g>

  <!-- B. ACTIVE CONCRETE BOOM PUMP TRUCK (Spinning Mixer Drum + Flowing Slurry) -->
  <g id="concrete-boom-truck" transform="translate(195, 445)">
    <rect x="0" y="10" width="75" height="24" rx="3" fill="#000000" />
    <rect x="52" y="13" width="18" height="12" fill="#ffffff" stroke="#000000" stroke-width="1.2" />
    <circle cx="15" cy="34" r="7" fill="#000000" />
    <circle cx="15" cy="34" r="3" fill="#ffffff" />
    <circle cx="35" cy="34" r="7" fill="#000000" />
    <circle cx="35" cy="34" r="3" fill="#ffffff" />
    <circle cx="62" cy="34" r="7" fill="#000000" />
    <circle cx="62" cy="34" r="3" fill="#ffffff" />

    <!-- PROMINENT MOVEMENT: Spinning Drum with Bold Spirals -->
    <ellipse cx="28" cy="8" rx="22" ry="13" fill="#ffffff" stroke="#000000" stroke-width="2.5" />
    <path d="M 12 8 Q 28 -2 44 8" fill="none" stroke="#000000" stroke-width="2.5" class="anim-mixer-drum" />

    <line x1="5" y1="28" x2="-8" y2="36" stroke="#000000" stroke-width="3.5" />
    <line x1="70" y1="28" x2="82" y2="36" stroke="#000000" stroke-width="3.5" />

    <!-- PROMINENT MOVEMENT: Hydraulic Boom with Pulsing Slurry Flow -->
    <g stroke="#000000" stroke-width="4" fill="none">
      <polyline points="40,8 75,-60 120,-80 215,-45" />
      <polyline points="40,8 75,-60 120,-80 215,-45" stroke="#ffffff" stroke-width="2" class="anim-concrete-slurry" />
    </g>
    <line x1="410" y1="400" x2="410" y2="430" stroke="#000000" stroke-width="3.5" stroke-dasharray="4 2" />
  </g>

  <!-- C. LAND SURVEYOR & THEODOLITE -->
  <g id="surveyor-station" transform="translate(345, 475)">
    <line x1="0" y1="-18" x2="-8" y2="5" stroke="#000000" stroke-width="2" />
    <line x1="0" y1="-18" x2="8" y2="5" stroke="#000000" stroke-width="2" />
    <line x1="0" y1="-18" x2="0" y2="5" stroke="#000000" stroke-width="2" />
    <rect x="-4" y="-24" width="8" height="6" rx="1" fill="#000000" />
    <circle cx="12" cy="-22" r="3.5" fill="#000000" />
    <circle cx="12" cy="-23" r="2" fill="#ffffff" />
    <rect x="8" y="-18" width="8" height="14" rx="1" fill="#000000" />
    <line x1="10" y1="-4" x2="8" y2="5" stroke="#000000" stroke-width="2" />
    <line x1="14" y1="-4" x2="16" y2="5" stroke="#000000" stroke-width="2" />
    <line x1="0" y1="-21" x2="-25" y2="-170" stroke="#000000" stroke-width="1.2" stroke-dasharray="2 3" opacity="0.75" />
  </g>

  <!-- D. RIGGING CREW & SUPERINTENDENT -->
  <g id="ground-crew" transform="translate(480, 475)">
    <circle cx="0" cy="-20" r="3.5" fill="#000000" />
    <circle cx="0" cy="-21" r="2.2" fill="#ffffff" />
    <rect x="-4" y="-16" width="8" height="14" fill="#000000" />
    <line x1="-2" y1="-2" x2="-2" y2="5" stroke="#000000" stroke-width="2.5" />
    <line x1="2" y1="-2" x2="2" y2="5" stroke="#000000" stroke-width="2.5" />
    <rect x="4" y="-14" width="8" height="6" fill="#ffffff" stroke="#000000" stroke-width="1.2" />

    <g transform="translate(25, 0)">
      <circle cx="0" cy="-20" r="3.5" fill="#000000" />
      <circle cx="0" cy="-21" r="2.2" fill="#ffffff" />
      <rect x="-4" y="-16" width="8" height="14" fill="#27272a" />
      <line x1="-2" y1="-2" x2="-2" y2="5" stroke="#000000" stroke-width="2.5" />
      <line x1="2" y1="-2" x2="2" y2="5" stroke="#000000" stroke-width="2.5" />
      <line x1="-4" y1="-12" x2="-10" y2="-22" stroke="#000000" stroke-width="2.5" />
      <line x1="4" y1="-12" x2="10" y2="-22" stroke="#000000" stroke-width="2.5" />
    </g>
  </g>

  <!-- E. PROMINENT MOVEMENT: MOBILE CRAWLER CRANE HOISTING CARGO HIGH -->
  <g id="mobile-crawler-crane" transform="translate(710, 440)">
    <rect x="0" y="28" width="48" height="12" rx="3" fill="#000000" />
    <circle cx="7" cy="34" r="3.5" fill="#ffffff" stroke="#000000" stroke-width="1.2" />
    <circle cx="18" cy="34" r="3.5" fill="#ffffff" stroke="#000000" stroke-width="1.2" />
    <circle cx="30" cy="34" r="3.5" fill="#ffffff" stroke="#000000" stroke-width="1.2" />
    <circle cx="41" cy="34" r="3.5" fill="#ffffff" stroke="#000000" stroke-width="1.2" />
    <rect x="8" y="14" width="32" height="15" rx="2" fill="#18181b" stroke="#000000" stroke-width="2" />
    <rect x="24" y="16" width="12" height="9" fill="#ffffff" stroke="#000000" stroke-width="1" />
    <rect x="2" y="16" width="8" height="12" fill="#000000" />

    <!-- Angled Boom -->
    <line x1="32" y1="18" x2="72" y2="-45" stroke="#000000" stroke-width="3" />
    <line x1="32" y1="24" x2="72" y2="-45" stroke="#000000" stroke-width="2" />
    <path d="M 32 24 L 42 0 L 52 10 L 62 -18 L 72 -45" stroke="#000000" stroke-width="1.2" fill="none" />
    <circle cx="72" cy="-45" r="3" fill="#000000" class="anim-strobe" />

    <!-- PROMINENT MOVEMENT: Cable Hoists Cargo 38px Up and Down -->
    <g transform="translate(72, -45)">
      <g class="anim-crawler-cargo">
        <line x1="0" y1="0" x2="0" y2="42" stroke="#000000" stroke-width="1.5" />
        <rect x="-5" y="42" width="10" height="7" rx="1" fill="#000000" />
        <!-- Suspended Pipes -->
        <g transform="translate(-16, 49)">
          <circle cx="4" cy="4" r="3.5" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
          <circle cx="11" cy="4" r="3.5" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
          <circle cx="18" cy="4" r="3.5" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
          <circle cx="7.5" cy="9.5" r="3.5" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
          <circle cx="14.5" cy="9.5" r="3.5" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
        </g>
      </g>
    </g>
  </g>

  <!-- F. MATERIAL STAGING YARD -->
  <g id="material-staging" transform="translate(775, 472)">
    <rect x="0" y="-12" width="35" height="4" fill="#000000" />
    <rect x="0" y="-8" width="35" height="4" fill="#52525b" />
    <rect x="0" y="-4" width="35" height="4" fill="#000000" />
    <line x1="42" y1="-10" x2="68" y2="-10" stroke="#000000" stroke-width="2.5" />
    <line x1="42" y1="-7" x2="68" y2="-7" stroke="#000000" stroke-width="2.5" />
    <line x1="42" y1="-4" x2="68" y2="-4" stroke="#000000" stroke-width="2.5" />
  </g>

  <!-- G. GROUND FLOODLIGHT STANCHIONS -->
  <g transform="translate(270, 480)">
    <line x1="0" y1="0" x2="0" y2="-40" stroke="#000000" stroke-width="3.5" />
    <polygon points="-12,0 12,0 0,-18" fill="none" stroke="#000000" stroke-width="2" />
    <rect x="-8" y="-46" width="16" height="10" rx="2" fill="#000000" transform="rotate(32)" />
    <circle cx="3" cy="-42" r="5" fill="#000000" />
  </g>

  <g transform="translate(760, 480)">
    <line x1="0" y1="0" x2="0" y2="-40" stroke="#000000" stroke-width="3.5" />
    <polygon points="-12,0 12,0 0,-18" fill="none" stroke="#000000" stroke-width="2" />
    <rect x="-8" y="-46" width="16" height="10" rx="2" fill="#000000" transform="rotate(-32)" />
    <circle cx="-3" cy="-42" r="5" fill="#000000" />
  </g>

  <!-- ======================================================================
       12. REAL-TIME TECHNICAL HUD CARDS (Architectural Drafting Style)
       ====================================================================== -->
  <!-- Top-Left Site Command Status Card -->
  <g transform="translate(25, 20)" filter="url(#draftingShadow)">
    <rect width="275" height="105" rx="6" fill="#ffffff" stroke="#000000" stroke-width="2.5" />
    <rect width="275" height="28" rx="6" fill="#000000" />
    
    <circle cx="16" cy="14" r="4" fill="#ffffff" />
    <circle cx="16" cy="14" r="4" fill="none" stroke="#ffffff" stroke-width="1.5">
      <animate attributeName="r" values="4;13" dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0" dur="1.8s" repeatCount="indefinite" />
    </circle>
    <text x="28" y="18" fill="#ffffff" font-family="'JetBrains Mono', Courier" font-size="10" font-weight="900" letter-spacing="1">
      COMMERCIAL SITE • TOWER ALPHA
    </text>

    <g font-family="'JetBrains Mono', Courier" font-size="8.5" fill="#18181b" transform="translate(14, 46)">
      <text x="0" y="0">STRUCTURAL CORE : <tspan font-weight="900">LEVEL 34 [ACTIVE JUMP]</tspan></text>
      <text x="0" y="16">STEEL SUPERSTRUCTURE: <tspan font-weight="900">LEVEL 26 (94% RIGID)</tspan></text>
      <text x="0" y="32">CURTAIN WALL GLZ : <tspan font-weight="900">LEVEL 18 [IN PROGRESS]</tspan></text>
      <text x="0" y="48">BIM TOLERANCE COMPLIANCE: <tspan font-weight="900">±0.01mm [VERIFIED]</tspan></text>
    </g>
  </g>

  <!-- Top-Right Crane Operations and Safety Card -->
  <g transform="translate(895, 20)" filter="url(#draftingShadow)">
    <rect width="280" height="105" rx="6" fill="#ffffff" stroke="#000000" stroke-width="2.5" />
    <rect width="280" height="28" rx="6" fill="#000000" />
    
    <circle cx="16" cy="14" r="4" fill="#ffffff" />
    <circle cx="16" cy="14" r="4" fill="none" stroke="#ffffff" stroke-width="1.5">
      <animate attributeName="r" values="4;13" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <text x="28" y="18" fill="#ffffff" font-family="'JetBrains Mono', Courier" font-size="10" font-weight="900" letter-spacing="1">
      CRANE OPERATIONS &amp; SAFETY
    </text>

    <g font-family="'JetBrains Mono', Courier" font-size="8.5" fill="#18181b" transform="translate(14, 46)">
      <text x="0" y="0">CRANE-01 (HAMMERHEAD): <tspan font-weight="900">18.4t [GIRDER HOIST]</tspan></text>
      <text x="0" y="16">CRANE-02 (EAST JIB)  : <tspan font-weight="900">9.1t  [CONCRETE SKIP]</tspan></text>
      <text x="0" y="32">CRANE-03 (CORE LUFF) : <tspan font-weight="900">6.2t  [REBAR CAGE]</tspan></text>
      <text x="0" y="48">ANEMOMETER GUST      : <tspan font-weight="900">11 KNOTS [SAFE HOIST]</tspan></text>
    </g>
  </g>

  <!-- Bottom Coordinate and Telemetry Banner Strip -->
  <g transform="translate(0, 516)">
    <rect width="1200" height="24" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
    <g font-family="'JetBrains Mono', Courier" font-size="8.2" fill="#52525b" transform="translate(25, 16)">
      <text x="0" y="0">BIM MODEL: REVIT-LOD400 • SITE GPS: 40°42'46"N 74°00'21"W • TOTAL REBAR: 14,200t • CONCRETE: C60/75 • SENSORS: 642 NODES</text>
      <text x="1150" y="0" text-anchor="end" fill="#000000" font-weight="900">COMMERCIAL BUILDING SITE ACTIVE [WHITE BLUEPRINT CAD] ⚡</text>
    </g>
  </g>

  <!-- Outer Structural Framing Borders -->
  <line x1="0" y1="0" x2="1200" y2="0" stroke="#000000" stroke-width="3" />
  <line x1="0" y1="540" x2="1200" y2="540" stroke="#000000" stroke-width="3" />
  <line x1="0" y1="0" x2="0" y2="540" stroke="#000000" stroke-width="3" />
  <line x1="1200" y1="0" x2="1200" y2="540" stroke="#000000" stroke-width="3" />
</svg>`;
}

function generateAnimatedBannerSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 440" width="100%" height="100%">
  <defs>
    <!-- White Paper Background -->
    <linearGradient id="bannerWhiteBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#fafafa" />
      <stop offset="100%" stop-color="#f4f4f5" />
    </linearGradient>

    <!-- Structural Steel Grayscale Gradients -->
    <linearGradient id="bannerInkSteel" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#000000" />
      <stop offset="35%" stop-color="#27272a" />
      <stop offset="70%" stop-color="#3f3f46" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>

    <!-- Glass Curtain Wall -->
    <linearGradient id="bannerInkGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#e4e4e7" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#d4d4d8" stop-opacity="0.9" />
    </linearGradient>

    <!-- Hazard Stripes -->
    <pattern id="bannerHazardWhite" width="16" height="16" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="8" height="16" fill="#000000" />
      <rect x="8" width="8" height="16" fill="#ffffff" />
    </pattern>

    <!-- CAD Coordinate Grid on White -->
    <pattern id="bannerCadGridWhite" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#000000" stroke-width="0.6" stroke-opacity="0.05" />
    </pattern>

    <filter id="bannerShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.12" />
    </filter>

    <style>
    <![CDATA[
      /* Crane Trolley Travel (Bold 180px Sweep) */
      @keyframes bCraneTrolleyRun {
        0%, 100% { transform: translateX(0px); }
        50%      { transform: translateX(180px); }
      }
      /* Crane Hoist Lift & Pendulum Sway */
      @keyframes bHoistLiftRun {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        25%      { transform: translateY(50px) rotate(-2.5deg); }
        75%      { transform: translateY(10px) rotate(2deg); }
      }
      /* Hoist Elevator Transit (Full 230px Travel) */
      @keyframes bElevatorRun {
        0%, 10%  { transform: translateY(0px); }
        45%, 55% { transform: translateY(-230px); }
        90%, 100%{ transform: translateY(0px); }
      }
      /* Welding Arc Flashes */
      @keyframes bWeldFlash {
        0%, 100% { opacity: 0; transform: scale(0.6); }
        12%      { opacity: 1; transform: scale(1.8); }
        18%      { opacity: 0.15; transform: scale(0.8); }
        25%      { opacity: 1; transform: scale(2.0); }
        35%      { opacity: 0.2; transform: scale(0.7); }
        45%, 95% { opacity: 0; }
      }
      /* Falling Sparks */
      @keyframes bSparkCascade {
        0%   { transform: translate(0, 0) scale(1); opacity: 1; }
        100% { transform: translate(-18px, 50px) scale(0.2); opacity: 0; }
      }
      /* Laser Scanline (Bold Vertical Sweep) */
      @keyframes bLaserSweep {
        0%   { transform: translateY(0px); opacity: 0.85; }
        50%  { transform: translateY(240px); opacity: 1; }
        100% { transform: translateY(0px); opacity: 0.85; }
      }
      /* Strobe Beacon */
      @keyframes bStrobeDark {
        0%, 100% { opacity: 0.2; }
        50%      { opacity: 1; filter: drop-shadow(0 0 6px #000000); }
      }
      /* Terminal Cursor */
      @keyframes bBlinkCursor {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0; }
      }

      .b-crane-trolley { animation: bCraneTrolleyRun 11s ease-in-out infinite; }
      .b-hoist-sway { animation: bHoistLiftRun 11s ease-in-out infinite; }
      .b-elevator { animation: bElevatorRun 15s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
      .b-weld-flash { animation: bWeldFlash 4s ease-in-out infinite; transform-origin: center; }
      .b-spark { animation: bSparkCascade 1.2s ease-out infinite; }
      .b-laser { animation: bLaserSweep 7s ease-in-out infinite; }
      .b-strobe { animation: bStrobeDark 1s ease-in-out infinite; }
      .b-cursor { animation: bBlinkCursor 0.8s infinite; }
    ]]>
    </style>
  </defs>

  <!-- Clean White Background Base -->
  <rect width="1200" height="440" fill="url(#bannerWhiteBg)" />
  <rect width="1200" height="400" fill="url(#bannerCadGridWhite)" />

  <!-- ======================================================================
       BACKGROUND: EXPANSIVE COMMERCIAL CONSTRUCTION MEGA-SITE ON WHITE
       ====================================================================== -->
  <!-- Distant Background Towers (Silhouetted in subtle drafting grey) -->
  <g fill="#f4f4f5" stroke="#a1a1aa" stroke-width="1.2">
    <rect x="420" y="240" width="60" height="160" />
    <line x1="450" y1="240" x2="450" y2="200" stroke="#71717a" stroke-width="1.2" />
    <circle cx="450" cy="200" r="2" fill="#000000" class="b-strobe" />

    <rect x="520" y="210" width="80" height="190" />
    <line x1="560" y1="210" x2="560" y2="175" stroke="#71717a" stroke-width="1.2" />
    <circle cx="560" cy="175" r="2" fill="#000000" class="b-strobe" />

    <rect x="1080" y="220" width="90" height="180" />
    <line x1="1120" y1="220" x2="1120" y2="180" stroke="#71717a" stroke-width="1.2" />
    <circle cx="1120" cy="180" r="2" fill="#000000" class="b-strobe" />
  </g>

  <!-- ======================================================================
       RIGHT HALF: ACTIVE COMMERCIAL SKYSCRAPER & CRANE CONSTRUCTION SITE
       ====================================================================== -->
  <!-- Secondary Wing (x=980 to 1120) -->
  <rect x="980" y="150" width="140" height="250" fill="#fafafa" stroke="#000000" stroke-width="2" />
  <g fill="url(#bannerInkGlass)" stroke="#000000" stroke-width="1">
    <rect x="990" y="170" width="120" height="10" />
    <rect x="990" y="190" width="120" height="10" />
    <rect x="990" y="210" width="120" height="10" />
    <rect x="990" y="230" width="120" height="10" />
    <rect x="990" y="250" width="120" height="10" />
    <rect x="990" y="270" width="120" height="10" />
    <rect x="990" y="290" width="120" height="10" />
    <rect x="990" y="310" width="120" height="10" />
    <rect x="990" y="330" width="120" height="10" />
    <rect x="990" y="350" width="120" height="10" />
    <rect x="990" y="370" width="120" height="10" />
  </g>
  <circle cx="985" cy="148" r="3" fill="#000000" class="b-strobe" />
  <circle cx="1115" cy="148" r="3" fill="#000000" class="b-strobe" />

  <!-- Main Central Skyscraper Tower (x=730 to x=960) -->
  <rect x="730" y="50" width="230" height="350" fill="#ffffff" stroke="#000000" stroke-width="2.5" />
  <!-- Concrete Core Top Formwork -->
  <rect x="815" y="35" width="60" height="16" fill="#000000" />
  <text x="845" y="46" fill="#ffffff" font-family="'JetBrains Mono', Courier" font-size="6.5" font-weight="900" text-anchor="middle">CORE L-32</text>
  <line x1="845" y1="35" x2="845" y2="20" stroke="#000000" stroke-width="2" />
  <circle cx="845" cy="18" r="3.5" fill="#000000" class="b-strobe" />

  <!-- Structural Steel Skeleton (Floors 16 - 30: y=50 to y=230) -->
  <g stroke="url(#bannerInkSteel)" stroke-width="2" fill="none">
    <!-- Columns -->
    <line x1="745" y1="50" x2="745" y2="240" stroke="#000000" stroke-width="3" />
    <line x1="790" y1="50" x2="790" y2="240" stroke="#000000" stroke-width="2.2" />
    <line x1="845" y1="50" x2="845" y2="240" stroke="#000000" stroke-width="3" />
    <line x1="900" y1="50" x2="900" y2="240" stroke="#000000" stroke-width="2.2" />
    <line x1="945" y1="50" x2="945" y2="240" stroke="#000000" stroke-width="3" />
    <!-- Girders -->
    <line x1="730" y1="70" x2="960" y2="70" stroke="#000000" stroke-width="2.2" />
    <line x1="730" y1="90" x2="960" y2="90" stroke="#27272a" stroke-width="1.8" />
    <line x1="730" y1="110" x2="960" y2="110" stroke="#27272a" stroke-width="1.8" />
    <line x1="730" y1="130" x2="960" y2="130" stroke="#000000" stroke-width="2.5" />
    <line x1="730" y1="150" x2="960" y2="150" stroke="#27272a" stroke-width="1.8" />
    <line x1="730" y1="170" x2="960" y2="170" stroke="#27272a" stroke-width="1.8" />
    <line x1="730" y1="190" x2="960" y2="190" stroke="#000000" stroke-width="2.5" />
    <line x1="730" y1="210" x2="960" y2="210" stroke="#27272a" stroke-width="1.8" />
    <line x1="730" y1="230" x2="960" y2="230" stroke="#000000" stroke-width="2.5" />
    <!-- Diagonal Braces -->
    <path d="M 745 70 L 790 90 M 790 70 L 745 90
             M 790 70 L 845 90 M 845 70 L 790 90
             M 845 70 L 900 90 M 900 70 L 845 90
             M 900 70 L 945 90 M 945 70 L 900 90
             M 745 130 L 845 170 M 845 130 L 745 170
             M 845 130 L 945 170 M 945 130 L 845 170
             M 745 190 L 845 230 M 845 190 L 745 230
             M 845 190 L 945 230 M 945 190 L 845 230" stroke="#3f3f46" stroke-width="1.8" />
  </g>

  <!-- Lower Curtain Wall Facade (Floors 1 - 10: y=240 to y=400) -->
  <g fill="url(#bannerInkGlass)" stroke="#000000" stroke-width="1.2">
    <rect x="735" y="240" width="220" height="15" />
    <rect x="735" y="260" width="220" height="15" />
    <rect x="735" y="280" width="220" height="15" />
    <rect x="735" y="300" width="220" height="15" />
    <rect x="735" y="320" width="220" height="15" />
    <rect x="735" y="340" width="220" height="15" />
    <rect x="735" y="360" width="220" height="15" />
    <rect x="735" y="380" width="220" height="18" />
  </g>

  <!-- Climbing Hoist Mast and Cage (At x=965) -->
  <line x1="964" y1="80" x2="964" y2="400" stroke="#000000" stroke-width="2.5" />
  <line x1="976" y1="80" x2="976" y2="400" stroke="#000000" stroke-width="2.5" />
  <path d="M 964 90 L 976 90 M 964 110 L 976 110 M 964 130 L 976 130 M 964 150 L 976 150 M 964 170 L 976 170 M 964 190 L 976 190 M 964 210 L 976 210 M 964 230 L 976 230 M 964 250 L 976 250 M 964 270 L 976 270 M 964 290 L 976 290 M 964 310 L 976 310 M 964 330 L 976 330 M 964 350 L 976 350 M 964 370 L 976 370 M 964 390 L 976 390" stroke="#000000" stroke-width="1.2" />
  
  <!-- PROMINENT MOVEMENT: Climbing Hoist Traveling 230px Vertical Distance -->
  <g transform="translate(0, 360)" class="b-elevator">
    <rect x="962" y="0" width="18" height="26" rx="2" fill="#ffffff" stroke="#000000" stroke-width="2" />
    <rect x="964" y="3" width="14" height="10" fill="#e4e4e7" stroke="#000000" stroke-width="1" stroke-dasharray="2 2" />
    <rect x="962" y="19" width="18" height="7" fill="url(#bannerHazardWhite)" />
    <circle cx="971" cy="-2" r="2.5" fill="#000000" class="b-strobe" />
  </g>

  <!-- PROMINENT MOVEMENT: Primary Tower Crane (Mast at x=695) -->
  <g id="banner-crane">
    <line x1="688" y1="20" x2="688" y2="400" stroke="#000000" stroke-width="3.5" />
    <line x1="704" y1="20" x2="704" y2="400" stroke="#000000" stroke-width="3.5" />
    <path d="M 688 20 L 704 36 M 704 20 L 688 36
             M 688 36 L 704 52 M 704 36 L 688 52
             M 688 52 L 704 68 M 704 52 L 688 68
             M 688 68 L 704 84 M 704 68 L 688 84
             M 688 84 L 704 100 M 704 84 L 688 100
             M 688 100 L 704 120 M 704 100 L 688 120
             M 688 120 L 704 140 M 704 120 L 688 140
             M 688 140 L 704 160 M 704 140 L 688 160
             M 688 160 L 704 180 M 704 160 L 688 180
             M 688 180 L 704 200 M 704 180 L 688 200
             M 688 200 L 704 220 M 704 200 L 688 220
             M 688 220 L 704 240 M 704 220 L 688 240
             M 688 240 L 704 260 M 704 240 L 688 260
             M 688 260 L 704 280 M 704 260 L 688 280
             M 688 280 L 704 300 M 704 280 L 688 300
             M 688 300 L 704 320 M 704 300 L 688 320
             M 688 320 L 704 340 M 704 320 L 688 340
             M 688 340 L 704 360 M 704 340 L 688 360
             M 688 360 L 704 380 M 704 360 L 688 380
             M 688 380 L 704 400 M 704 380 L 688 400" stroke="#3f3f46" stroke-width="1.8" />

    <line x1="704" y1="130" x2="730" y2="130" stroke="#000000" stroke-width="3" />
    <line x1="704" y1="230" x2="730" y2="230" stroke="#000000" stroke-width="3" />

    <rect x="682" y="14" width="28" height="6" fill="#000000" />
    <rect x="700" y="10" width="16" height="14" rx="2" fill="#18181b" stroke="#000000" stroke-width="1.8" />
    <rect x="704" y="12" width="10" height="9" fill="#ffffff" stroke="#000000" stroke-width="1" />

    <polygon points="688,14 704,14 696,-2" fill="#000000" stroke="#000000" stroke-width="2.5" />
    <circle cx="696" cy="-3" r="4" fill="#000000" class="b-strobe" />

    <!-- Jib Arm -->
    <line x1="696" y1="12" x2="1020" y2="12" stroke="#000000" stroke-width="3.5" />
    <line x1="696" y1="2" x2="1010" y2="12" stroke="#000000" stroke-width="2" />
    <line x1="696" y1="12" x2="615" y2="12" stroke="#000000" stroke-width="3.5" />
    <rect x="620" y="6" width="25" height="16" rx="2" fill="#27272a" stroke="#000000" stroke-width="2" />
    <line x1="696" y1="-2" x2="625" y2="8" stroke="#000000" stroke-width="2" />
    <line x1="696" y1="-2" x2="850" y2="9" stroke="#000000" stroke-width="2.2" />
    <path d="M 696 12 L 720 3 L 744 12 L 768 4 L 792 12 L 816 5 L 840 12 L 864 6 L 888 12 L 912 7 L 936 12 L 960 8 L 984 12" stroke="#3f3f46" stroke-width="1.5" />
    <circle cx="1020" cy="12" r="3.5" fill="#000000" class="b-strobe" />

    <!-- PROMINENT MOVEMENT: 180px Trolley Run + 50px Hoist Lift -->
    <g transform="translate(730, 0)">
      <g class="b-crane-trolley">
        <rect x="-10" y="10" width="20" height="7" rx="1.5" fill="#000000" />
        <g class="b-hoist-sway">
          <line x1="-5" y1="17" x2="-4" y2="95" stroke="#000000" stroke-width="1.8" />
          <line x1="5" y1="17" x2="4" y2="95" stroke="#000000" stroke-width="1.8" />
          <rect x="-7" y="95" width="14" height="10" rx="1.5" fill="#18181b" stroke="#000000" stroke-width="1.8" />
          <path d="M 0 105 C -4 107 -4 112 0 114 C 4 115 5 111 2 108" fill="none" stroke="#000000" stroke-width="3" />
          <line x1="0" y1="114" x2="-45" y2="135" stroke="#000000" stroke-width="1.5" />
          <line x1="0" y1="114" x2="45" y2="135" stroke="#000000" stroke-width="1.5" />
          <g transform="translate(0, 137)">
            <rect x="-50" y="-4" width="100" height="4" rx="1" fill="#000000" />
            <rect x="-46" y="0" width="92" height="5" fill="#27272a" />
            <rect x="-50" y="5" width="100" height="4" rx="1" fill="#000000" />
            <text x="0" y="4" fill="#ffffff" font-family="'JetBrains Mono', Courier" font-size="5.5" font-weight="900" text-anchor="middle">SWL 20T • W24x104</text>
          </g>
        </g>
      </g>
    </g>
  </g>

  <!-- Welding Station at (790, 130) -->
  <g transform="translate(790, 130)">
    <circle cx="0" cy="0" r="14" fill="#000000" opacity="0.3" class="b-weld-flash" />
    <circle cx="0" cy="0" r="5" fill="#000000" class="b-weld-flash" />
    <circle cx="-2" cy="0" r="2" fill="#000000" class="b-spark" />
    <circle cx="2" cy="0" r="1.8" fill="#000000" class="b-spark" style="animation-delay: 0.3s;" />
    <circle cx="10" cy="-6" r="3.2" fill="#000000" />
    <rect x="7" y="-2" width="7" height="11" rx="1" fill="#000000" />
  </g>

  <!-- Laser Elevation Scanner Beam Sweeping Up/Down -->
  <g class="b-laser" transform="translate(0, 110)">
    <line x1="710" y1="0" x2="980" y2="0" stroke="#000000" stroke-width="2" />
    <rect x="984" y="-8" width="70" height="16" rx="2" fill="#000000" />
    <text x="1019" y="3" fill="#ffffff" font-family="'JetBrains Mono', Courier" font-size="7" font-weight="900" text-anchor="middle">DATUM ±0.01mm</text>
  </g>

  <!-- Ground Grade Construction Strip & Machinery -->
  <rect x="600" y="400" width="600" height="40" fill="#f4f4f5" stroke="#000000" stroke-width="2" />
  <rect x="600" y="396" width="600" height="6" fill="url(#bannerHazardWhite)" />
  <!-- Concrete Pump Truck Silhouette at Grade -->
  <g transform="translate(620, 375)">
    <rect x="0" y="8" width="55" height="18" rx="2" fill="#000000" />
    <rect x="38" y="10" width="14" height="9" fill="#ffffff" stroke="#000000" stroke-width="1" />
    <circle cx="12" cy="26" r="5" fill="#000000" />
    <circle cx="12" cy="26" r="2" fill="#ffffff" />
    <circle cx="26" cy="26" r="5" fill="#000000" />
    <circle cx="26" cy="26" r="2" fill="#ffffff" />
    <circle cx="44" cy="26" r="5" fill="#000000" />
    <circle cx="44" cy="26" r="2" fill="#ffffff" />
    <polyline points="30,6 60,-35 95,-45 130,-15" fill="none" stroke="#000000" stroke-width="3" />
  </g>

  <!-- ======================================================================
       LEFT HALF: TERMINAL & AI SWARM HUD (White Blueprint Aesthetic)
       ====================================================================== -->
  <g transform="translate(40, 30)" filter="url(#bannerShadow)">
    <rect width="530" height="340" rx="10" fill="#ffffff" stroke="#000000" stroke-width="2.5" />
    <rect width="530" height="34" rx="10" fill="#000000" />
    <circle cx="22" cy="17" r="5.5" fill="#ffffff" />
    <circle cx="38" cy="17" r="5.5" fill="#a1a1aa" />
    <circle cx="54" cy="17" r="5.5" fill="#52525b" />
    <text x="265" y="22" fill="#ffffff" font-family="'JetBrains Mono', Courier, monospace" font-size="11.5" font-weight="900" text-anchor="middle" letter-spacing="1">
      SWARM SITE RUNBOOK • 115 SKILLS ACTIVE
    </text>

    <!-- Terminal Lines -->
    <g font-family="'JetBrains Mono', Courier, monospace" font-size="11" fill="#18181b" transform="translate(25, 62)">
      <text x="0" y="0"><tspan fill="#71717a">$</tspan> <tspan fill="#000000" font-weight="900">antigravity</tspan> swarm --site "Tower Alpha" --discipline all</text>
      <text x="0" y="24" fill="#52525b">[00:00:01] <tspan fill="#000000" font-weight="800">FOUNDATION</tspan>  : Storage engines &amp; Raft consensus [L-00]</text>
      <text x="0" y="48" fill="#52525b">[00:00:02] <tspan fill="#000000" font-weight="800">SUPERSTRUCTURE</tspan>: 115 production runbooks compiled [L-26]</text>
      <text x="0" y="72" fill="#52525b">[00:00:03] <tspan fill="#000000" font-weight="800">CRANE HOIST</tspan>   : CI/CD Fastlane &amp; Turborepo DAG [L-34]</text>
      <text x="0" y="96" fill="#52525b">[00:00:04] <tspan fill="#000000" font-weight="800">CLADDING</tspan>      : Design tokens, RSC streaming &amp; tRPC</text>
      <text x="0" y="120" fill="#52525b">[00:00:05] <tspan fill="#000000" font-weight="800">SAFETY/QA</tspan>     : Zero slop, zero mutants, 100% contracts</text>
      <text x="0" y="144" fill="#52525b">[00:00:06] <tspan fill="#000000" font-weight="800">TOKEN DIET</tspan>    : KV prompt cache active (89% saved)</text>

      <text x="0" y="176">
        <tspan fill="#71717a">$</tspan> <tspan fill="#000000" font-weight="800">status: all 22 tracks operational</tspan>
        <tspan class="b-cursor" fill="#000000" font-weight="900"> █</tspan>
      </text>
    </g>

    <!-- Bottom Metrics Badges -->
    <g transform="translate(25, 275)">
      <rect x="0" y="0" width="110" height="26" rx="4" fill="#000000" />
      <text x="55" y="17" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="800" text-anchor="middle">115 SKILLS</text>

      <rect x="122" y="0" width="110" height="26" rx="4" fill="#000000" />
      <text x="177" y="17" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="800" text-anchor="middle">22 TRACKS</text>

      <rect x="244" y="0" width="110" height="26" rx="4" fill="#000000" />
      <text x="299" y="17" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="800" text-anchor="middle">BIM LOD-400</text>

      <rect x="366" y="0" width="110" height="26" rx="4" fill="#000000" />
      <text x="421" y="17" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="800" text-anchor="middle">ZERO ACCIDENT</text>
    </g>
  </g>

  <!-- Bottom Coordinates Banner Strip -->
  <g transform="translate(0, 418)">
    <rect width="1200" height="22" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
    <g font-family="'JetBrains Mono', Courier" font-size="8.5" fill="#52525b" transform="translate(30, 15)">
      <text x="0" y="0">ARCHITECTURAL WHITE DRAFTING BLUEPRINT • BIM ARCHITECTURE • 115 SKILLS IN SWARM COLLABORATION</text>
      <text x="1140" y="0" text-anchor="end" fill="#000000" font-weight="900">SYSTEM: ONLINE ⚡</text>
    </g>
  </g>

  <!-- Framing Accents -->
  <line x1="0" y1="0" x2="1200" y2="0" stroke="#000000" stroke-width="2.5" />
  <line x1="0" y1="440" x2="1200" y2="440" stroke="#000000" stroke-width="2.5" />
  <line x1="0" y1="0" x2="0" y2="440" stroke="#000000" stroke-width="2.5" />
  <line x1="1200" y1="0" x2="1200" y2="440" stroke="#000000" stroke-width="2.5" />
</svg>`;
}

// Generate the files
const buildingSiteSvg = generateCommercialBuildingSiteSVG();
const animatedBannerSvg = generateAnimatedBannerSVG();

const paths = [
  { file: path.join(__dirname, '../assets/commercial-building-site.svg'), content: buildingSiteSvg },
  { file: path.join(__dirname, '../docs/assets/commercial-building-site.svg'), content: buildingSiteSvg },
  { file: path.join(__dirname, '../assets/animated-banner.svg'), content: animatedBannerSvg },
  { file: path.join(__dirname, '../docs/assets/animated-banner.svg'), content: animatedBannerSvg },
];

paths.forEach(({ file, content }) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Generated: ${file} (${Buffer.byteLength(content, 'utf8')} bytes)`);
});
