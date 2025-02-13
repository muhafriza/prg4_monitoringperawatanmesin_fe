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
import { saveAs } from "file-saver";
import { ValidationError } from "yup";
import ExcelJS from "exceljs";


const inisialisasiData = [
  {
    Key: null,
    No: null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[kry_id] asc", Text: "ID Karyawan [↑]" },
  { Value: "[kry_id] desc", Text: "ID Karyawan [↓]" },
];

const dataFilterStatus = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function MasterUserIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataExport, setDataExport] = useState([]);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "kry_nama_depan",
    status: "Aktif",
    APP: "APP60",
    p6: 10,
  });

  const exportToExcel = async () => {
    if (!dataExport || dataExport.length === 0) {
      console.log(dataExport);
      Swal.fire("Gagal", "Tidak ada data untuk dieksport!", "error");
      return;
    }
  
    // 1. Buat workbook dan worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data User");
  
    // 2. Tambahkan header dengan styling
    const headers = Object.keys(dataExport[0]);
    worksheet.addRow(headers);
  
    worksheet.getRow(1).eachCell((cell, colNumber) => {
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
  
      worksheet.getColumn(colNumber).width = Math.max(headers[colNumber - 1].length + 5, 10);
    });
  
    // 3. Hitung panjang maksimum setiap kolom untuk menentukan ukuran kolom
    const columnWidths = headers.map((_, colIndex) => {
      return Math.max(
        headers[colIndex].length,
        ...dataExport.map((row) => (row[headers[colIndex]] ? row[headers[colIndex]].toString().length : 0))
      ) + 2;
    });
  
    // 4. Tambahkan data dan styling
    dataExport.forEach((item) => {
      const rowData = headers.map((header) => item[header] || ""); // Mengisi sel kosong dengan string kosong
      const row = worksheet.addRow(rowData);
  
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
  
        cell.alignment = { horizontal: "center", vertical: "middle" };
  
        // Atur ukuran kolom berdasarkan data yang ada
        worksheet.getColumn(colNumber).width = Math.max(columnWidths[colNumber - 1], 10);
      });
    });
  
    // 5. Konversi workbook ke file Excel (Blob)
    const buffer = await workbook.xlsx.writeBuffer();
    const excelFile = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  
    // 6. Simpan file
    const now = new Date().toISOString().split("T")[0];
    saveAs(excelFile, `Data-User_${formatDate(now, "D MMMM YYYY")}.xlsx`);
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

  function handleSearch() {
    console.log("Current Filter before Update:", currentFilter);

    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      const updatedFilter = {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
        status: searchFilterStatus.current.value,
      };

      console.log("Updated Filter:", updatedFilter);
      return updatedFilter;
    });
  }

  function handleSetStatus(id, peran) {
    Swal.fire({
      title: "Perhatian",
      text: "Yakin Ingin Mengubah Status User ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Ubah Status",
    }).then((result) => {
      setIsLoading(true);
      setIsError(false);
      if (result.isConfirmed) {
        UseFetch(API_LINK + "MasterUser/SetStatusUser", {
          idSparepart: id,
          peran: peran,
        }).then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          Swal.fire({
            title: "Deleted!",
            text: "Status data User berhasil diubah menjadi " + data[0].Status,
            icon: "success",
          });
          handleSetCurrentPage(currentFilter.page);
        });
      } else {
        setIsLoading(false);
      }
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

  useEffect(() => {
    const fetchDataToExport = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(API_LINK + "MasterUser/ExporttoExcel", {
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
        const data = await UseFetch(
          API_LINK + "MasterUser/GetDataKaryawanByUser",
          currentFilter
        );

        if (!data) {
          setIsError(true);
          console.log("Error nih");
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Aksi: ["Toggle", "Detail", "Edit"],
            Alignment: [
              "center",
              "Center",
              "left",
              "left",
              "right",
              "center",
              "center",
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
                defaultValue="[Nama Sparepart] asc"
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
                onToggle={(id) => {
                  const selectedRow = currentData.find((row) => row.Key === id); // Cari row berdasarkan ID
                  const username = selectedRow ? selectedRow.Username : null;
                  const peran = selectedRow ? selectedRow.Peran : null; // Ambil nilai Peran
                  const status = selectedRow ? selectedRow.Status : null; // Ambil nilai Peran

                  if (!selectedRow || !peran) {
                    Swal.fire(
                      "Error",
                      "Data Peran atau Row tidak ditemukan!",
                      "error"
                    );
                    return;
                  }

                  handleSetStatus(username, peran, status); // Panggil fungsi dengan ID dan Peran
                }}
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
