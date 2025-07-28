import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Table from "../../part/Table";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import Paging from "../../part/Paging";

import Paging from "../../part/Paging";

import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import { DateTime } from "luxon";
import Swal from "sweetalert2";

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 25;
defaults.plugins.title.color = "black";

const inisialisasiData = [
  {
    Key: 1,
    No: "WW",
    "Nama Sparepart": "MSKKS SDSAD",
    Merk: "HONDA",
    "Tanggal Masuk": "12 Jan 2023",
    Stok: 23,
    Status: "Menungg",
    Count: 0,
  },
];
const inisialisasiDataProses = [
  {
    Key: null,
    No: null,
    "Nama Mesin": null,
    "Tanggal Perawatan": null,
    Tindakan: null,
    "Dibuat Oleh": null,
    Status: null,
    Aksi: null,
    Count: 0,
  },
];

export default function BerandaAdministrator() {
  const getUserInfo = () => {
      const encryptedUser = Cookies.get("activeUser");
      if (encryptedUser) {
        try {
          const userInfo = JSON.parse(decryptId(encryptedUser));
          return userInfo;
        } catch (error) {
          console.error("Failed to decrypt user info:", error);
          return null;
        }
      }
      return null;
    };
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [dataKerusakanTerahir, setDataKerusakanTerahir] =
    useState(inisialisasiDataProses);
  const [dataProsesPerbaikanPRE, setDataProsesPerbaikanPRE] =
    useState(inisialisasiData);
  const [dataProsesPerbaikanKOR, setDataProsesPerbaikanKOR] = useState(
    inisialisasiDataProses
  );
  const datenow = new Date().toLocaleDateString("sv-SE");
  const date = new Date().toISOString().split("T")[0];
  const [filterKerusakanTerakhir, setfilterKerusakanTerakhir] = useState({
    p1: 1,
    p2: "kor_tanggal_pengajuan",
    p3: 2,
  });
  const [filterDataProsesKOR, setfilterDataProsesKOR] = useState({
    page: 1,
    query: datenow,
    sort: "kor_tanggal_pengajuan",
    status: 'Dalam Pengerjaan',
    itemPerPage: 1000,
  });
  const [filterDataProsesPRE, setfilterDataProsesPRE] = useState({
    page: 1,
    query: datenow,
    sort: "pre_idPerawatan_preventif",
    status: 'Dalam Pengerjaan',
    itemPerPage: 1000,
  });
  const [laporanKerusakan, setLaporanKerusakan] = useState();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setfilterKerusakanTerakhir((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
    setfilterDataProsesKOR((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
    setfilterDataProsesPRE((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  const userInfo = getUserInfo();
  console.log("Inii user info", userInfo);

  // const peran = userInfo.peran;

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
  const [korektifbyUPT, setKorektifByUPT] = useState([]);
  const [pieChart, setpieChart] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#36A2EB",
          "#FF6384",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
        borderColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"],
        borderWidth: 1,
      },
    ],
  });
  const getRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        console.log("SEKARANG " + datenow);
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/GetDataPerawatanPreventifDashboard",
          filterDataProsesPRE
        );
        console.log("ini Data Proses");
        console.log(data);

        if (data.length == 0) {
          setDataProsesPerbaikanPRE(inisialisasiDataProses);
        } else {
          console.log(data);
          const formattedData = data.map((value) => {
            const {
              ID_Perawatan,
              Tanggal_Perawatan,
              Status_Pemeliharaan,
              Dibuat,
              UPT,
              TindakanPerbaikan,
              Nama_Mesin,
              id_mesin,
              ...rest
            } = value;
            return {
              ...rest,
              "ID Perawatan": ID_Perawatan,
              "ID Mesin": id_mesin,
              "Nama Mesin": Nama_Mesin,
              UPT: UPT,
              "Tindakan Perbaikan":
                TindakanPerbaikan == null ? "-" : TindakanPerbaikan,
              "Dibuat Oleh": Dibuat == null ? "-" : Dibuat,
              "Jadwal Perawatan": formatDate(Tanggal_Perawatan, "D MMMM YYYY"),
              Status: Status_Pemeliharaan,
              Alignment: [
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
              ],
            };
          });
          setDataProsesPerbaikanPRE(formattedData);
        }
      } catch (error) {
        setIsError(true);
        console.log("Format Data Error: " + error);
      } finally {
        setIsLoading(false);
      }

      try {
        const data = await UseFetch(
          API_LINK + "Korektif/getKorektifNOW",
          filterDataProsesKOR
        );
        console.log("ini Data Proses KOREKTIF: ", data);

        if (data.length == 0) {
          setDataProsesPerbaikanKOR(inisialisasiDataProses);
        } else {
          const formattedData = data.map((value) => {
            const {
              ["Tanggal Pengajuan"]: tanggal,
              ["Status Pemeliharaan"]: status,
              ...rest
            } = value;

            return {
              ...rest,
              "Tanggal Pengajuan": formatDate(
                tanggal.split("T")[0],
                "D MMMM YYYY"
              ),
              Status: status,
              Alignment: [
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
              ],
            };
          });
          setDataProsesPerbaikanKOR(formattedData);
        }
      } catch (error) {
        setIsError(true);
        console.log("Format Data Error: " + error);
      } finally {
        setIsLoading(false);
      }

      try {
        const data = await UseFetch(
          API_LINK + "Korektif/TotalLaporanKerusakanPending"
        );
        console.log("total kerusakan", data[0].total);

        if (!data) {
          Swal.fire(
            "Error",
            "Laporan Kerusakan Pending tidak ditemukan",
            "error"
          );
        } else {
          setLaporanKerusakan(data[0].total);
        }
      } catch (error) {
        setIsError(true);
        console.log("Format Data Error: " + error);
      } finally {
        setIsLoading(false);
      }

      try {
        const dataSP = await UseFetch(
          API_LINK + "TransaksiPreventif/getStokSparepart",
          { status: "Aktif" }
        );
        console.log(dataSP);

        if (dataSP === "ERROR" || dataSP.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data stok.");
        } else {
          const formattedData = dataSP.map((value) => ({
            ...value,
            Alignment: [
              "center",
              "center",
              "center",
              "center",
              "center",
              "center",
            ],
          }));
          setSparepartStok(formattedData);
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
        const data = await UseFetch(
          API_LINK + "Korektif/KerusakanTerakhirTerjadi",
          filterKerusakanTerakhir
        );
        
        if (data === "ERROR" || data.length === 0) {
          console.log("TIDAK ADA LAPORAN KERUSAKAN 7 HARI TERAKHIR: ",data );
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Alignment: [
              "center",
              "center",
              "center",
              "center",
              "center",
              "center",
              "center",
              "center",
            ],
          }));
          setDataKerusakanTerahir(formattedData);
          console.log("setDataKerusakanTerahir", dataKerusakanTerahir);
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
        const data = await UseFetch(
          API_LINK + "Korektif/TotalLaporanKerusakanByUPT"
        );
        console.log("BY UPT: ", data);

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data stok.");
        } else {
          setKorektifByUPT(data);
          const labels = data.map((item) => item.Nama_UPT);
          const values = data.map((item) => item.Count_Per_Upt);
          const colors = labels.map(() => getRandomColor());
          setpieChart({
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1,
              },
            ],
          });
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
    console.log("PA", dataKerusakanTerahir);
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
      <div className="row row-equal-height mx-0 my-2 mb-4">
        {/* Komponen Laporan Kerusakan */}
        <div
          className="col-lg-2"
          // style={{ height: "30vh" }}
        >
          <div className="card bg-primary card-equal-height mt-3 border-0 text-white">
            <div className="card-body bg-gradient rounded-2">
              <div className="lead fw-medium">Laporan Kerusakan</div>
            </div>
            <div className="card-footer bg-primary d-flex align-items-center justify-content-between h1 border-0">
              <span>{laporanKerusakan}</span>
              <i className="bi bi-tools ms-2"></i>
            </div>
          </div>
        </div>

        {/* Komponen Selamat Datang */}
        <div className="col-lg-10">
          <div className="card mt-3 border">
            <div className="card-header bg-danger text-center text-white pt-3 pb-3 px-3">
              <span className="lead fw-medium">
                Kerusakan yang terakhir terjadi
              </span>
            </div>
            <div className="card-body fw-small px-3 mb-3">
              <Table data={dataKerusakanTerahir} />
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={filterKerusakanTerakhir.p1}
                totalData={dataKerusakanTerahir[0]["Count"]}
                navigation={handleSetCurrentPage}
              />
            </div>
            <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData[0]["Count"]}
                navigation={handleSetCurrentPage}
              />
          </div>
        </div>
      </div>

      <div className="my-2">
        <div className="card card-equal-height border">
          <div className="card-header bg-primary text-center text-white pt-3 pb-3 px-3">
            <span className="lead fw-medium">
              Pelaksanaan Proses Perbaikan Preventif
            </span>
          </div>
          <div className="card-body fw-small">
            <Table
              data={
                dataProsesPerbaikanPRE != null
                  ? dataProsesPerbaikanPRE
                  : inisialisasiData
              }
            />
            <Paging
              pageSize={PAGE_SIZE}
              pageCurrent={filterDataProsesPRE.p1}
              totalData={filterDataProsesPRE["Count"]}
              navigation={handleSetCurrentPage}
            />
          </div>
        </div>
        <div className="card card-equal-height border mt-4">
          <div className="card-header bg-primary text-center text-white pt-3 pb-3 px-3">
            <span className="lead fw-medium">
              Pelaksanaan Proses Perbaikan Korektif
            </span>
          </div>
          <div className="card-body fw-small">
            <Table
              data={
                dataProsesPerbaikanKOR != null
                  ? dataProsesPerbaikanKOR
                  : inisialisasiData
              }
            />
            <Paging
              pageSize={PAGE_SIZE}
              pageCurrent={filterDataProsesKOR.p1}
              totalData={filterDataProsesKOR["Count"]}
              navigation={handleSetCurrentPage}
            />
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
                          text: "Stok Sparepart yang Menipis",
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
                    data={pieChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: "top",
                        },
                        title: {
                          display: true,
                          text: "Riwayat Kerusakan bagian UPT",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
