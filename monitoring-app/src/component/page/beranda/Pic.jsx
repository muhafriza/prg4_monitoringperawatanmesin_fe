import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import { decryptId } from "../../util/Encryptor";
import Cookies from "js-cookie";

import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Bar, Doughnut, Pie } from "react-chartjs-2";

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 25;
defaults.plugins.title.color = "black";

const inisialisasiData = [
  {
    Key: 1,
    No: "WW",
    "Nama Mesin": "MSKKS SDSAD",
    Merk: "HONDA",
    UPT: "12 Jan 2023",
    Status: "Menungg",
    Count: 0,
  },
];

export default function BerandaPIC(onChangePage) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
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
  const upt = userInfo.upt;
  const [mesin, setmesin] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "Mesin/GetDataMesin",
          currentFilter
        );

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
          setmesin(formattedData);
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
        <div className="card-header bg-primary lead fw-medium text-white p-4">
          Daftar Mesin yang Aktif
        </div>
        {isLoading ? (
          <Loading />
        ) : (
          <div className="card-body p-4">
            <Table data={mesin} />
            <Paging
              pageSize={PAGE_SIZE}
              pageCurrent={currentFilter.page}
              totalData={mesin[0]["Count"]}
              navigation={handleSetCurrentPage}
            />
          </div>
        )}
      </div>
    </>
  );
}
