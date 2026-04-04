const fs = require('fs');
const filepath = 'c:/Users/Elinaldo/Documents/PROJETOS/unitudo-erp/src/hooks/useERPData.ts';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Add InventoryMovement to types import
content = content.replace(
  "import { Product, Sale, Customer, Supplier, Transaction, CashSession, UserProfile } from '../types';",
  "import { Product, Sale, Customer, Supplier, Transaction, CashSession, UserProfile, InventoryMovement } from '../types';"
);

// 2. Add inventoryMovements state
content = content.replace(
  "const [users, setUsers] = useState<UserProfile[]>([]);",
  "const [users, setUsers] = useState<UserProfile[]>([]);\n  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);"
);

// 3. Update fetchData to include inventory_movements
const fetchDataUpdate = `      const { data: salesData, error: salesFetchError } = await supabase.from('sales').select('*, items:sale_items(*), customers(name)').order('date', { ascending: false });
      if (salesFetchError) console.error('Sales fetch error:', salesFetchError);
      
      const { data: invMoveData } = await supabase.from('inventory_movements').select('*').order('created_at', { ascending: false });`;

content = content.replace(
  "const { data: salesData, error: salesFetchError } = await supabase.from('sales').select('*, items:sale_items(*), customers(name)').order('date', { ascending: false });\n      if (salesFetchError) console.error('Sales fetch error:', salesFetchError);",
  fetchDataUpdate
);

content = content.replace(
  "      if (salesData) {",
  `      if (invMoveData) {
        setInventoryMovements(invMoveData.map(m => ({
          id: m.id,
          date: m.created_at,
          productId: m.product_id,
          type: m.type,
          quantity: Number(m.quantity),
          reason: m.reason || '',
          userId: m.user_id
        })));
      }

      if (salesData) {`
);

// 4. Add addInventoryMovement function & remove redundant supplier functions
const newFunctions = `  const addInventoryMovement = async (movement: Omit<InventoryMovement, 'id' | 'date' | 'userId'>) => {
    if (!session?.user) return;
    
    try {
      // 1. Get current stock
      const product = products.find(p => p.id === movement.productId);
      if (!product) throw new Error('Produto não encontrado');

      const newStock = movement.type === 'entry' 
        ? product.stock + movement.quantity 
        : product.stock - movement.quantity;

      if (newStock < 0) throw new Error('Saldo insuficiente em estoque');

      // 2. Insert movement
      const { error: moveError } = await supabase.from('inventory_movements').insert({
        product_id: movement.productId,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        user_id: session.user.id
      });
      if (moveError) throw moveError;

      // 3. Update product stock
      const { error: prodError } = await supabase.from('products').update({ stock: newStock }).eq('id', movement.productId);
      if (prodError) throw prodError;

      fetchData();
    } catch (error: any) {
      console.error('Error adding inventory movement:', error);
      alert(error.message || 'Erro ao processar movimentação de estoque');
    }
  };`;

// Insert before the return statement
content = content.replace(
  "  return {",
  newFunctions + "\n\n  return {"
);

// 5. Update return object
content = content.replace(
  "    products, saveProduct, deleteProduct, updateProductStock,",
  "    products, saveProduct, deleteProduct, updateProductStock, inventoryMovements, addInventoryMovement,"
);

// 6. Fix redundant supplier functions (lines 378 to 426)
const redundantStart = content.indexOf('  const saveSupplier = async (supplier: Omit<Supplier, \'id\' | \'userId\'> & { id?: string }) => {', content.indexOf('saveSupplier') + 1);
const redundantEnd = content.indexOf('};', content.indexOf('const deleteUser') - 50);

// Use a regex to find the duplicate block
content = content.replace(
  /const \[suppliers, saveSupplier, deleteSupplier, saveSupplier, deleteSupplier, setSuppliers\] = useState<Supplier\[\]>\(\[\]\);/,
  "const [suppliers, setSuppliers] = useState<Supplier[]>([]);"
);

// Final cleanup: just replace the whole duplicated block by searching for the double definitions
content = content.replace(
  /const saveSupplier = async \(supplier: Omit<Supplier, 'id' | 'userId'> & { id\?: string }\) => \{[\s\S]*?fetchData\(\);\s+\};/g,
  (match, offset, string) => {
     // Keep only the first one
     return string.indexOf(match) === offset ? match : "";
  }
).replace(
  /const deleteSupplier = async \(id: string\) => \{[\s\S]*?fetchData\(\);\s+\};/g,
  (match, offset, string) => {
     // Keep only the first one
     return string.indexOf(match) === offset ? match : "";
  }
);

// Add missing exports to return
if (!content.includes('saveSupplier')) {
  content = content.replace("return {", "return {\n    suppliers, saveSupplier, deleteSupplier,");
} else {
    // Ensure they are in return if not there
    if (!content.includes('    suppliers, saveSupplier, deleteSupplier,')) {
         content = content.replace("products, saveProduct,", "products, saveProduct, suppliers, saveSupplier, deleteSupplier,");
    }
}

fs.writeFileSync(filepath, content);
console.log('Successfully updated useERPData.ts');
