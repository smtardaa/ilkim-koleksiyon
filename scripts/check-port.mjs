/**
 * Geliştirme/önizleme sunucusunu başlatmadan önce 5500 portunun boş olduğunu
 * doğrular. Port doluysa başka porta geçilmez; neden ve çözüm yazılıp çıkılır.
 * Hiçbir işlemi kapatmaz.
 */
import net from 'node:net';

const PORT = Number(process.env.PORT_CHECK ?? 5500);
const HOSTS = ['0.0.0.0', '127.0.0.1', '::1'];

function tryListen(host) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => resolve(err.code === 'EAFNOSUPPORT' || err.code === 'EADDRNOTAVAIL' ? null : err.code));
    server.once('listening', () => server.close(() => resolve(null)));
    server.listen({ port: PORT, host, exclusive: true });
  });
}

const busy = [];
for (const host of HOSTS) {
  const code = await tryListen(host);
  if (code) busy.push(`${host} (${code})`);
}

if (busy.length) {
  console.error(`
  ✖ ${PORT} portu kullanımda: ${busy.join(', ')}
    Sunucu başka bir porta geçirilmeden durduruldu.

    Çözüm:
    • VS Code Live Server açıksa durum çubuğundaki "Port : ${PORT}" düğmesine tıklayarak kapatın.
    • Bu projenin eski bir Astro sunucusu açıksa o terminalde Ctrl+C'ye basın
      veya "npx astro dev stop" komutunu çalıştırın.
    • Portu hangi işlemin kullandığını görmek için (Windows):
        netstat -ano | findstr :${PORT}
`);
  process.exit(1);
}
