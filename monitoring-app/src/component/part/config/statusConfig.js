// Konfigurasi status untuk StatusLegend component
export const STATUS_CONFIG = {
  // Status untuk perawatan mesin
  MAINTENANCE: {
    SELESAI: {
      value: "Selesai",
      badge: "bg-success",
      description: "Perawatan sudah selesai dilakukan"
    },
    DALAM_PENGERJAAN: {
      value: "Dalam Pengerjaan", 
      badge: "bg-warning text-dark",
      description: "Perawatan sedang berlangsung"
    },
    MENUNGGU_PERBAIKAN: {
      value: "Menunggu Perbaikan",
      badge: "bg-warning text-dark", 
      description: "Perawatan menunggu untuk diperbaiki"
    },
    TERTUNDA: {
      value: "Tertunda",
      badge: "bg-danger",
      description: "Perawatan ditunda atau belum dimulai"
    },
    BATAL: {
      value: "Batal",
      badge: "bg-secondary", 
      description: "Perawatan dibatalkan"
    }
  },
  
  // Status untuk user/akun
  USER: {
    AKTIF: {
      value: "Aktif",
      badge: "bg-success",
      description: "User aktif dan dapat login"
    },
    TIDAK_AKTIF: {
      value: "Tidak Aktif",
      badge: "bg-danger",
      description: "User tidak aktif dan tidak dapat login"
    }
  },
  
  // Status untuk approval
  APPROVAL: {
    MENUNGGU: {
      value: "Menunggu Approval",
      badge: "bg-warning text-dark",
      description: "Menunggu persetujuan dari atasan"
    },
    DISETUJUI: {
      value: "Disetujui",
      badge: "bg-success",
      description: "Permintaan telah disetujui"
    },
    DITOLAK: {
      value: "Ditolak",
      badge: "bg-danger",
      description: "Permintaan ditolak"
    }
  }
};

// Fungsi helper untuk mendapatkan status berdasarkan tipe
export const getStatusByType = (type, statusKey) => {
  if (STATUS_CONFIG[type] && STATUS_CONFIG[type][statusKey]) {
    return STATUS_CONFIG[type][statusKey];
  }
  return null;
};

// Fungsi untuk mendapatkan semua status berdasarkan tipe
export const getAllStatusByType = (type) => {
  if (STATUS_CONFIG[type]) {
    return Object.values(STATUS_CONFIG[type]);
  }
  return [];
};

// Default status untuk perawatan (yang paling sering digunakan)
export const DEFAULT_MAINTENANCE_STATUS = [
  STATUS_CONFIG.MAINTENANCE.SELESAI,
  STATUS_CONFIG.MAINTENANCE.DALAM_PENGERJAAN,
  STATUS_CONFIG.MAINTENANCE.MENUNGGU_PERBAIKAN,
  STATUS_CONFIG.MAINTENANCE.TERTUNDA,
  STATUS_CONFIG.MAINTENANCE.BATAL
]; 