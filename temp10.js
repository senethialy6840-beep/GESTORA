const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Fix Navbar
c = c.replace(
  '<nav className="hidden lg:flex items-center space-x-8 text-[15px] font-medium text-gray-600">\n              <Link href="#fonctionnalites" className="hover:text-brand transition-colors">Fonctionnalités</Link>\n              <Link href="#tarification" className="hover:text-brand transition-colors">Tarification</Link>\n              <Link href="#faq" className="hover:text-brand transition-colors">FAQ</Link>\n              <Link href="#contact" className="px-5 py-2.5 bg-[#2563EB] text-white rounded-full font-bold hover:bg-blue-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">Contactez-nous</Link>\n            </nav>',
  `<nav className="hidden lg:flex items-center space-x-8 text-[15px] font-medium text-gray-600">
              <Link href="#fonctionnalites" className="hover:text-brand transition-colors">Fonctionnalités</Link>
              <Link href="#tarification" className="hover:text-brand transition-colors">Tarification</Link>
              <Link href="#faq" className="hover:text-brand transition-colors">FAQ</Link>
            </nav>
            <Link href="#contact" className="px-5 py-2.5 bg-[#2563EB] text-white rounded-full font-bold text-sm lg:text-base hover:bg-blue-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">Contactez-nous</Link>`
);

c = c.replace('<div className="flex items-center space-x-10">', '<div className="flex items-center space-x-4 lg:space-x-10">');

// 2. Fix Hero Typography
c = c.replace(
  '<h1 className="text-[3.5rem] leading-[1.1] font-extrabold text-[#1A1F2C] tracking-tight mb-4">',
  '<h1 className="text-4xl md:text-5xl lg:text-[3.5rem] leading-tight lg:leading-[1.1] font-extrabold text-[#1A1F2C] tracking-tight mb-4">'
);

// 3. Fix Mockup floating cards to not overflow on mobile
c = c.replace(
  '<div className="absolute inset-0 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-6 overflow-hidden">',
  '<div className="absolute inset-0 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-6 overflow-x-auto scrollbar-hide">\n                   <div className="min-w-[450px]">'
);
// We need to close the min-w div. Where does the mockup end? 
// It ends right before {/* Floating purple stats card */}
const purpleCardIdx = c.indexOf('{/* Floating purple stats card */}');
if (purpleCardIdx > -1) {
  const innerMockupEnd = c.lastIndexOf('</div>', purpleCardIdx - 10);
  if (innerMockupEnd > -1) {
    c = c.substring(0, innerMockupEnd) + '</div>\n                </div>' + c.substring(innerMockupEnd + 6);
  }
}

// 4. Hide floating cards on mobile
c = c.replace(
  '<div className="absolute top-1/2 left-10 -translate-y-1/2 bg-purple-100 rounded-3xl p-6 shadow-xl w-48 border border-purple-200/50 transform -rotate-6">',
  '<div className="hidden md:block absolute top-1/2 -left-4 lg:left-10 -translate-y-1/2 bg-purple-100 rounded-3xl p-6 shadow-xl w-48 border border-purple-200/50 transform -rotate-6">'
);

c = c.replace(
  '<div className="absolute top-1/3 -right-6 bg-emerald-100 rounded-3xl p-6 shadow-xl w-48 border border-emerald-200/50 transform rotate-3">',
  '<div className="hidden md:block absolute top-1/3 -right-6 bg-emerald-100 rounded-3xl p-6 shadow-xl w-48 border border-emerald-200/50 transform rotate-3">'
);

fs.writeFileSync('app/page.tsx', c);
