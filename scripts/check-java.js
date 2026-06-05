const { execSync } = require('child_process');

try {
  const javaVersion = execSync('java -version 2>&1').toString();
  if (!javaVersion.includes('21')) {
    console.error('\x1b[31m%s\x1b[0m', 'ERRO: A SEMOB exige Java 21 para o build Android.');
    process.exit(1);
  }
  console.log('\x1b[32m%s\x1b[0m', 'Ambiente Java validado (Versão 21).');
} catch (e) {
  console.error('Java não encontrado no PATH.');
  process.exit(1);
}
