import { lazy } from "react";

const Beranda = lazy(() => import("../page/beranda/Root"));
const Notifikasi = lazy(() => import("../page/notifikasi/Root"));
const MasterPelanggan = lazy(() => import("../page/master-pelanggan/Root"));
const MasterProduk = lazy(() => import("../page/master-produk/Root"));
const MasterProses = lazy(() => import("../page/master-proses/Root"));
const MasterKursProses = lazy(() => import("../page/master-kurs-proses/Root"));
const MasterAlatMesin = lazy(() => import("../page/master-alat-mesin/Root"));
const MasterOperator = lazy(() => import("../page/master-operator/Root"));
const MasterSparepart = lazy(() => import("../page/master-sparepart/Root"));
const MasterUser = lazy(() => import ("../page/master-user/Root"));

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
const master_user = lazy(() => import("../page/master-user/Root"));


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
    path: "/master_mesin",
    element: <MasterMesin />,
  },
  {
    path: "/master_user",
    element: <MasterUser />,
  }
];

export default routeList;
