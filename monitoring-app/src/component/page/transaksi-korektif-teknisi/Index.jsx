import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import Swal from "sweetalert2";
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
    kor_id_perawatan_korektif: null,
    mes_id_mesin: null,
    kor_tanggal_penjadwalan: null,
    kor_tanggal_aktual: null,
    kor_tanggal_pengajuan: null,
    kor_deskripsi_kerusakan: null,
    kor_tindakan_perbaikan: null,
    kor_sparepart_diganti: null,
    kor_status_pemeliharaan: 0,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[kor_tanggal_pengajuan] asc", Text: "Tanggal Pengajuan [↑]" },
  { Value: "[kor_tanggal_pengajuan] desc", Text: "Tanggal Pengajuan [↓]" },
  { Value: "[kor_tanggal_aktual] asc", Text: "Tanggal Aktual [↑]" },
  { Value: "[kor_tanggal_aktual] desc", Text: "Tanggal Aktual [↓]" },
];

const dataFilterStatus = [
  { Value: "Dalam Pengerjaan", Text: "Dalam Pengerjaan" },
  { Value: "Pending", Text: "Pending" },
  { Value: "Selesai", Text: "Selesai" },
];

export default function index({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
<<<<<<< HEAD
    sort: "[kor_tanggal_pengajuan] desc",
    status: "Pending", // Default ke status "Belum Selesai"
=======
    sort: "[kor_status_pemeliharaan] asc",
    status: "", // Default ke status "Belum Selesai"
>>>>>>> Commit-All
    itemPerPage: 10,
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
      sort: searchFilterSort.current.value,
      status: searchFilterStatus.current.value,
    }));
    console.log(currentFilter);
  }

  function handleSetStatus(id) {
    setIsLoading(true);
    setIsError(false);
    UseFetch(API_LINK + "Korektif/GetDetailKorektif", {
      kor_id_perawatan_korektif: id,
    })
      .then((data) => {
        if (data === "ERROR" || data.length === 0) setIsError(true);
        else {
          Swal.fire(
            "Sukses",
            "Status berhasil diubah menjadi " +
              (data[0].kor_status_pemeliharaan === 1
                ? "Selesai"
                : "Belum Selesai"),
            "success"
          );
          handleSetCurrentPage(currentFilter.page);
        }
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(
          API_LINK + "Korektif/DetailPerawatanKorektif",
          currentFilter
        );
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Aksi: ["Detail", "Edit"],
            Alignment: [
              "center",
              "center",
              "center",
              "center",
              "left",
              "center",
              "left",
              "center",
              "center",
            ],
          }));
          setCurrentData(formattedData);
        }
      } catch {
        setIsError(true);
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
              message="Terjadi kesalahan: Gagal mengambil data Perawatan Korektif."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            <Input
              ref={searchQuery}
              forInput="pencarianPerawatan"
              placeholder="Cari Deskripsi Kerusakan"
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
                defaultValue="[kor_tanggal_penjadwalan] asc"
              />
              <DropDown
                ref={searchFilterStatus}
                forInput="ddStatus"
                label="Status"
                type="none"
                arrData={dataFilterStatus}
                defaultValue="0"
              />
            </Filter>
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
