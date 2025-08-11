# Part Components Library

## StatusLegend

Komponen StatusLegend yang dapat digunakan kembali untuk menampilkan legend status pada tabel dengan konfigurasi yang fleksibel.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showPrintIcon` | boolean | false | Menampilkan instruksi icon printer |
| `showEditIcon` | boolean | true | Menampilkan instruksi icon edit |
| `showDetailIcon` | boolean | true | Menampilkan instruksi icon detail |
| `customInstructions` | array | null | Instruksi kustom untuk mengganti default |
| `statusList` | array | DEFAULT_MAINTENANCE_STATUS | Daftar status yang akan ditampilkan |

### Status yang Didukung

#### Maintenance Status (Default)
- **Selesai** (bg-success): Perawatan sudah selesai dilakukan
- **Dalam Pengerjaan** (bg-warning): Perawatan sedang berlangsung
- **Menunggu Perbaikan** (bg-warning): Perawatan menunggu untuk diperbaiki
- **Tertunda** (bg-danger): Perawatan ditunda atau belum dimulai
- **Batal** (bg-secondary): Perawatan dibatalkan

#### User Status
- **Aktif** (bg-success): User aktif dan dapat login
- **Tidak Aktif** (bg-danger): User tidak aktif dan tidak dapat login

#### Approval Status
- **Menunggu Approval** (bg-warning): Menunggu persetujuan dari atasan
- **Disetujui** (bg-success): Permintaan telah disetujui
- **Ditolak** (bg-danger): Permintaan ditolak

### Contoh Penggunaan

```jsx
// Basic usage
<StatusLegend />

// With print icon
<StatusLegend showPrintIcon={true} />

// Custom status list
<StatusLegend 
  statusList={[
    { value: "Selesai", badge: "bg-success", description: "Sudah selesai" },
    { value: "Proses", badge: "bg-warning", description: "Sedang diproses" }
  ]}
/>

// Custom instructions
<StatusLegend 
  customInstructions={[
    "* Klik tombol untuk melihat detail",
    "* Status akan berubah otomatis"
  ]}
/>

// In Table component
<Table
  showStatusLegend={true}
  statusLegendContent={<StatusLegend showPrintIcon={true} />}
  // ... other props
/>
```

### Instruksi Default

- Icon edit (pencil): untuk mengedit data
- Icon detail (eye): untuk melihat detail data
- Icon printer: untuk mencetak laporan (jika showPrintIcon=true)
- Informasi tentang perubahan status otomatis

## Konfigurasi Status

Library menyediakan konfigurasi status yang dapat digunakan:

```jsx
import { STATUS_CONFIG, getStatusByType, getAllStatusByType } from '../../part';

// Menggunakan status maintenance
const maintenanceStatus = getAllStatusByType('MAINTENANCE');

// Menggunakan status user
const userStatus = getAllStatusByType('USER');

// Menggunakan status approval
const approvalStatus = getAllStatusByType('APPROVAL');
```

## Komponen Lainnya

- **Alert**: Komponen alert/notifikasi
- **Button**: Komponen tombol dengan berbagai variasi
- **Dropdown**: Komponen dropdown/select
- **FileUpload**: Komponen upload file
- **Filter**: Komponen filter data
- **Icon**: Komponen icon dengan Bootstrap Icons
- **Input**: Komponen input form
- **Label**: Komponen label form
- **Loading**: Komponen loading/spinner
- **Modal**: Komponen modal/popup
- **Paging**: Komponen pagination
- **Table**: Komponen tabel dengan fitur lengkap

## Import

```jsx
// Import individual component
import StatusLegend from '../../part/StatusLegend';

// Import multiple components
import { StatusLegend, Table, Button } from '../../part';

// Import dengan konfigurasi
import { StatusLegend, STATUS_CONFIG } from '../../part';
```

## Examples

Lihat folder `examples/` untuk contoh penggunaan yang lebih lengkap:

- `StatusLegendExamples.jsx`: Contoh dasar penggunaan
- `AdvancedStatusLegendExamples.jsx`: Contoh lanjutan dengan konfigurasi kustom 