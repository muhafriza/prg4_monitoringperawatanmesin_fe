import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Table from "../../part/Table";
import Swal from "sweetalert2";
import Paging from "../../part/Paging";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { decryptId } from "../../util/Encryptor";

import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Bar, Doughnut, Pie } from "react-chartjs-2";

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 25;
defaults.plugins.title.color = "black";

export default function BerandaTeknisi() {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
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
  const [mesinData, setmesinData] = useState([]);
  const [total, setTotal] = useState(null);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "",
    status: "",
    itemPerPage: 10,
  });

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
  const userInfo = getUserInfo();
  const nama = userInfo.nama;

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "Korektif/getKerusakanTerbanyak",
          currentFilter
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data dashboard.");
        } else {
          const formattedData = data.map((item) => ({
            ...item,
            Alignment: ["center", "center", "center", "center", "center"],
          }));
          setmesinData(formattedData);
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
          API_LINK + "Korektif/TotalLaporanKerusakanPending"
        );

        if (!data || data.length === 0 || data[0].total === null) {
          setTotal(null);
        } else {
          setTotal(data[0].total);
        }
      } catch (error) {
        setIsError(true);
        console.log("Format Data Error: " + error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  const FetchLaporanKerusakan = async () => {
    setIsLoading(true);

    try {
      const data = await UseFetch(
        API_LINK + "Korektif/TotalLaporanKerusakanByUPT"
      );
      console.log("BY UPT: ", data);

      if (data === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal mengambil data Laporan Kerusakan"
        );
      } else {
        // setKorektifByUPT(data);

        // Cek jika data kosong atau tidak ada
        if (!data || data.length === 0) {
          setpieChart({
            labels: ["Belum ada laporan kerusakan"],
            datasets: [
              {
                data: [1],
                backgroundColor: ["#E5E7EB"], // Abu-abu terang
                borderColor: ["#9CA3AF"],
                borderWidth: 1,
              },
            ],
          });
          return; // Return di sini sudah benar karena di dalam fungsi
        }

        // Filter data yang memiliki nilai > 0
        const validData = data.filter((item) => item.Count_Per_Upt > 0);

        // Jika semua data bernilai 0 atau tidak valid
        if (validData.length === 0) {
          setpieChart({
            labels: ["Belum ada laporan kerusakan"],
            datasets: [
              {
                data: [1],
                backgroundColor: ["#10B981"], // Hijau untuk indikasi positif
                borderColor: ["#059669"],
                borderWidth: 1,
              },
            ],
          });
        } else {
          // Proses data normal
          const labels = validData.map((item) => item.Nama_UPT);
          const values = validData.map((item) => item.Count_Per_Upt);
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
      }
    } catch (error) {
      window.scrollTo(0, 0);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));

      // Set chart dengan pesan error
      setpieChart({
        labels: ["Error loading data"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#EF4444"], // Merah untuk error
            borderColor: ["#DC2626"],
            borderWidth: 1,
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    FetchLaporanKerusakan();
  }, []);

  if (isLoading) return <Loading />;

  const labels = mesinData.map((item) => item["Nama Mesin"]);
  const uptList = [...new Set(mesinData.map((item) => item.UPT))];

  // palet warna tetap (bukan random) biar konsisten
  const palette = [
    "#4e79a7",
    "#f28e2b",
    "#e15759",
    "#76b7b2",
    "#59a14f",
    "#edc948",
    "#b07aa1",
    "#9c755f",
    "#bab0ab",
  ];

  const datasets = uptList.map((upt, i) => ({
    label: upt, // legend per UPT
    data: mesinData.map((item) => (item.UPT === upt ? item.Jumlah : null)),
    backgroundColor: palette[i % palette.length],
    borderWidth: 1,
  }));

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}

      {/* Kondisi jika total null, maka ubah warna dan teks */}
      <div className="card">
        <div
          className={`card-header lead fw-medium p-4 ${
            total === null ? "bg-primary" : "bg-warning"
          } text-white`}
        >
          INFORMASI
        </div>
        <div className="card-body lead p-4">
          {total === null || total === 0 ? (
            <>Tidak Ada Laporan Kerusakan saat ini.</>
          ) : (
            <>
              <p>
                Halo {nama}! Ada {total} Laporan Kerusakan yang harus ditangani
                cek menu perawatan Korektif.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mt-3 border">
            <div className="card-body bg-gradient rounded-2 text-white">
              <div style={{ width: "100%", height: "500px" }}>
                <Bar
                  data={{ labels, datasets }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: "top" },
                      title: {
                        display: true,
                        text: "Daftar Mesin yang Sering Mengalami Kerusakan",
                      },
                      tooltip: {
                        callbacks: {
                          // title default = Nama Mesin (label X)
                          label: (ctx) => [
                            `UPT: ${ctx.dataset.label}`,
                            `Jumlah Kerusakan: ${ctx.parsed.y}`,
                          ],
                        },
                      },
                    },
                    scales: {
                      x: {
                        stacked: true,
                        title: {
                          display: true,
                          text: "Nama Mesin",
                        },
                      },
                      y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { precision: 0 },
                        title: {
                          display: true,
                          text: "Jumlah Kerusakan",
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
              <div style={{ width: "100%", height: "500px" }}>
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
    </>
  );
}
