const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'README.md');
let text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// 1. Badges
text = text.replace(/110%20Verified/g, '115%20Verified');
text = text.replace(/21%20Specialized/g, '22%20Specialized');

// 2. Header description
text = text.replace(
  /suite of \*\*110 AI Agent Skills\*\* modeling an \*\*entire modern technology organization\*\*, \*\*Super Expert Full-Stack Developer\*\*, \*\*Principal Cybersecurity & Threat Defense Architect\*\*, \*\*Mobile & Multi-Platform Application Engineer\*\*, \*\*Software Design Authority \(SDA\)\*\*, \*\*Professional QA & SDET Test Architect\*\*, \*\*Principal Anti-Slop Code Simplifier\*\*, and \*\*AI Agent Token Optimization & Context Economics Specialist\*\*/,
  'suite of **115 AI Agent Skills** modeling an **entire modern technology organization**, **Super Expert Full-Stack Developer**, **Principal Cybersecurity & Threat Defense Architect**, **Mobile & Multi-Platform Application Engineer**, **Software Design Authority (SDA)**, **Professional QA & SDET Test Architect**, **Principal Anti-Slop Code Simplifier**, **AI Agent Token Optimization & Context Economics Specialist**, and **Architectural Vector Graphics & SVG Motion Specialist**'
);

// Add Track V to the introductory summary paragraph
text = text.replace(
  /and token budget governance\)\./,
  'and token budget governance), and pure CSS vector motion engineering (pendulum kinematics, CAD/BIM architectural drafting, monochrome noir high-contrast design, vector particle simulation, and parametric SVG optimization).'
);

// 3. Lifecycle map update
const oldLifecycleEnd = `        S109 --> S110["110: Token Budgeting & Cost Telemetry"]
    end

    S80 & S90 & S100 & S110 & S22 -.->|Continuous Feedback Loop| S27`;

const newLifecycleEnd = `        S109 --> S110["110: Token Budgeting & Cost Telemetry"]
    end

    subgraph S16["16. Architectural Vector Motion & CAD/BIM Graphics"]
        S110 --> S111["111: SVG Motion & CSS Vector Physics"]
        S111 --> S112["112: Architectural CAD/BIM Drafting"]
        S112 --> S113["113: Monochrome Noir & High-Contrast Design"]
        S113 --> S114["114: Vector Particle Emitters & Volumetric Light"]
        S114 --> S115["115: Parametric SVG Generation & Optimization"]
    end

    S80 & S90 & S100 & S110 & S115 & S22 -.->|Continuous Feedback Loop| S27`;

text = text.replace(oldLifecycleEnd, newLifecycleEnd);

