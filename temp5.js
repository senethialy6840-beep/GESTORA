const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

const startContact = c.indexOf('{/* -------------------- CONTACT SECTION -------------------- */}');
const endContact = c.indexOf('{/* -------------------- CTA BANNER -------------------- */}');

if (startContact > -1 && endContact > -1) {
  let contactSection = c.substring(startContact, endContact);
  
  // Replace the grid container with a centered container
  contactSection = contactSection.replace(
    '<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">',
    '<div className="max-w-3xl mx-auto">'
  );
  
  // Remove the Left Column
  const leftColStart = contactSection.indexOf('{/* Left Column: Info Blocks */}');
  const rightColStart = contactSection.indexOf('{/* Right Column: Form & Demo */}');
  if (leftColStart > -1 && rightColStart > -1) {
    contactSection = contactSection.substring(0, leftColStart) + contactSection.substring(rightColStart);
  }
  
  // Remove the wrapper for the Right Column
  contactSection = contactSection.replace(
    '{/* Right Column: Form & Demo */}\n            <div className="lg:col-span-7 space-y-8">\n              {/* Form */}',
    '{/* Form */}'
  );
  
  // Remove the extra closing </div> for the Right Column
  contactSection = contactSection.replace(
    '              </div>\n\n            </div>\n          </div>\n        </div>\n      </section>',
    '              </div>\n\n          </div>\n        </div>\n      </section>'
  );

  c = c.substring(0, startContact) + contactSection + c.substring(endContact);
}

fs.writeFileSync('app/page.tsx', c);
