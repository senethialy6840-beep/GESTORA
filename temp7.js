const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

const contactStart = c.indexOf('      {/* -------------------- CONTACT SECTION -------------------- */}');
const footerStart = c.indexOf('      {/* -------------------- FOOTER -------------------- */}');

if (contactStart > -1 && footerStart > -1) {
  let oldContactFaq = c.substring(contactStart, footerStart);
  
  // Extract Form part
  const formStart = oldContactFaq.indexOf('{/* Form */}');
  const formEnd = oldContactFaq.indexOf('              </div>\n\n          </div>\n        </div>\n      </section>');
  const formContent = oldContactFaq.substring(formStart, formEnd).trim();
  
  // Extract FAQ items
  const faqListStart = oldContactFaq.indexOf('<div className="space-y-4">');
  const faqListEnd = oldContactFaq.indexOf('          </div>\n        </div>\n      </section>');
  const faqContent = oldContactFaq.substring(faqListStart, faqListEnd).trim();
  
  // Create combined section
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
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h3>
              ${faqContent}
            </div>

            {/* Right Column: Form */}
            <div className="space-y-8">
              ${formContent}
            </div>
          </div>
        </div>
      </section>

`;

  c = c.substring(0, contactStart) + newSection + c.substring(footerStart);
  fs.writeFileSync('app/page.tsx', c);
}
