import fs from 'fs';
fetch('http://localhost:3000/api.php?action=data&type=home')
  .then(r => r.text())
  .then(text => fs.writeFileSync('test_output.json', text))
  .catch(e => console.error(e));
