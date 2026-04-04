const fs = require('fs');
const filepath = 'c:/Users/Elinaldo/Documents/PROJETOS/unitudo-erp/src/hooks/useERPData.ts';
let content = fs.readFileSync(filepath, 'utf8');

const newFunction = `
  const updateProductStock = async (productId: string, newStock: number) => {
    if (!session?.user) return;
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);
    
    if (error) throw error;
    fetchData();
  };
`;

if (!content.includes('updateProductStock = async')) {
  // Find a good place to insert it (e.g., before saveProduct)
  content = content.replace(
    "const saveProduct = async", 
    newFunction + "\n  const saveProduct = async"
  );
  
  // Add it to the return object
  content = content.replace(
    /saveProduct,\n/,
    "saveProduct,\n    updateProductStock,\n"
  );
}

fs.writeFileSync(filepath, content);
console.log('Successfully updated useERPData.ts');
