const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

const supportStart = c.indexOf('      {/* -------------------- SUPPORT & FAQ SECTION -------------------- */}');
const footerStart = c.indexOf('      {/* -------------------- FOOTER -------------------- */}');

if (supportStart > -1 && footerStart > -1) {
  let oldContent = c.substring(supportStart, footerStart);
  
  // Clean it up
  const faqListStart = oldContent.indexOf('<FaqItem');
  const faqListEnd = oldContent.lastIndexOf('</details>') + 10;
  
  // Wait, let's just do a clean rewrite of the whole section
  
  // First, extract the FaqItems
  let faqItems = '';
  const faqSpaceYStart = oldContent.indexOf('<div className="space-y-4">');
  const faqSpaceYEnd = oldContent.indexOf('</div>\n        </div>\n      </section>', faqSpaceYStart);
  
  // I actually just want all the FaqItem components
  let itemsMatch = oldContent.match(/<FaqItem[\s\S]*?\/>/g);
  if (itemsMatch) {
    faqItems = itemsMatch.join('\n            ');
  }

  // Extract Form
  const formMatch = oldContent.match(/<div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">[\s\S]*?<\/form>\n\s*<\/div>/);
  const formContent = formMatch ? formMatch[0] : '';
  
  const newSection = `      {/* -------------------- SUPPORT & FAQ SECTION -------------------- */}
      <section id="support" className="py-24 relative overflow-hidden bg-[#FAFBFF] border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Assistance & Questions</h2>
            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
              Retrouvez les réponses aux questions les plus fréquentes ou contactez directement notre équipe pour une assistance personnalisée.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column: FAQ */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h3>
              ${faqItems}
            </div>

            {/* Right Column: Form */}
            <div className="space-y-8 sticky top-24">
              ${formContent}
            </div>
          </div>
        </div>
      </section>

`;

  c = c.substring(0, supportStart) + newSection + c.substring(footerStart);
  fs.writeFileSync('app/page.tsx', c);
}
