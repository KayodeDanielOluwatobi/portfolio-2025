const fs = require('fs');
const path = require('path');

const frequencyDir = path.join(__dirname, '../public/frequency-data');
const outputFile = path.join(__dirname, '../public/frequency-index.json');

// Read all JSON files from frequency-data folder
const files = fs.readdirSync(frequencyDir).filter(f => f.endsWith('.json'));

const index = files.map(file => {
  const filePath = path.join(frequencyDir, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  return {
    title: content.title || file.replace('.json', ''),
    id: content.id,
    dataFile: file
  };
});

fs.writeFileSync(outputFile, JSON.stringify(index, null, 2));
console.log(`Generated index with ${index.length} tracks`);