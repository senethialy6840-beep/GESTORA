const fs = require('fs');
let c = fs.readFileSync('app/components/PricingSection.tsx', 'utf8');

// Remove features list UI from cards
const featuresUIStart = c.indexOf('                <div className="space-y-4 flex-1">');
const featuresUIEnd = c.indexOf('                </div>\n              </div>\n            </motion.div>');
if (featuresUIStart > -1 && featuresUIEnd > -1) {
  c = c.substring(0, featuresUIStart) + c.substring(featuresUIEnd);
}

// Remove Comparison table
const compTableStart = c.indexOf('        {/* COMPARISON TABLE */}');
const compTableEnd = c.indexOf('      </div>\n    </section>');
if (compTableStart > -1 && compTableEnd > -1) {
  c = c.substring(0, compTableStart) + c.substring(compTableEnd);
}

fs.writeFileSync('app/components/PricingSection.tsx', c);
