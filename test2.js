import fs from 'fs';
fetch('http://localhost:3000/api.php?action=data&type=home&token=nonexistent')
  .then(r => r.text())
  .then(text => fs.writeFileSync('test_output_token.json', text))
  .catch(e => console.error(e));
