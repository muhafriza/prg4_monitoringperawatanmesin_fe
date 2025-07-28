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

  if (isLoading) return <Loading />;

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
          {total === null ? (
            <>Tidak Ada Laporan Kerusakan saat ini.</>
          ) : (
            <>
              <p>Halo {nama}! Ada {total} Laporan Kerusakan yang harus ditangani cek menu perawatan Korektif.</p>              
            </>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header bg-primary lead fw-medium text-white p-4">
          Daftar Mesin yang sering Mengalami Kerusakan
        </div>
        <div className="card-body lead p-4">
          <Table data={mesinData} />
          <Paging
            pageSize={PAGE_SIZE}
            pageCurrent={currentFilter.page}
            totalData={mesinData.length > 0 ? mesinData[0]["Count"] : 0}
            navigation={handleSetCurrentPage}
          />
        </div>
      </div>
    </>
  );
}
