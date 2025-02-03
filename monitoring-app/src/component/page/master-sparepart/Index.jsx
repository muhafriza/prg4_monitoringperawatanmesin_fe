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
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Nama Sparepart": null,
    Merk: null,
    "Tanggal Masuk": null,
    Stok: null,
    Status: null,
    Aksi: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[spa_stok] asc", Text: "Stok [↑]" },
  { Value: "[spa_stok] desc", Text: "Stok [↓]" },
];

const dataFilterStatus = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function MasterSparepartIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [dataExport, setDataExport] = useState();
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[spa_nama_Sparepart] asc",
    status: "Aktif",
    itemPerPage: 5,
  });

  const exportToExcel = async () => {
    if (!dataExport || dataExport.length === 0) {
      console.log(dataExport);
      Swal.fire("Gagal", "Tidak ada data untuk dieksport!", "error");
      return;
    }

    // 1. Buat workbook dan worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Sparepart");

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
    saveAs(excelFile, `Data-Sparepart_${now}.xlsx`);
  };

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
    setIsError(false);

    Swal.fire({
      title: "Warning",
      html: `Yakin ingin mengubah status sparepart ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "YA",
      cancelButtonText: "BATAL",
    }).then((confirmation) => {
      if (confirmation.isConfirmed) {
        setIsLoading(true);
        // Mengganti async/await dengan promise .then()
        UseFetch(API_LINK + "MasterSparepart/SetStatusSparepart", {
          idSparepart: id,
        })
          .then((response) => {
            // Validasi respons dari API
            if (response === "ERROR" || !response || response.length === 0) {
              setIsError(true);
              Swal.fire("Error", "Gagal mengubah status sparepart.", "error");
              setIsLoading(false);
            } else {
              Swal.fire(
                "Success",
                `Status data sparepart berhasil diubah. ${response[0].Status}`,
                "success"
              );
              setIsLoading(false);
              handleSetCurrentPage(currentFilter.page); // Refresh data setelah berhasil
            }
          })
          .catch((error) => {
            setIsError(true);
            Swal.fire(
              "Error",
              `Terjadi kesalahan saat mengubah status sparepart.}`,
              "error"
            );
            console.error("Error in handleSetStatus:", error);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false); // Jika user memilih "BATAL", hentikan loading
      }
    });
  }

  useEffect(() => {
    const fetchDataToExport = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "MasterSparepart/ExportExcelSparepart",
          { status: "Aktif" }
        );

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
        const data = await UseFetch(
          API_LINK + "MasterSparepart/GetDataSparepart",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
          console.log("Error nih Line 147");
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => {
            const { tanggal_masuk, Deskripsi, Status, ...rest } = value; // Menghapus tanggal_masuk
            return {
              ...rest, // Menyalin sisa properti
              "Tanggal Masuk": formatDate(tanggal_masuk, "D MMMM YYYY"),
              Status: Status,
              Aksi: ["Toggle", "Detail", "Edit"],
              Alignment: [
                "center",
                "left",
                "left",
                "right",
                "center",
                "center",
                "center",
              ],
            };
          });
          console.log(formattedData);
          setCurrentData(formattedData);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    fetchDataToExport();
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
            <Button
              iconName="add"
              classType="success"
              label="Tambah"
              onClick={() => onChangePage("add")}
            />
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
                // columns={columns}
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
