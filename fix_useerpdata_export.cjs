const fs = require('fs');
const filepath = 'c:/Users/Elinaldo/Documents/PROJETOS/unitudo-erp/src/hooks/useERPData.ts';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes('updateProductStock,')) {
  content = content.replace(
    "products, saveProduct, deleteProduct,",
    "products, saveProduct, deleteProduct, updateProductStock,"
  );
  fs.writeFileSync(filepath, content);
  console.log('Fixed export in useERPData.ts');
} else {
  console.log('Already exported');
}
