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

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Nama Mesin": null,
    "Tanggal Perawatan": null,
    Tindakan: null,
    "Dikerjakan Oleh Oleh": null,
    Status: null,
    Aksi: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[pre_tanggal_penjadwalan] asc", Text: "Tanggal Penjadwalan [↑]" },
  { Value: "[pre_tanggal_penjadwalan] desc", Text: "Tanggal Penjadawalan [↓]" },
];

export default function RiwayatPreventif({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
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
        status: "",
      };
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "PTransaksiPreventif/GetDataPerawatanPreventifSelesai",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          console.log(data);
          const formattedData = data.map((value) => {
            const {
              ID_Perawatan,
              Tanggal_selesai,
              Status_Pemeliharaan,
              Dikerjakan_Oleh,
              TindakanPerbaikan,
              Nama_Mesin,
              ...rest
            } = value; // Menghapus tanggal_masuk
            return {
              ...rest,
              "ID Perawatan": ID_Perawatan,
              "Nama Mesin": Nama_Mesin,
              "Tindakan Perbaikan":
                TindakanPerbaikan == null ? "-" : TindakanPerbaikan,
              "Dikerjakan Oleh": Dikerjakan_Oleh == null ? "-" : Dikerjakan_Oleh,
              "Tanggal Selesai": formatDate(Tanggal_selesai, "D MMMM YYYY"),
              Status: Status_Pemeliharaan,
              Aksi: ["Detail", "Print"],
              Alignment: [
                "center",
                "center",
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
                defaultValue="[pre_tanggal_penjadwalan] asc"
              />
            </Filter>
            <Button
              iconName="file-export"
              classType="success px-4 ms-1"
              title="Cetak Laporan Perawatan Preventif"
              onClick={handleSearch}
            />
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table
                data={currentData}
                onDetail={onChangePage}
                onEdit={onChangePage}
              />
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData[0]["Count"]}
                navigation={handleSetCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
