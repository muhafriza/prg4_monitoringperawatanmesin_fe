import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Bar, Doughnut, Pie } from "react-chartjs-2";


defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 25;
defaults.plugins.title.color = "black"

export default function BerandaIndex() {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

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


  useEffect(() => {
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
      <div className="card">
        <div className="card-header bg-warning text-white p-4">
          <span className="lead fw-medium">
            Selamat Datang di Sistem Monitoring Proses Perawatan Mesin
          </span>
        </div>
        <div className="card-body lead p-4">
          Sistem Informasi Produksi ini akan membantu Anda dalam mengelola
          proses produksi dengan lebih efisien.
          <br />
          Mari mulai dengan mengeksplorasi fitur-fitur yang ada dengan mengakses
          menu yang tersedia.
        </div>
      </div>
      <div className="row mx-0 my-2">
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Total Permintaan Pelanggan</div>
              <div className="h1">
                {formDataRef.current.countTotalPermintaan}
              </div>
            </div>
          </div>
        </div>
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
                    // ref={(ref) => (barChartRef.current = ref?.chartInstance)}
                    data={{
                      labels: ["A", "B", "C"],
                      datasets: [
                        {
                          label: "Revenue",
                          data: [10, 20, 30],
                          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                          borderColor: ["#FF6384", "#36A2EB", "#FFCE56"],
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
                          text: "Revenue Set"
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
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
                          text: "Sparepart Stok"
                        }
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
