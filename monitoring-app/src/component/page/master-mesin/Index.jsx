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
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

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

export default function MasterMesinIndex({ onChangePage }) {
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
  const [dataExport, setDataExport] = useState([]);

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  // Handle page changes
  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  // Handle search
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

  // Handle changing the machine's status
  const handleSetStatus = (id) => {
    console.log("A",currentData);
    setIsError(false);

    Swal.fire({
      title: "Warning",
      html: `Yakin ingin mengubah status pengguna ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "YA",
      cancelButtonText: "BATAL",
    }).then((confirmation) => {
      if (confirmation.isConfirmed) {
        setIsLoading(true);
        // Mengganti async/await dengan promise .then()
        UseFetch(API_LINK + "Mesin/SetStatusMesin", {
          mes_id_mesin: id,
        })
          .then((response) => {
            // Validasi respons dari API
            if (response === "ERROR" || !response || response.length === 0) {
              setIsError(true);
              SweetAlert("Error", "Gagal mengubah status pengguna.", "error");
              setIsLoading(false);
            } else {
              SweetAlert(
                "Sukses",
                `Status data Mesin berhasil diubah menjadi ${response[0].Status}`,
                "success"
              );
              setIsLoading(false);
              handleSetCurrentPage(currentFilter.page); // Refresh data setelah berhasil
            }
          })
          .catch((error) => {
            setIsError(true);
            SweetAlert(
              "Error",
              "Terjadi kesalahan saat mengubah status pengguna.",
              "error"
            );
            console.error("Error in handleSetStatus:", error);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false); // Jika user memilih "BATAL", hentikan loading
      }
    });
  };

  const exportToExcel = async () => {
    if (!dataExport || dataExport.length === 0) {
      console.log(dataExport);
      Swal.fire("Gagal", "Tidak ada data untuk dieksport!", "error");
      return;
    }

    // 1. Buat workbook dan worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Mesin");

    // 2. Tambahkan header dengan styling
    const headers = Object.keys(dataExport[0]);
    const headerRow = worksheet.addRow(headers);

    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "0074cc" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      // Atur ukuran kolom berdasarkan header
      worksheet.getColumn(colNumber).width = headers[colNumber - 1].length + 5;
    });

    // 3. Tambahkan data dengan style yang seragam
    dataExport.forEach((item) => {
      const rowData = headers.map((key) =>
        item[key] === null || item[key] === undefined ? "-" : item[key]
      );
      const row = worksheet.addRow(rowData);

      row.eachCell((cell, colNumber) => {
        // Terapkan border ke setiap sel
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // Atur alignment center untuk semua sel
        cell.alignment = { horizontal: "center", vertical: "middle" };

        // Atur ukuran kolom berdasarkan panjang isi
        const column = worksheet.getColumn(colNumber);
        const cellLength = cell.value ? cell.value.toString().length : 10;
        column.width = Math.max(column.width || 10, cellLength + 2);
      });
    });

    // 4. Konversi workbook ke file Excel (Blob)
    const buffer = await workbook.xlsx.writeBuffer();
    const excelFile = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // 5. Simpan file dengan nama yang mengandung tanggal
    const now = new Date().toISOString().split("T")[0];
    saveAs(excelFile, `Data-Mesin_${now}.xlsx`);
  };

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
  useEffect(() => {
    const fetchDataToExport = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(API_LINK + "Mesin/ExporttoExcel", {
          status: "Aktif",
        });

        console.log(data);
        if (!data) {
          setIsError(true);
          console.log("Error saat fetch data export");
        } else if (data.length === 0) {
          setDataExport(inisialisasiData);
        } else {
          setDataExport(data);
          console.log("Data Export" + dataExport);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchData = async () => {
      setIsError(false);

      try {
        // Fetch data with the dynamic filters and pagination
        const data = await UseFetch(API_LINK + "Mesin/GetDataMesin", {
          page: currentFilter.page,
          query: currentFilter.query,
          sort: currentFilter.sort,
          status: currentFilter.status,
          itemPerPage: currentFilter.itemPerPage,
        });

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
              "LEFT",
              "left",
              "LEFT",
              "LEFT",
              "LEFT",
              "center",
              "center",
            ],
          }));
          console.log(formattedData);
          setCurrentData(formattedData);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataToExport();
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
            <Button
              iconName="file-export"
              classType="success"
              title="Export"
              label="Export to XLSX"
              onClick={exportToExcel}
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
      </div>
    </>
  );
}
