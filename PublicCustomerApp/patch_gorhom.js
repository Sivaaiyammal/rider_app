const fs = require('fs');
const files = [
  'node_modules/@gorhom/bottom-sheet/src/hooks/useAnimatedLayout.ts',
  'node_modules/@gorhom/bottom-sheet/lib/commonjs/hooks/useAnimatedLayout.js',
  'node_modules/@gorhom/bottom-sheet/lib/module/hooks/useAnimatedLayout.js'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix the multiline destructuring
  content = content.replace(
    /Dimensions\.addEventListener\('change',\s*\(\{\s*window\s*\}\)\s*=>\s*\{/g,
    "Dimensions.addEventListener('change', ({ window: nextWindow }) => {"
  );
  
  // Fix the single line one if it exists
  content = content.replace(
    /Dimensions\.addEventListener\('change',\s*\(\{\s*window\s*:\s*nextWindow\s*\}\)\s*=>\s*\{/g,
    "Dimensions.addEventListener('change', ({ window: nextWindow }) => {"
  );

  fs.writeFileSync(file, content);
});
console.log("Patched files");
