const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'skills.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.version = '12.0.0';
data.description = 'Comprehensive suite of 115 production AI agent skills modeling an entire technology organization, Super Expert Full-Stack Developer, Principal Cybersecurity Architect, Mobile Application Engineer, Software Design Authority (SDA), Professional QA/SDET Test Architect, Principal Anti-Slop Code Simplifier, AI Agent Token Optimization Specialist, and Architectural Vector Graphics & SVG Motion Specialist: spanning executive strategy, UXR, full-stack type safety, microservices, mobile, zero-trust security, ISTQB testing, anti-slop code de-bloating, KV-cache prompt caching, AST repository mapping, tool distillation, trajectory compaction, frugal model cascades, compact tool schemas, scoped diff context, semantic hybrid RAG, attention hygiene, GenAI cost governance, pure CSS vector motion physics, CAD/BIM technical drafting, monochrome noir high-contrast design, vector particle simulation, and parametric SVG optimization.';

// Track V: Architectural SVG Animation, CAD/BIM Motion Systems & Technical Vector Graphics
const trackV = {
  id: 'track-architectural-svg-and-motion-graphics',
  name: 'Track V: Architectural SVG Animation, CAD/BIM Motion Systems & Technical Vector Graphics',
  skills: [
    '111-svg-motion-engineering-and-css-vector-physics',
    '112-architectural-cad-bim-technical-drafting-and-vector-modeling',
    '113-monochrome-noir-visual-design-and-high-contrast-systems',
    '114-vector-particle-emitters-and-volumetric-lighting-effects',
    '115-parametric-svg-generation-and-asset-optimization'
  ]
};

const existingTrackIdx = data.tracks.findIndex(t => t.id === trackV.id);
if (existingTrackIdx >= 0) {
  data.tracks[existingTrackIdx] = trackV;
} else {
  data.tracks.push(trackV);
}

const newSkills = [
  {
    id: '111-svg-motion-engineering-and-css-vector-physics',
    name: 'svg-motion-engineering-and-css-vector-physics',
    path: 'skills/111-svg-motion-engineering-and-css-vector-physics/SKILL.md',
    category: 'Architectural SVG & Motion Graphics',
    summary: 'Pure CSS vector motion engineering in SVG, kinematics simulation (pendulum sway, harmonic oscillation, cable tension, traveling trolleys), co-prime loop synchronization, GPU-composited 60 FPS performance, and zero-JS GitHub markdown compatibility.'
  },
  {
    id: '112-architectural-cad-bim-technical-drafting-and-vector-modeling',
    name: 'architectural-cad-bim-technical-drafting-and-vector-modeling',
    path: 'skills/112-architectural-cad-bim-technical-drafting-and-vector-modeling/SKILL.md',
    category: 'Architectural SVG & Motion Graphics',
    summary: 'Translating structural engineering and architectural BIM schematics into technical SVG vector diagrams: steel superstructures (I-beams, moment connections, cross-braces), core slipforms, curtain walls, tower cranes, construction hoists, and LOD-400 HUD telemetry.'
  },
  {
    id: '113-monochrome-noir-visual-design-and-high-contrast-systems',
    name: 'monochrome-noir-visual-design-and-high-contrast-systems',
    path: 'skills/113-monochrome-noir-visual-design-and-high-contrast-systems/SKILL.md',
    category: 'Architectural SVG & Motion Graphics',
    summary: 'Design high-contrast architectural monochrome (black and white) vector graphics, tonal grayscale hierarchy, silhouette readability, volumetric floodlight cones, pattern fills (hazard chevrons, CAD grids), and stark visual depth.'
  },
  {
    id: '114-vector-particle-emitters-and-volumetric-lighting-effects',
    name: 'vector-particle-emitters-and-volumetric-lighting-effects',
    path: 'skills/114-vector-particle-emitters-and-volumetric-lighting-effects/SKILL.md',
    category: 'Architectural SVG & Motion Graphics',
    summary: 'Engineer pure SVG/CSS particle simulation systems and volumetric lighting: high-frequency electric arc welding flares, gravity-accelerated falling spark streams, volumetric light stanchions, and glowing laser datum scanlines without JS.'
  },
  {
    id: '115-parametric-svg-generation-and-asset-optimization',
    name: 'parametric-svg-generation-and-asset-optimization',
    path: 'skills/115-parametric-svg-generation-and-asset-optimization/SKILL.md',
    category: 'Architectural SVG & Motion Graphics',
    summary: 'Procedural and programmatic SVG generation with Node.js/Python, strict XML entity and CDATA validation, security sanitization for GitHub markdown/Camo proxy compatibility, and payload budget optimization (<60KB).'
  }
];

for (const skill of newSkills) {
  const existingIdx = data.skills.findIndex(s => s.id === skill.id);
  if (existingIdx >= 0) {
    data.skills[existingIdx] = skill;
  } else {
    data.skills.push(skill);
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
console.log(`Successfully updated skills.json: ${data.tracks.length} tracks, ${data.skills.length} skills`);

// Also update docs/skills-data.js
const docsDataPath = path.join(__dirname, '..', 'docs', 'skills-data.js');
const jsContent = 'window.SKILLS_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync(docsDataPath, jsContent);
console.log('Successfully updated docs/skills-data.js');
