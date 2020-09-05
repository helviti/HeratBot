const fs = require('fs');

try {
  const data = fs.readFileSync('/home/helviti/.local/share/multimc/instances/1.15.2/.minecraft/options.txt', 'utf8');
  console.log(data);
} catch (e) {
  console.log('Error:', e.stack);
}
