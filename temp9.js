const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

const supportStart = c.indexOf('      {/* -------------------- SUPPORT & FAQ SECTION -------------------- */}');
const footerStart = c.indexOf('      {/* -------------------- FOOTER -------------------- */}');

if (supportStart > -1 && footerStart > -1) {
  let oldContent = c.substring(supportStart, footerStart);
  
  // Extract FaqItems
  let faqItems = '';
  let itemsMatch = oldContent.match(/<FaqItem[\s\S]*?\/>/g);
  if (itemsMatch) {
    faqItems = itemsMatch.join('\n              ');
  }

  // Extract Form Fields
  const formMatch = oldContent.match(/<form className="space-y-6">[\s\S]*?<\/form>/);
  const formContent = formMatch ? formMatch[0] : '';
  
  const newSection = `      {/* -------------------- SUPPORT & FAQ SECTION -------------------- */}
      <section id="support" className="py-24 relative overflow-hidden bg-white border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Assistance & Questions</h2>
            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
              Retrouvez les réponses aux questions les plus fréquentes ou contactez directement notre équipe pour une assistance personnalisée.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column: Form */}
            <div className="space-y-8 sticky top-24">
              <div className="bg-gray-50/80 backdrop-blur-sm p-8 rounded-[2rem] border border-gray-100/80 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Nous sommes là pour vous accompagner</h3>
                <p className="text-gray-500 font-medium mb-8 text-sm leading-relaxed">
                  Vous avez une question, besoin d'une démonstration ou souhaitez en savoir plus sur GESTORA ? Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                </p>
                ${formContent.replace(/bg-gray-50/g, 'bg-white').replace(/border-gray-200/g, 'border-gray-100')}
              </div>
            </div>

            {/* Right Column: FAQ */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 px-2">Questions fréquentes</h3>
              ${faqItems}
            </div>
          </div>
        </div>
      </section>

`;

  c = c.substring(0, supportStart) + newSection + c.substring(footerStart);
  fs.writeFileSync('app/page.tsx', c);
}
