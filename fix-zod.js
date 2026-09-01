const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app/actions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('validated.error.errors')) {
    content = content.replace(/validated\.error\.errors\[0\]\.message/g, "validated.error.issues[0].message");
    fs.writeFileSync(filePath, content);
    console.log('Fixed', file);
  }
});
