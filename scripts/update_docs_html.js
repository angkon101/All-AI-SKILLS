const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'docs', 'index.html');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/110 Enterprise Engineering, Testing, Anti-Slop &amp; Token Optimization Skills/g, '115 Enterprise Engineering, Testing, Anti-Slop, Token Optimization &amp; Architectural SVG Motion Skills');
c = c.replace(/suite of 110 AI Agent Skills/g, 'suite of 115 AI Agent Skills');
c = c.replace(/110 autonomous skills across 21 organizational tracks/g, '115 autonomous skills across 22 organizational tracks');
c = c.replace(/Explore 110 Skills →/g, 'Explore 115 Skills →');
c = c.replace(/<strong>110 AI Agent runbooks<\/strong>/g, '<strong>115 AI Agent runbooks</strong>');
c = c.replace(/data-target="110"/g, 'data-target="115"');
c = c.replace(/data-target="21"/g, 'data-target="22"');
c = c.replace(/110 Autonomous/g, '115 Autonomous');
c = c.replace(/Showing 110 of 110 Skills/g, 'Showing 115 of 115 Skills');

fs.writeFileSync(file, c, 'utf8');
console.log('Successfully updated docs/index.html to 115 skills and 22 tracks');
