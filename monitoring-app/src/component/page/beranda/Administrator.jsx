import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Table from "../../part/Table";

import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Bar, Doughnut, Pie } from "react-chartjs-2";

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 25;
defaults.plugins.title.color = "black";

const inisialisasiData = [
  {
    Key: null,
    No: 1,
    "Nama Sparepart": "MSKKS SDSAD",
    Merk: "HONDA",
    "Tanggal Masuk": "12 Jan 2023",
    Stok: 23,
    Status: "Menungg",
    Aksi: null,
    Count: 0,
  },
];

export default function BerandaAdministrator() {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);

  const formDataRef = useRef({
    countTotalPermintaan: 0,
    countTerlambat: 0,
    countBatal: 0,
    countSelesai: 0,
    countMenungguAnalisa: 0,
    countBelumDibuatRAK: 0,
    countBelumDibuatPenawaran: 0,
    countDalamProsesNegosiasi: 0,
    countBelumDibuatSPK: 0,
    countDalamProsesProduksi: 0,
    countDalamProsesQC: 0,
    countDalamProsesDelivery: 0,
  });


  function formatDate(dateString, format) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.getMonth(); // Get month as number (0-based)
    const year = date.getFullYear();

    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    switch (format) {
      case "DD/MM/YYYY":
        return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(
          2,
          "0"
        )}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
      case "D MMMM YYYY":
        return `${day} ${months[month]} ${year}`;
      default:
        return dateString;
    }
  }

  

  const [sparepartStok, setSparepartStok] = useState([]);

  useEffect(() => {
    console.log(inisialisasiData);
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "Utilities/GetDataCountingDashboard",
          {}
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data dashboard.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
          const formattedData = data.map((value) => {
            const { tanggal_masuk,Deskripsi,Status, ...rest } = value; // Menghapus tanggal_masuk
            return {
              ...rest, // Menyalin sisa properti
              "Tanggal Masuk": formatDate(tanggal_masuk, "D MMMM YYYY"),
              Status: Status,
              Aksi: ["Toggle", "Detail", "Edit"],
              Alignment: [
                "center",
                "left",
                "left",
                "right",
                "center",
                "center",
                "center",
              ],
            };
          });
          // setCurrentData(formattedData);  
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }

      try {
        const dataSP = await UseFetch(
          API_LINK + "TransaksiPreventif/getStokSparepart",
          { status: "Aktif" }
        );

        if (dataSP === "ERROR" || dataSP.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data stok.");
        } else {
          setSparepartStok(dataSP);
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="row row-equal-height mx-0 my-2">
        {/* Komponen Laporan Kerusakan */}
        <div className="col-lg-2">
          <div className="card bg-primary card-equal-height mt-3 border-0 text-white">
            <div className="card-body bg-gradient rounded-2">
              <div className="lead fw-medium">Laporan Kerusakan</div>
            </div>
            <div className="card-footer d-flex align-items-center justify-content-between h1 border-0">
              <span>{formDataRef.current.countTotalPermintaan}</span>
              <i className="bi bi-tools ms-2"></i>
            </div>
          </div>
        </div>

        {/* Komponen Selamat Datang */}
        <div className="col-lg-10">
          <div className="card card-equal-height mt-3 border">
            <div className="card-header bg-primary text-white pt-3 pb-3 px-3">
              <span className="lead fw-medium">
                Selamat Datang di Sistem Monitoring Proses Perawatan Mesin
              </span>
            </div>
            <div className="card-body lead fw-small px-3 mb-3">
              <Table data={inisialisasiData} />
            </div>
          </div>
        </div>
      </div>

      <div className="row mx-0 my-2">
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-dark-subtle bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Terlambat (In Progress)</div>
              <div className="h1">{formDataRef.current.countTerlambat}</div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-danger bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Batal</div>
              <div className="h1">{formDataRef.current.countBatal}</div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 mb-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-dark-subtle bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Selesai (In Progress)</div>
              <div className="h1">{formDataRef.current.countSelesai}</div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-8">
            <div className="card mt-3 border">
              <div className="card-body bg-gradient rounded-2 text-white">
                <div style={{ width: "100%", height: "300px" }}>
                  <Bar
                    data={{
                      labels: sparepartStok.map(
                        (item) => item.spa_nama_sparepart
                      ),
                      datasets: [
                        {
                          label: "Stok Sparepart", // Label utama dataset
                          data: sparepartStok.map((item) => item.spa_stok),
                          backgroundColor: sparepartStok.map(
                            () =>
                              `rgba(${Math.floor(Math.random() * 255)}, 
                  ${Math.floor(Math.random() * 255)}, 
                  ${Math.floor(Math.random() * 255)}, 0.7)`
                          ),
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true, // Menampilkan legend
                          position: "top",
                          align: "center",
                          labels: {
                            boxWidth: 20,
                            padding: 10,
                            font: {
                              size: 12,
                            },
                            generateLabels: (chart) => {
                              const dataset = chart.data.datasets[0]; // Dataset pertama
                              return chart.data.labels.map((label, index) => ({
                                text: label, // Nama berdasarkan spa_nama_sparepart
                                fillStyle: dataset.backgroundColor[index], // Warna legend
                                hidden: dataset.data[index] === null, // Sembunyikan jika data null
                                index: index,
                              }));
                            },
                          },
                          onClick: (e, legendItem, legend) => {
                            const index = legendItem.index;
                            const chart = legend.chart;
                            const dataset = chart.data.datasets[0];

                            // Toggle visibility
                            dataset.data[index] =
                              dataset.data[index] === null
                                ? sparepartStok[index].spa_stok // Tampilkan ulang jika tersembunyi
                                : null; // Sembunyikan data

                            chart.update();
                          },
                        },
                        title: {
                          display: true,
                          text: "Stok Sparepart",
                          font: {
                            size: 16,
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Jumlah Stok",
                            font: {
                              size: 14,
                            },
                          },
                        },
                        x: {
                          title: {
                            display: true,
                            text: "Nama Sparepart",
                            font: {
                              size: 14,
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card mt-3 border ">
              <div className="card-body bg-gradient rounded-2 text-white">
                <div style={{ width: "100%", height: "300px" }}>
                  <Pie
                    // ref={(ref) =>
                    //   (doughnutChartRef.current = ref?.chartInstance)
                    // }
                    data={{
                      labels: ["Oil Tonna", "Coolant", "Tool Holder"],
                      datasets: [
                        {
                          data: [524, 364, 75],
                          backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
                          borderColor: ["#36A2EB", "#FF6384", "#FFCE56"],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: "top",
                        },
                        title: {
                          text: "Sparepart Stok",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-12"></div>

        {/* <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Belum Dibuat RAK</div>
              <div className="h1">
                {formDataRef.current.countBelumDibuatRAK}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Belum Dibuat Penawaran</div>
              <div className="h1">
                {formDataRef.current.countBelumDibuatPenawaran}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Dalam Proses Negosiasi</div>
              <div className="h1">
                {formDataRef.current.countDalamProsesNegosiasi}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Belum Dibuat SPK</div>
              <div className="h1">
                {formDataRef.current.countBelumDibuatSPK}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Dalam Proses Produksi</div>
              <div className="h1">
                {formDataRef.current.countDalamProsesProduksi}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-dark-subtle bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">
                Dalam Proses QC (In Progress)
              </div>
              <div className="h1">{formDataRef.current.countDalamProsesQC}</div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-dark-subtle bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">
                Dalam Proses Delivery (In Progress)
              </div>
              <div className="h1">
                {formDataRef.current.countDalamProsesDelivery}
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
}
