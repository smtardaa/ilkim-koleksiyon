#!/usr/bin/env node
/**
 * Yönetim paneli giriş bilgilerini üretir.
 *   npm run admin:parola
 * Kullanıcı adı ve parola sorulur; çıkan üç satır hosting panelindeki ortam değişkenlerine
 * (yerelde .env dosyasına) eklenir. Parolanın kendisi hiçbir yere yazılmaz, yalnızca özeti üretilir.
 */
import { createInterface } from 'node:readline';
import { randomBytes } from 'node:crypto';
import { hashPassword } from '../src/lib/admin/auth.js';

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Yazılan parola ekranda gösterilmez
      rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(s); else rl.output.write(s.includes('\n') ? '\n' : ''); };
    }
    rl.question(question, (answer) => { rl.close(); resolve(answer); });
  });
}

const username = (await ask('Kullanıcı adı: ')).trim();
if (!username) { console.error('Kullanıcı adı boş olamaz.'); process.exit(1); }
const password = await ask('Parola (en az 12 karakter): ', { hidden: true });
if (password.length < 12) { console.error('\nParola en az 12 karakter olmalı.'); process.exit(1); }
const again = await ask('Parola (tekrar): ', { hidden: true });
if (again !== password) { console.error('\nParolalar aynı değil.'); process.exit(1); }

console.log('\nAşağıdaki üç satırı ortam değişkenlerine ekleyin (Hostinger → Node.js uygulaması → Ortam değişkenleri):\n');
console.log(`ADMIN_USERNAME=${username}`);
console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
console.log(`SESSION_SECRET=${randomBytes(48).toString('base64url')}`);
console.log('\nEkledikten sonra uygulamayı yeniden başlatın. Panel adresi: /yonetim');
