import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
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
import { formatDate } from "../../util/Formatting";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Start Date": null,
    "End Date": null,
    Period: null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Start Date] asc", Text: "Start Date [↑]" },
  { Value: "[Start Date] desc", Text: "Start Date [↓]" },
  { Value: "[End Date] asc", Text: "End Date [↑]" },
  { Value: "[End Date] desc", Text: "End Date [↓]" },
];

const dataFilterStatus = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function MasterPeriodIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Start Date] asc",
    status: "Aktif",
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
    Swal.fire({
      title: "Perhatian",
      text: "Yakin Ingin Mengubah Status Mesin ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Ubah Status",
    }).then((result) => {
      setIsLoading(true);
      setIsError(false);
      if (result.isConfirmed) {
        UseFetch(API_LINK + "MasterPeriod/SetStatusPeriod", {
          idSparepart: id,
        }).then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          Swal.fire({
            title: "Success!",
            text: "Status data Mesin berhasil diubah menjadi " + data[0].Status,
            icon: "success",
          });
          handleSetCurrentPage(currentFilter.page);
        });
      } else {
        setIsLoading(false);
      }
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(
          API_LINK + "MasterPeriod/GetPeriod",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            "Start Date": formatDate(value["Start Date"].split("T")[0], true),
            "End Date": formatDate(value["End Date"].split("T")[0], true),
            Aksi: ["Toggle", "Detail", "Edit"],
            Alignment: ["center", "center", "center", "right", "center", "center"],
          }));
          setCurrentData(formattedData);
        }
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  return (
    <>
      
      {isError.error && (
        <div className="flex-fill ">
          <Alert
            type="danger"
            message={isError.message}
            handleClose={() => setIsError({ error: false, message: "" })}
          />
        </div>
      )}
      <div className="flex-fill">
        <div className="input-group">
          <Button
            iconName="add"
            label="Tambah"
            classType="success"
            onClick={() => onChangePage("add")}
          />
          <Input
            ref={searchQuery}
            forInput="pencarianPeriod"
            placeholder="Search"
          />
          <Button
            iconName="search"
            classType="primary px-3"
            title="Search"
            onClick={handleSearch}
          />
          <Filter>
            <DropDown
              ref={searchFilterSort}
              forInput="ddUrut"
              label="Sort By"
              type="none"
              arrData={dataFilterSort}
              defaultValue="[Start Date] asc"
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
      <div className="mt-3 mb-5">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="table-responsive">
            <Table
              data={currentData}
              onToggle={handleSetStatus}
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
    </>
  );
}