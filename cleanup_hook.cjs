const fs = require('fs');
const filepath = 'c:/Users/Elinaldo/Documents/PROJETOS/unitudo-erp/src/hooks/useERPData.ts';
let lines = fs.readFileSync(filepath, 'utf8').split('\n');
// Line 419 in previous output was index 418
if (lines[418] && (lines[418].trim() === '|' || lines[418].includes('|'))) {
    lines.splice(418, 1);
    fs.writeFileSync(filepath, lines.join('\n'));
    console.log('Successfully removed corrupted line at 419');
} else {
    // If indices shifted or something, search for it
    const index = lines.findIndex(l => l.trim() === '|');
    if (index !== -1) {
        lines.splice(index, 1);
        fs.writeFileSync(filepath, lines.join('\n'));
        console.log('Successfully found and removed corrupted line');
    }
}
