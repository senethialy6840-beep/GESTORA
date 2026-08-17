const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Move CTA Banner above Contact Section
const ctaStart = c.indexOf('      {/* -------------------- CTA BANNER -------------------- */}');
const ctaEnd = c.indexOf('      {/* -------------------- FAQ SECTION -------------------- */}');
const contactStart = c.indexOf('      {/* -------------------- CONTACT SECTION -------------------- */}');

if (ctaStart > -1 && ctaEnd > -1 && contactStart > -1) {
  let ctaSection = c.substring(ctaStart, ctaEnd);
  
  // Remove CTA from its original place
  c = c.substring(0, ctaStart) + c.substring(ctaEnd);
  
  // Update colors in CTA to remove blue background
  ctaSection = ctaSection.replace('bg-[#2563EB] py-20', 'bg-white py-24');
  ctaSection = ctaSection.replace('text-white leading-tight', 'text-gray-900 leading-tight');
  ctaSection = ctaSection.replace('text-blue-100', 'text-gray-500');
  ctaSection = ctaSection.replace('bg-white text-[#2563EB]', 'bg-[#2563EB] text-white hover:bg-blue-600');
  
  // Re-insert CTA above Contact Section
  // But wait, the contactStart index is from the original `c`. 
  // Let's recalculate contactStart on the new `c`
  const newContactStart = c.indexOf('      {/* -------------------- CONTACT SECTION -------------------- */}');
  c = c.substring(0, newContactStart) + ctaSection + '\n' + c.substring(newContactStart);
}

// 2. Remove "Vous ne trouvez pas votre réponse ?" from FAQ
const faqBlockStart = c.indexOf('          <div className="mt-16 text-center bg-gray-50 rounded-3xl');
const faqBlockEnd = c.indexOf('        </div>\n      </section>\n\n      {/* -------------------- FOOTER -------------------- */}');

if (faqBlockStart > -1 && faqBlockEnd > -1) {
  c = c.substring(0, faqBlockStart) + c.substring(faqBlockEnd);
}

fs.writeFileSync('app/page.tsx', c);
