const fs = require('fs');
const filepath = 'c:/Users/Elinaldo/Documents/PROJETOS/unitudo-erp/src/pages/Sales.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Fix text encoding
content = content.replace("No h dados", "Não há dados");

// Fix double div
content = content.replace(
`      </div>
      </div>

      {/* Sales Table */}`,
`      </div>

      {/* Sales Table */}`
);

fs.writeFileSync(filepath, content);
console.log('Successfully fixed syntax');
