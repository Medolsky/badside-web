# Badside Intel — FiveM Resource

Resource FiveM untuk sinkronisasi otomatis status online, heartbeat, dan auto off-duty pemain sindikat / badside ke web [Ophelia Badside](https://ophelia-badside.vercel.app).

---

## 🚀 Cara Pemasangan di Server FiveM (RDP)

1. Copy folder `badside_intel` ke folder resources FiveM server kamu:
   `[resources]/[standalone]/badside_intel` atau `[resources]/badside_intel`

2. Buka `config.lua` dan sesuaikan URL web:
   ```lua
   Config = {}

   -- URL endpoint ingest website
   Config.Endpoint = 'https://ophelia-badside.vercel.app/api/fivem/ingest'

   -- Wajib sama dengan FIVEM_API_SECRET di .env dashboard website
   Config.ApiKey = 'badside_soc_secret_token_99x'

   -- Interval heartbeat (detik)
   Config.HeartbeatInterval = 5

   -- Interval laporan koordinat/kendaraan pemain (detik)
   Config.ClientReportInterval = 10

   Config.Debug = false
   ```

3. Tambahkan ke `server.cfg`:
   ```cfg
   ensure badside_intel
   ```

4. Restart server atau jalankan command di server console:
   ```cmd
   refresh
   ensure badside_intel
   ```

---

## ⚡ Fitur Utama:
- **Instant Auto Off-Duty**: Saat pemain disconnect (`playerDropped` / keluar kota / crash), webhook dikirim detik itu juga dan website langsung menandai pemain **Offline / Off-Duty**.
- **Heartbeat Active Sync**: Mengirim batch pemain aktif setiap 5 detik. Jika player time out lebih dari 30 detik, otomatis dianggap keluar kota.
- **Role & Identifier Auto-Mapping**: Menghubungkan license, discord, dan serverId pemain secara otomatis.
