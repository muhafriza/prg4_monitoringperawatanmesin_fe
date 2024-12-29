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
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[mes_nama_mesin] asc", Text: "Nama Mesin [↑]" },
  { Value: "[mes_nama_mesin] desc", Text: "Nama Mesin [↓]" },
  { Value: "[mes_daya_mesin] asc", Text: "Daya Mesin [↑]" },
  { Value: "[mes_daya_mesin] desc", Text: "Daya Mesin [↓]" },
];

const dataFilterStatus = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function MasterMesin({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[mes_nama_mesin] asc",
    status: "Aktif",
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
  }

  function handleSetStatus(id) {
    setIsLoading(true);
    setIsError(false);
    UseFetch(API_LINK + "MasterMesin/SetStatusMesin", {
      mes_id_mesin: id,
    })
      .then((data) => {
        if (data === "ERROR" || data.length === 0) setIsError(true);
        else {
          SweetAlert(
            "Sukses",
            "Status data Mesin berhasil diubah menjadi " + data[0].Status,
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
          API_LINK + "MasterMesin/GetDataMesin",
          currentFilter
        );
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Aksi: ["Toggle", "Detail", "Edit"],
            Alignment: [
              "center",
              "center",
              "left",
              "left",
              "left",
              "right",
              "center",
              "center",
              "left",
              "center",
              "left",
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
              message="Terjadi kesalahan: Gagal mengambil data Mesin."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            <Button
              iconName="add"
              classType="success"
              label="Tambah"
              onClick={() => onChangePage("add")}
            />
            <Input
              ref={searchQuery}
              forInput="pencarianMesin"
              placeholder="Cari Nama Mesin"
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
                defaultValue="[mes_nama_mesin] asc"
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
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table
                data={currentData}
                onToggle={handleSetStatus}
                onDetail={onChangePage}
                onEdit={onChangePage}
                columns={[
                  { title: "Nama Mesin", key: "mes_nama_mesin", align: "left" },
                  { title: "Kondisi", key: "mes_kondisi_operasional", align: "left" },
                  { title: "No. Panel", key: "mes_no_panel", align: "left" },
                  { title: "Lab", key: "mes_lab", align: "left" },
                  { title: "Daya Mesin", key: "mes_daya_mesin", align: "right" },
                  { title: "Jumlah", key: "mes_jumlah", align: "center" },
                  { title: "Kapasitas", key: "mes_kapasitas", align: "center" },
                  { title: "Tipe", key: "mes_tipe", align: "center" },
                  { title: "Status", key: "mes_status", align: "center" },
                ]}
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
