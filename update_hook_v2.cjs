const fs = require('fs');
const filepath = 'c:/Users/Elinaldo/Documents/PROJETOS/unitudo-erp/src/hooks/useERPData.ts';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Add InventoryReason to type imports
if (!content.includes('InventoryReason')) {
  content = content.replace(
    /import { Product, Sale, Customer, Supplier, Transaction, CashSession, UserProfile, InventoryMovement } from '..\/types';/,
    "import { Product, Sale, Customer, Supplier, Transaction, CashSession, UserProfile, InventoryMovement, InventoryReason } from '../types';"
  );
}

// 2. Add inventoryReasons state
if (!content.includes('const [inventoryReasons, setInventoryReasons]')) {
  content = content.replace(
    /const \[inventoryMovements, setInventoryMovements\] = useState<InventoryMovement\[\]>\(\[\]\);/,
    "const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);\n  const [inventoryReasons, setInventoryReasons] = useState<InventoryReason[]>([]);"
  );
}

// 3. Update fetchData to include inventory_reasons
if (!content.includes("supabase.from('inventory_reasons')")) {
  // Add fetching line
  content = content.replace(
    /const { data: invMoveData } = await supabase.from\('inventory_movements'\).select\('\*'\).order\('created_at', { ascending: false }\);/,
    "const { data: invMoveData } = await supabase.from('inventory_movements').select('*').order('created_at', { ascending: false });\n      const { data: reasonsData } = await supabase.from('inventory_reasons').select('*').order('name');"
  );

  // Add state setting logic
  content = content.replace(
    /if \(invMoveData\) \{[\s\S]*?\}\s*if \(salesData\) \{/,
    (match) => {
      const reasonsLogic = `\n      if (reasonsData) {\n        setInventoryReasons(reasonsData.map(r => ({\n          id: r.id,\n          name: r.name,\n          type: r.type,\n          userId: r.user_id\n        })));\n      }\n`;
      return match.replace("if (salesData) {", reasonsLogic + "      if (salesData) {");
    }
  );
}

// 4. Add addInventoryReason function before the return
if (!content.includes('const addInventoryReason')) {
  const addReasonFn = `
  const addInventoryReason = async (name: string, type: 'entry' | 'exit' | 'both' = 'both') => {
    if (!session?.user) return;
    const { data, error } = await supabase.from('inventory_reasons').insert({\n      name,\n      type,\n      user_id: session.user.id\n    }).select().single();
    if (error) throw error;
    fetchData();
    return data;
  };\n`;
  content = content.replace(
    /return \{/,
    addReasonFn + "\n  return {"
  );
}

// 5. Add to the returned object
if (!content.includes('inventoryReasons, addInventoryReason')) {
  content = content.replace(
    /inventoryMovements, addInventoryMovement,/,
    "inventoryMovements, addInventoryMovement, inventoryReasons, addInventoryReason,"
  );
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Successfully updated useERPData.ts');