// 4. Tracks table
text = text.replace(/The 110 skills are organized into 21 distinct professional disciplines:/, 'The 115 skills are organized into 22 distinct professional disciplines:');
text = text.replace(/## 🏛️ The 21 Functional Organizational Tracks/, '## 🏛️ The 22 Functional Organizational Tracks');

const trackUTableRow = `| **Track U** | AI Agent Token Optimization, Context Compression & Token Economics | \`101\`, \`102\`, \`103\`, \`104\`, \`105\`, \`106\`, \`107\`, \`108\`, \`109\`, \`110\` |`;
const trackVTableRow = `| **Track U** | AI Agent Token Optimization, Context Compression & Token Economics | \`101\`, \`102\`, \`103\`, \`104\`, \`105\`, \`106\`, \`107\`, \`108\`, \`109\`, \`110\` |
| **Track V** | Architectural SVG Animation, CAD/BIM Motion Systems & Technical Vector Graphics | \`111\`, \`112\`, \`113\`, \`114\`, \`115\` |`;

text = text.replace(trackUTableRow, trackVTableRow);

// 5. Master skills catalog table (115 skills)
text = text.replace(/## 📚 Master Skills Directory & Catalog \(110 Skills\)/, '## 📚 Master Skills Directory & Catalog (115 Skills)');

const skill110Row = `| \`110\` | [\`110-agent-token-budgeting-and-cost-telemetry\`](file:///d:/Exploring%20new%20ideas/All%20AI%20skills/skills/110-agent-token-budgeting-and-cost-telemetry/SKILL.md) | Token Optimization | **Token Governance Architect**: Hard token/spend ceilings per task, loop circuit breakers, OpenTelemetry GenAI telemetry, spend attribution. | Budget Governors, Loop Circuit Breakers |`;

const newSkillsRows = `${skill110Row}
| \`111\` | [\`111-svg-motion-engineering-and-css-vector-physics\`](file:///d:/Exploring%20new%20ideas/All%20AI%20skills/skills/111-svg-motion-engineering-and-css-vector-physics/SKILL.md) | Vector Motion & CAD | **SVG Motion Specialist**: Pure CSS vector motion, pendulum sway, cable tension, traveling trolleys, co-prime loop sync, GPU 60 FPS performance. | Kinematic Vector Engines, Pendulum Keyframes |
| \`112\` | [\`112-architectural-cad-bim-technical-drafting-and-vector-modeling\`](file:///d:/Exploring%20new%20ideas/All%20AI%20skills/skills/112-architectural-cad-bim-technical-drafting-and-vector-modeling/SKILL.md) | Vector Motion & CAD | **BIM Systems Modeler**: High-rise structural steel detailing (I-beams, K-bracing), slipforms, curtain walls, tower cranes, construction hoists, LOD-400 HUDs. | Structural CAD Blueprints, Heavy Plant Schematics |
| \`113\` | [\`113-monochrome-noir-visual-design-and-high-contrast-systems\`](file:///d:/Exploring%20new%20ideas/All%20AI%20skills/skills/113-monochrome-noir-visual-design-and-high-contrast-systems/SKILL.md) | Vector Motion & CAD | **High-Contrast Visual Architect**: 5-zone grayscale tonal hierarchy, obsidian blacks, stark white luminances, hazard chevrons, silhouette depth. | Monochrome Design Systems, Contrast Matrices |
| \`114\` | [\`114-vector-particle-emitters-and-volumetric-lighting-effects\`](file:///d:/Exploring%20new%20ideas/All%20AI%20skills/skills/114-vector-particle-emitters-and-volumetric-lighting-effects/SKILL.md) | Vector Motion & CAD | **Vector Particle Specialist**: Electric arc welding flares, gravity-accelerated spark streams, volumetric floodlight cones, sweeping laser leveling scans. | CSS Particle Generators, Atmospheric Shaders |
| \`115\` | [\`115-parametric-svg-generation-and-asset-optimization\`](file:///d:/Exploring%20new%20ideas/All%20AI%20skills/skills/115-parametric-svg-generation-and-asset-optimization/SKILL.md) | Vector Motion & CAD | **SVG Asset Engineer**: Parametric truss generation (Node/Python), CDATA shielding, entity escaping (&amp;), GitHub Camo compliance, sub-60KB payloads. | Parametric Vector Builders, XML CI Test Suites |`;

text = text.replace(skill110Row, newSkillsRows);

// 6. Installation script references
text = text.replace(/Copy all 110 skills to a target project:/g, 'Copy all 115 skills to a target project:');
text = text.replace(/# Copy all 110 skills:/g, '# Copy all 115 skills:');
text = text.replace(/across all 110 skills\./g, 'across all 115 skills.');

// 7. Prompt Examples for Track V
const prompt110 = `\`\`\`text
"Enforce task-level financial guardrails using agent-token-budgeting-and-cost-telemetry to stop runaway tool loops and export OpenTelemetry GenAI spend metrics."
\`\`\``;

const prompt115 = `${prompt110}

\`\`\`text
"Architect a 60 FPS pure CSS vector animation using svg-motion-engineering-and-css-vector-physics to simulate crane hoist trolley travel and pendulum cable sway with co-prime loop timing."
\`\`\`
\`\`\`text
"Draft a technical high-rise structural schematic using architectural-cad-bim-technical-drafting-and-vector-modeling with exposed columns, K-bracing, climbing hoists, and LOD-400 telemetry."
\`\`\`
\`\`\`text
"Design an architectural black-and-white visual system using monochrome-noir-visual-design-and-high-contrast-systems featuring obsidian night skies, volumetric floodlight cones, and stark white highlights."
\`\`\`
\`\`\`text
"Simulate electric arc welding flashes and falling molten sparks using vector-particle-emitters-and-volumetric-lighting-effects entirely via CSS keyframes and multi-stage Gaussian bloom filters."
\`\`\`
\`\`\`text
"Build an automated parametric vector pipeline using parametric-svg-generation-and-asset-optimization with strict CDATA shielding, entity validation, and sub-60KB payload budgeting for GitHub README display."
\`\`\``;

text = text.replace(prompt110, prompt115);

fs.writeFileSync(file, text, 'utf8');
console.log('Successfully updated README.md to 115 skills and 22 tracks');
