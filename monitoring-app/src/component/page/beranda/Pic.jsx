import { useEffect, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import { decryptId } from "../../util/Encryptor";
import Cookies from "js-cookie";
import {
  FaTools,
  FaShieldAlt,
  FaExclamationTriangle,
  FaSyncAlt,
} from "react-icons/fa";

import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import CardSummary from "../../part/CardSummary";

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 25;
defaults.plugins.title.color = "black";

export default function BerandaPIC(onChangePage) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  // ambil user info dari cookie
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
  const upt = userInfo?.upt ?? "";

  const [mesin, setMesin] = useState([]);
  const [dataKerusakanMesin, setDataKerusakanMesin] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: upt,
    sort: "[mes_nama_mesin] asc",
    status: "Aktif",
    itemPerPage: 10,
  });

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  const FetchSummary = async () => {
    setIsLoading(true);
    try {
      const data = await UseFetch(
        API_LINK + "Korektif/GetSummaryPerawatanByUPT",
        { p1: upt }
      );

      if (!Array.isArray(data)) {
        setSummaryData([]);
      } else {
        setSummaryData(data);
      }
    } catch (error) {
      setIsError({ error: true, message: "Gagal ambil summary" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataMesin = async () => {
    setIsError({ error: false, message: "" });
    try {
      const data = await UseFetch(API_LINK + "Mesin/GetDataMesin", currentFilter);

      if (data === "ERROR" || data.length === 0) {
        throw new Error("Terjadi kesalahan: Gagal mengambil data mesin.");
      } else {
        const formattedData = data.map((value) => ({
          ...value,
          Alignment: [
            "center",
            "center",
            "left",
            "LEFT",
            "left",
            "LEFT",
            "LEFT",
            "LEFT",
            "center",
            "center",
          ],
        }));
        setMesin(formattedData);
      }
    } catch (error) {
      setIsError({ error: true, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataKerusakanTerbanyak = async () => {
    setIsError({ error: false, message: "" });
    try {
      const data = await UseFetch(
        API_LINK + "Korektif/GetKerusakanTerbanyakByUpt",
        { p1: upt }
      );

      if (data === "ERROR" || data.length === 0) {
        throw new Error("Terjadi kesalahan: Gagal mengambil data dashboard.");
      } else {
        setDataKerusakanMesin(data);
      }
    } catch (error) {
      setIsError({ error: true, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    FetchSummary();
    fetchDataKerusakanTerbanyak();
    fetchDataMesin();
  }, []);

  // === BAR CHART ===
  const labels = dataKerusakanMesin?.map((item) => item["Nama Mesin"]) || [];
  const values = dataKerusakanMesin?.map((item) => item["Jumlah"]) || [];

  // generate warna dinamis
  const colors = labels.map(
    (_, i) =>
      `hsl(${(i * 60) % 360}, 70%, 55%)` // beda warna tiap mesin
  );

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Jumlah Kerusakan per Mesin",
        data: values,
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false, position: "top" },
      title: { display: true, text: "Mesin Yang Sering Bermasalah" },
    },
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}

      <div className="container-fluid">
        <div className="row">
          <CardSummary
            title="Total Riwayat Kerusakan"
            value={summaryData[0]?.["Jumlah Laporan Kerusakan"] || 0}
            icon={<FaExclamationTriangle />}
            color="#dc3545"
          />
          <CardSummary
            title="Dalam Pengerjaan"
            value={summaryData[0]?.["Jumlah_Dalam_Pengerjaan"] || 0}
            icon={<FaSyncAlt />}
            color="#ffc107"
          />
          <CardSummary
            title="Preventif Dalam Pengerjaan"
            value={summaryData[0]?.["Preventif Dalam Pengerjaan"] || 0}
            icon={<FaShieldAlt />}
            color="#17a2b8"
          />
          <CardSummary
            title="Korektif Dalam Pengerjaan"
            value={summaryData[0]?.["Korektif Dalam Pengerjaan"] || 0}
            icon={<FaTools />}
            color="#28a745"
          />
        </div>
      </div>

    {/* BAR CHART */}
    <div className="card mt-2">
      <div className="card-body chart-container" style={{ width: "100%", height: "400px" }}>
        <Bar 
          data={chartData} 
          options={{
            ...chartOptions,
            responsive: true,
            maintainAspectRatio: false
          }} 
        />
      </div>
    </div>

      {/* TABEL MESIN */}
      <div className="card mt-4">
        <div className="card-header bg-primary lead fw-medium text-white p-4">
          Daftar Mesin yang Aktif
        </div>
        <div className="card-body p-4">
          <Table data={mesin} />
          <Paging
            pageSize={PAGE_SIZE}
            pageCurrent={currentFilter.page}
            totalData={mesin[0]?.["Count"] || 0}
            navigation={handleSetCurrentPage}
          />
        </div>
      </div>
    </>
  );
}
