const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

if (!c.includes('PricingSection')) {
  c = c.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport { PricingSection } from './components/PricingSection';");
}

const pStart = c.indexOf('      {/* -------------------- PRICING SECTION -------------------- */}');
const pEnd = c.indexOf('      {/* -------------------- CONTACT SECTION -------------------- */}');
if (pStart > -1 && pEnd > -1) {
  c = c.substring(0, pStart) + '      <PricingSection />\n\n' + c.substring(pEnd);
}

const fStart = c.indexOf('      {/* -------------------- FAQ SECTION -------------------- */}');
const fEnd = c.indexOf('      {/* -------------------- FOOTER -------------------- */}');
if (fStart > -1 && fEnd > -1) {
  c = c.substring(0, fStart) + c.substring(fEnd);
}

const pcStart = c.indexOf('function PricingCard');
if (pcStart > -1) {
  c = c.substring(0, pcStart);
}

fs.writeFileSync('app/page.tsx', c);
