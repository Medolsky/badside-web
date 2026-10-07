# Badside Monitor — FiveM Player Intelligence Dashboard

Dashboard untuk staff yang memantau player FiveM: status online/offline, durasi di kota, identitas karakter, identifier (dimasking), watchlist, grup, histori, dan alert.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3001
```

## Struktur

| Path | Isi |
| --- | --- |
| `src/app/dashboard` | Ringkasan server, target watchlist yang sedang online, feed aktivitas |
| `src/app/players`, `players/[id]` | Tabel player + dossier (sesi live, identifier, karakter, timeline) |
| `src/app/watchlist` | Tambah/hapus target per prioritas |
| `src/app/groups`, `groups/[slug]` | Monitoring kelompok (BADside, dll.) |
| `src/app/history`, `alerts`, `analytics`, `intel-graph`, `audit-log`, `settings` | Fitur pendukung |
| `src/app/api/fivem/ingest` | Endpoint yang dipanggil resource FiveM (`x-api-key` wajib) |
| `src/lib/store.ts` | Store data + helper masking/format |
| `prisma/schema.prisma` | Skema database monitoring (belum disambungkan) |
| `fivem-resource/badside_intel` | Resource Lua: join, leave, karakter, heartbeat |

## Resource FiveM

1. Copy `fivem-resource/badside_intel` ke folder `resources/` server.
2. Samakan `Config.ApiKey` di `config.lua` dengan `FIVEM_API_SECRET` di `.env`.
3. Tambahkan `ensure badside_intel` di `server.cfg`.
4. Panggil export saat karakter dipilih (ESX/QBCore):
   ```lua
   exports.badside_intel:CharacterLoaded(src, cid, fullName, job, faction)
   ```

Client hanya mengirim nama zona/jalan dan kendaraan, bukan koordinat mentah. Identifier IP tidak dikirim.

## Status saat ini

- Data masih **mock in-memory** (`src/lib/mockData.ts`), di-reset saat server restart.
- Halaman membaca store di browser; endpoint ingest mengubah store di server. Supaya event live dari FiveM tampil di UI, langkah berikutnya adalah menyambungkan Prisma + API baca (`/api/players`, dll.) dan polling/WebSocket.
- Login & role (Owner/Admin/Staff/Viewer) baru berupa switcher di header, belum ada autentikasi atau pembatasan akses.
