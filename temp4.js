const fs = require('fs');
let c = fs.readFileSync('app/components/PricingSection.tsx', 'utf8');

const compTableStart = c.indexOf('        {/* COMPARISON TABLE */}');
const compTableEnd = c.indexOf('      </div>\n    </section>');
if (compTableStart > -1 && compTableEnd > -1) {
  c = c.substring(0, compTableStart) + c.substring(compTableEnd);
}

fs.writeFileSync('app/components/PricingSection.tsx', c);
