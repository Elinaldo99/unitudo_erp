const fs = require('fs');
const filepath = 'c:/Users/Elinaldo/Documents/PROJETOS/unitudo-erp/src/types.ts';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes('export interface InventoryReason')) {
  content += `\nexport interface InventoryReason {\n  id: string;\n  name: string;\n  type: 'entry' | 'exit' | 'both';\n  userId: string;\n}\n`;
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Successfully updated types.ts with InventoryReason');
} else {
  console.log('InventoryReason already exists in types.ts');
}
