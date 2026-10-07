const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'skills.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.version = '9.0.0';
data.description = 'Comprehensive suite of 90 production AI agent skills modeling an entire technology organization, Super Expert Full-Stack Developer, Principal Cybersecurity Architect, Mobile Application Engineer, Software Design Authority (SDA), and Professional QA/SDET Test Architect: spanning executive strategy, OOAD & GRASP, ATAM architecture evaluation, ISTQB test planning, BDD Gherkin, Pact contract testing, visual regression & WCAG 2.2 accessibility, mutation testing, Maestro mobile QA, and exploratory session-based testing.';

// Add Track R: Software Design & Architecture (SDA) & System Design Authority
const trackR = {
  id: 'track-software-design-and-architecture',
  name: 'Track R: Software Design & Architecture (SDA) & System Design Authority',
  skills: [
    '81-software-design-and-architecture-ooad-grasp',
    '82-architecture-evaluation-and-atam',
    '83-architectural-styles-and-component-governance'
  ]
};

// Add Track S: Professional Software Testing, QA & SDET Excellence
const trackS = {
  id: 'track-testing-qa-and-sdet',
  name: 'Track S: Professional Software Testing, QA & SDET Excellence',
  skills: [
    '84-test-planning-and-istqb-test-design-techniques',
    '85-bdd-acceptance-testing-and-cucumber-gherkin',
    '86-api-contract-and-service-virtualization-testing',
    '87-visual-regression-and-accessibility-testing',
    '88-mutation-testing-and-test-suite-resilience',
    '89-mobile-test-automation-appium-maestro',
    '90-exploratory-testing-and-session-based-test-management'
  ]
};

[trackR, trackS].forEach(track => {
  const existingIdx = data.tracks.findIndex(t => t.id === track.id);
  if (existingIdx >= 0) {
    data.tracks[existingIdx] = track;
  } else {
    data.tracks.push(track);
  }
});

const newSkills = [
  {
    id: '81-software-design-and-architecture-ooad-grasp',
    name: 'software-design-and-architecture-ooad-grasp',
    path: 'skills/81-software-design-and-architecture-ooad-grasp/SKILL.md',
    category: 'Software Design & Architecture (SDA)',
    summary: "Object-Oriented Analysis & Design (OOAD), Craig Larman's GRASP patterns, UML 2.5 structural/behavioral diagrams, and package coupling metrics (Afferent/Efferent coupling, Instability, Abstractness)."
  },
  {
    id: '82-architecture-evaluation-and-atam',
    name: 'architecture-evaluation-and-atam',
    path: 'skills/82-architecture-evaluation-and-atam/SKILL.md',
    category: 'Software Design & Architecture (SDA)',
    summary: 'Architecture evaluation using the SEI Architecture Tradeoff Analysis Method (ATAM), Quality Attribute Workshops (QAW), Utility Trees, sensitivity points, and tradeoff analysis.'
  },
  {
    id: '83-architectural-styles-and-component-governance',
    name: 'architectural-styles-and-component-governance',
    path: 'skills/83-architectural-styles-and-component-governance/SKILL.md',
    category: 'Software Design & Architecture (SDA)',
    summary: 'Architectural styles evaluation (Pipes-and-Filters, Blackboard, Space-Based, Plugin/Microkernel), Architecture Review Board (ARB) governance, and automated Architecture Fitness Functions in CI.'
  },
  {
    id: '84-test-planning-and-istqb-test-design-techniques',
    name: 'test-planning-and-istqb-test-design-techniques',
    path: 'skills/84-test-planning-and-istqb-test-design-techniques/SKILL.md',
    category: 'Quality Engineering & Testing',
    summary: 'Master test planning (IEEE 829 / ISO 29119), ISTQB black-box test design techniques (Equivalence Partitioning, Boundary Value Analysis, Decision Tables), Traceability Matrices, and defect lifecycle management.'
  },
  {
    id: '85-bdd-acceptance-testing-and-cucumber-gherkin',
    name: 'bdd-acceptance-testing-and-cucumber-gherkin',
    path: 'skills/85-bdd-acceptance-testing-and-cucumber-gherkin/SKILL.md',
    category: 'Quality Engineering & Testing',
    summary: 'Behavior-Driven Development (BDD), Specification by Example, Cucumber and Gherkin feature files, step definitions, Scenario Outlines, Data Tables, and Three Amigos collaboration.'
  },
  {
    id: '86-api-contract-and-service-virtualization-testing',
    name: 'api-contract-and-service-virtualization-testing',
    path: 'skills/86-api-contract-and-service-virtualization-testing/SKILL.md',
    category: 'Quality Engineering & Testing',
    summary: 'Automated API test suites, Consumer-Driven Contract Testing with Pact, Service Virtualization with WireMock, JSON Schema validation, negative boundary testing, and idempotency verification.'
  },
  {
    id: '87-visual-regression-and-accessibility-testing',
    name: 'visual-regression-and-accessibility-testing',
    path: 'skills/87-visual-regression-and-accessibility-testing/SKILL.md',
    category: 'Quality Engineering & Testing',
    summary: 'Pixel-perfect visual regression testing with Playwright and Percy, viewport matrix diffing, and automated WCAG 2.1/2.2 AA & AAA digital accessibility testing using axe-core and Pa11y.'
  },
  {
    id: '88-mutation-testing-and-test-suite-resilience',
    name: 'mutation-testing-and-test-suite-resilience',
    path: 'skills/88-mutation-testing-and-test-suite-resilience/SKILL.md',
    category: 'Quality Engineering & Testing',
    summary: 'Mutation testing with Stryker and Pitest, mutation score evaluation, surviving mutant eradication, flaky test quarantine architectures, and test suite execution optimization.'
  },
  {
    id: '89-mobile-test-automation-appium-maestro',
    name: 'mobile-test-automation-appium-maestro',
    path: 'skills/89-mobile-test-automation-appium-maestro/SKILL.md',
    category: 'Quality Engineering & Testing',
    summary: 'Cross-platform mobile test automation with Maestro YAML flows, Appium 2.0, native Espresso and XCUITest, mobile gesture simulation, offline mode testing, and cloud device farm orchestration.'
  },
  {
    id: '90-exploratory-testing-and-session-based-test-management',
    name: 'exploratory-testing-and-session-based-test-management',
    path: 'skills/90-exploratory-testing-and-session-based-test-management/SKILL.md',
    category: 'Quality Engineering & Testing',
    summary: 'Session-Based Test Management (SBTM), James Bach & Cem Kaner charter-based exploratory testing, tour-based heuristics (SFDIPOT, FEW HICCUPPS), and team-wide Bug Bash orchestration.'
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
