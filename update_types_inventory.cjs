const fs = require('fs');
const filepath = 'c:/Users/Elinaldo/Documents/PROJETOS/unitudo-erp/src/types.ts';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes('InventoryMovement')) {
  content = content.replace(
    /export type UserRole = 'admin' \| 'manager' \| 'seller';/,
    `export interface InventoryMovement {
  id: string;
  date: string;
  productId: string;
  type: 'entry' | 'exit';
  quantity: number;
  reason: string;
  userId: string;
}

export type UserRole = 'admin' | 'manager' | 'seller';`
  );
  fs.writeFileSync(filepath, content);
  console.log('Successfully updated types.ts');
} else {
  console.log('InventoryMovement already exists in types.ts');
}
