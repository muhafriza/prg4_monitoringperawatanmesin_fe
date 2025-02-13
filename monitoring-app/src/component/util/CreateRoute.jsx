import { lazy } from "react";
import PerawatanPreventifTeknisi from "../page/perawatan-preventif-teknisi/Root";

const Beranda = lazy(() => import("../page/beranda/Root"));
const Notifikasi = lazy(() => import("../page/notifikasi/Root"));
const MasterPelanggan = lazy(() => import("../page/master-pelanggan/Root"));
const MasterProduk = lazy(() => import("../page/master-produk/Root"));
const MasterProses = lazy(() => import("../page/master-proses/Root"));
const MasterKursProses = lazy(() => import("../page/master-kurs-proses/Root"));
const MasterAlatMesin = lazy(() => import("../page/master-alat-mesin/Root"));
const MasterOperator = lazy(() => import("../page/master-operator/Root"));
const MasterSparepart = lazy(() => import("../page/master-sparepart/Root"));
const MasterUser = lazy(() => import("../page/master-user/Root"));
const JadwalPerawatan = lazy(() =>
  import("../page/jadwal_perawatan-rutin/Root")
);
const LaporanKerusakan = lazy(() =>
  import("../page/laporan-kerusakan-teknisi/Root")
);
const MasterMesin = lazy(() => import("../page/master-mesin/Root"));
const RiwayatPerawatanPreventif = lazy(() =>
  import("../page/riwayat_perawatan_preventif/Root")
);

const LaporanKerusakanAdmin = lazy(() =>
  import("../page/laporan-kerusakan-admin/Root")
);

const KorektifPic = lazy(() => import("../page/transaksi-korektif-pic/Root"));

const KorektifTeknisi = lazy(() =>
  import("../page/transaksi-korektif-teknisi/Root")
);

const PermintaanPelanggan = lazy(() =>
  import("../page/permintaan-pelanggan/Root")
);
const RencanaAnggaranKegiatan = lazy(() =>
  import("../page/rencana-anggaran-kegiatan/Root")
);
const SuratPenawaran = lazy(() => import("../page/surat-penawaran/Root"));
const SuratPerintahKerja = lazy(() =>
  import("../page/surat-perintah-kerja/Root")
);

const routeList = [
  {
    path: "/",
    element: <Beranda />,
  },
  {
    path: "/notifikasi",
    element: <Notifikasi />,
  },
  {
    path: "/master_pelanggan",
    element: <MasterPelanggan />,
  },
  {
    path: "/master_produk",
    element: <MasterProduk />,
  },
  {
    path: "/master_proses",
    element: <MasterProses />,
  },
  {
    path: "/master_kurs_proses",
    element: <MasterKursProses />,
  },
  {
    path: "/master_alat_mesin",
    element: <MasterAlatMesin />,
  },
  {
    path: "/master_operator",
    element: <MasterOperator />,
  },
  {
    path: "/permintaan_pelanggan",
    element: <PermintaanPelanggan />,
  },
  {
    path: "/rencana_anggaran_kegiatan",
    element: <RencanaAnggaranKegiatan />,
  },
  {
    path: "/surat_penawaran",
    element: <SuratPenawaran />,
  },
  {
    path: "/surat_perintah_kerja",
    element: <SuratPerintahKerja />,
  },
  {
    path: "/master_sparepart",
    element: <MasterSparepart />,
  },
  {
    path: "/jadwal_perawatanrutin",
    element: <JadwalPerawatan />,
  },
  {
    path: "/master_mesin",
    element: <MasterMesin />,
  },
  {
    path: "/master_user",
    element: <MasterUser />,
  },
  
  {
    path: "/perawatan_korektif_teknisi",
    element: <LaporanKerusakan />,
  },
  {
    path: "/perawatan_preventif",
    element: <PerawatanPreventifTeknisi />,
  },
  {
    path: "/riwayat_preventif_admin",
    element: <RiwayatPerawatanPreventif />,
  },
  {
    path: "/perawatan_korektif_pic",
    element: <KorektifPic />,
  },

  {
    path: "/perawatan_korektif_teknisi",
    element: <KorektifTeknisi />,
  },
  {
    path: "/laporan_kerusakan_admin_2",
    element: <LaporanKerusakanAdmin />,
  },
];

export default routeList;
