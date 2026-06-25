const fs = require('fs');
const file = 'C:/Users/crist/OneDrive/Documentos/GITHUB/NHPanamericano/frontend/src/lib/constants/cuidadosTemplates.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace the specific problem table tags
content = content.replace('<table style="width: 100%; border: none;">', '<table width="100%" style="border: none;">');
content = content.replace('<td style="width: 50%; vertical-align: top;">', '<td valign="top" style="vertical-align: top; padding-right: 10px;">');
content = content.replace('<td style="width: 50%; vertical-align: top; text-align: center; padding-left: 20px;">', '<td valign="top" style="vertical-align: top; text-align: center;">');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed table widths');
