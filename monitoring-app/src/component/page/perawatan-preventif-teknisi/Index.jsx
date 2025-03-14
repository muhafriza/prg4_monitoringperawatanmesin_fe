import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import Icon from "../../part/Icon";

const inisialisasiData = [
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

const dataFilterSort = [
  { Value: "[pre_tanggal_penjadwalan] asc", Text: "Tanggal Penjadwalan [↑]" },
  { Value: "[pre_tanggal_penjadwalan] desc", Text: "Tanggal Penjadawalan [↓]" },
];

const dataFilterStatus = [
  { Value: "Menunggu Perbaikan", Text: "Menunggu Perbaikan" },
  { Value: "Dalam Pengerjaan", Text: "Dalam Pengerjaan" },
  { Value: "Tertunda", Text: "Tertunda" },
  { Value: "Selesai", Text: "Selesai" },
  { Value: "Batal", Text: "Batal" },
];

export default function PerawatanKorektif({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [preventif, setPreventif] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[pre_tanggal_penjadwalan] asc",
    status: "",
    itemPerPage: 10,
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

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

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
        status: searchFilterStatus.current.value,
      };
    });
  }

  function handleSetStatus(id) {
    setIsLoading(true);
    setIsError(false);
    UseFetch(API_LINK + "MasterSparepart/SetStatusSparepart", {
      idSparepart: id,
    })
      .then((data) => {
        if (data === "ERROR" || data.length === 0) setIsError(true);
        else {
          SweetAlert(
            "Sukses",
            "Status data Sparepart berhasil diubah menjadi " + data[0].Status,
            "success"
          );
          handleSetCurrentPage(currentFilter.page);
        }
      })
      .then(() => setIsLoading(false));
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/GetDataPerawatanPreventifTeknisi",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          console.log(data);
          setPreventif(data);
          const formattedData = data.map((value) => {
            const {
              ID_Perawatan,
              id_mesin,
              UPT,
              Tanggal_Perawatan,
              Status_Pemeliharaan,
              Dibuat,
              TindakanPerbaikan,
              Nama_Mesin,
              ...rest
            } = value;
            let rowStyle=null;
            const aksi =
              Status_Pemeliharaan === "Selesai" && Status_Pemeliharaan === "Batal"
                ? ["Detail"]
                : ["Detail", "Edit"];
            const today = new Date();
            const jadwal = new Date(Tanggal_Perawatan);
            today.setHours(0, 0, 0, 0);
            jadwal.setHours(0, 0, 0, 0);

            if (Status_Pemeliharaan !== "Selesai" && Status_Pemeliharaan !== "Dalam Pengerjaan") {
              const diffInDays = Math.ceil((jadwal - today) / (1000 * 60 * 60 * 24));
              if(diffInDays < 0){
                rowStyle = { backgroundColor: "red", border: "3px solid red" };
              }else if(diffInDays === 1 || diffInDays === 0){
                rowStyle = { backgroundColor: "orange", border: "3px solid orange" };
              }
            }

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
              Aksi: aksi,
              rowStyle,
              Alignment: [
                "center",
                "CENTER",
                "left",
                "left",
                "left",
                "center",
                "center",
                "center",
              ],
            };
          });
          setCurrentData(formattedData);
        }
      } catch (error) {
        setIsError(true);
        console.log("Format Data Error: " + error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data Sparepart. "
            />
          </div>
        )}
        <div className="card">
          <div className="card-header bg-primary lead fw-medium text-white">
            Perawatan Preventif
          </div>
          <div className="card-body p-4">
            <div className="flex-fill">
              <div className="input-group">
                <Input
                  ref={searchQuery}
                  forInput="pencarianSparepart"
                  placeholder="Cari"
                />
                <Button
                  iconName="search"
                  classType="primary px-4"
                  title="Cari"
                  onClick={handleSearch}
                />
                <Filter>
                  <DropDown
                    ref={searchFilterSort}
                    forInput="ddUrut"
                    label="Urut Berdasarkan"
                    type="none"
                    arrData={dataFilterSort}
                    defaultValue="[spa_nama_sparepart] asc"
                  />
                  <DropDown
                    ref={searchFilterStatus}
                    forInput="ddStatus"
                    label="Status"
                    type="none"
                    arrData={dataFilterStatus}
                    defaultValue="Aktif"
                  />
                </Filter>
              </div>
            </div>
            <div className="mt-3">
              <div className="d-flex flex-column">
                <Table
                  onToggle={handleSetStatus}
                  onDetail={onChangePage}
                  onEdit={onChangePage}
                  data={currentData.map(({ rowStyle, ...rest }) => rest)}
                  rowStyles={(row, index) => currentData[index]?.rowStyle || {}}
                  />
                <Paging
                  pageSize={PAGE_SIZE}
                  pageCurrent={currentFilter.page}
                  totalData={currentData[0]["Count"]}
                  navigation={handleSetCurrentPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
