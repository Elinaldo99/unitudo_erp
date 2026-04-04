const fs = require('fs');
const filepath = 'c:/Users/Elinaldo/Documents/PROJETOS/unitudo-erp/src/pages/Sales.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Add useMemo to imports
if (!content.includes('useMemo')) {
  content = content.replace(
    "import React, { useState } from 'react';", 
    "import React, { useState, useMemo } from 'react';"
  );
}

// 2. State & Filtering
const stateBlock = `  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // Default to today's date in local YYYY-MM-DD
  const getTodayFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return \`\${year}-\${month}-\${day}\`;
  };
  
  const [dateFilter, setDateFilter] = useState(getTodayFormatted());
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSales = useMemo(() => {
    return data.sales.filter(s => {
      // Search
      const matchesSearch = s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date
      let matchesDate = false;
      if (!dateFilter) {
        matchesDate = true;
      } else {
        try {
          // Adjust timezone offset to match local day intuitively
          const saleDate = new Date(s.date);
          const year = saleDate.getFullYear();
          const month = String(saleDate.getMonth() + 1).padStart(2, '0');
          const day = String(saleDate.getDate()).padStart(2, '0');
          const saleDateStr = \`\${year}-\${month}-\${day}\`;
          matchesDate = saleDateStr === dateFilter;
        } catch(e) {
          matchesDate = false;
        }
      }

      // Status
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [data.sales, searchTerm, dateFilter, statusFilter]);

  const handleExport = () => {
    if (filteredSales.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    const headers = ['Venda ID', 'Data', 'Cliente', 'Pagamento', 'Total', 'Status'];
    const csvRows = [headers.join(',')];

    for (const sale of filteredSales) {
      const row = [
        sale.id,
        new Date(sale.date).toLocaleString('pt-BR').replace(/,/g, ''),
        \`"\${sale.customerName || 'Consumidor Final'}"\`,
        getMethodLabel(sale.paymentMethod),
        sale.total.toFixed(2),
        sale.status === 'completed' ? 'Finalizada' : 'Cancelada'
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", \`vendas_\${dateFilter || 'todas'}.csv\`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };`;

content = content.replace(
  /const \[searchTerm, setSearchTerm\] = useState\(''\);\s+const \[selectedSale, setSelectedSale\] = useState<Sale \| null>\(null\);\s+const filteredSales = data\.sales\.filter\(s =>\s+s\.id\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\) \|\|\s+s\.customerName\?\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)\s+\);/,
  stateBlock
);

// 3. UI Filters block
const uiFiltersBlock = `      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por ID ou cliente..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative flex items-center border border-slate-200 rounded-lg bg-white text-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all w-full sm:w-auto">
             <div className="pl-3 pr-2 py-2 text-slate-400 border-r border-slate-100 flex items-center gap-2 bg-slate-50 rounded-l-lg shrink-0">
                <Calendar size={16} />
                <span className="font-medium hidden sm:inline">Data</span>
             </div>
             <input 
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 outline-none text-slate-700 bg-transparent cursor-pointer font-medium w-full sm:w-auto"
             />
             {dateFilter && (
                <button 
                  onClick={() => setDateFilter('')} 
                  className="pr-3 text-slate-400 hover:text-red-500 shrink-0"
                  title="Limpar Filtro (Mostrar Todos)"
                >
                  <X size={14} />
                </button>
             )}
          </div>

          <div className="relative flex items-center border border-slate-200 rounded-lg bg-white text-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all w-full sm:w-auto">
             <div className="pl-3 pr-2 py-2 text-slate-400 border-r border-slate-100 flex items-center gap-2 bg-slate-50 rounded-l-lg shrink-0">
                <Filter size={16} />
                <span className="font-medium hidden sm:inline">Status</span>
             </div>
             <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 outline-none text-slate-700 bg-transparent cursor-pointer font-medium w-full sm:w-auto pr-2"
             >
                <option value="all">Todos</option>
                <option value="completed">Finalizada</option>
                <option value="cancelled">Cancelada</option>
             </select>
          </div>

          <button 
             onClick={handleExport}
             className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all w-full sm:w-auto mt-2 sm:mt-0"
          >
            <Download size={18} />
            Exportar
          </button>
        </div>
      </div>`;

content = content.replace(
  /<div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">[\s\S]*?<\/div>\s*<\/div>/,
  uiFiltersBlock + '\n      </div>'
);

fs.writeFileSync(filepath, content);
console.log('Successfully updated Sales.tsx');
