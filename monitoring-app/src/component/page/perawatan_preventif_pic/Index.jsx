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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";

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

export default function PerawatanPreventif({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [dataPrevetif, setDataPreventif] = useState();
  const [DataPreventifById, setDataPreventifById] = useState();
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
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[pre_status_pemeliharaan] asc",
    status: "",
    itemPerPage: 10,
    upt: upt,
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  const exportToExcel = async () => {
    if (!dataPrevetif || dataPrevetif.length === 0) {
      console.log(dataPrevetif);
      Swal.fire("Gagal", "Tidak ada data untuk dieksport!", "error");
      return;
    }

    // 1. Buat workbook dan worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Perawatan Preventif");

    // 2. Tambahkan header dengan styling, border, dan center alignment
    const headers = Object.keys(dataPrevetif[0]);
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

      // Atur ukuran kolom nomor 1 menjadi 10
      if (colNumber === 1) {
        worksheet.getColumn(colNumber).width = 5;
      }

      // Atur ukuran kolom nomor 2 berdasarkan header
      if (colNumber === 2) {
        worksheet.getColumn(colNumber).width =
          headers[colNumber - 1].length + 5;
      }
    });

    // 3. Tambahkan data dengan border di setiap sel dan atur ukuran kolom berdasarkan isi
    dataPrevetif.forEach((item) => {
      const row = worksheet.addRow(Object.values(item));
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // Atur alignment center untuk kolom nomor 1
        if (colNumber === 1) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }

        // Atur ukuran kolom berdasarkan panjang isi, kecuali kolom nomor 1 dan 2
        if (colNumber !== 1 && colNumber !== 2) {
          const column = worksheet.getColumn(colNumber);
          const cellLength = cell.value ? cell.value.toString().length : 10;
          column.width = Math.max(column.width || 10, cellLength + 2);
        }
      });
    });

    // 4. Konversi workbook ke file Excel (Blob)
    const buffer = await workbook.xlsx.writeBuffer();
    const excelFile = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // 5. Simpan file
    const now = new Date().toISOString().split("T")[0];
    saveAs(excelFile, `Data-Perawatan-Preventif_${now}.xlsx`);
  };

  const printRef = useRef();

  const exportToPDF = (id) => {
    const input = printRef.current;
    if (!input) {
      console.error("Elemen tidak ditemukan!");
      return;
    }

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const imgWidth = 250; // Lebar A4 dalam mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 25, 10, imgWidth, imgHeight);
      pdf.save(`Data-Perawatan-Preventif/${id}.pdf`);
    });
  };

  const exportToExcelByID = (id) => {
    if (!DataPreventifById || DataPreventifById.length === 0) {
      console.log(dataPrevetif);
      Swal.fire("Gagal", "Tidak ada data untuk dieksport!", "error");
      return;
    }

    // 1. Konversi data menjadi worksheet
    const worksheet = XLSX.utils.json_to_sheet(DataPreventifById);

    // 2. Buat workbook dan tambahkan worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Data Perawatan Preventif By ID"
    );

    // 3. Konversi workbook ke file Excel (blob)
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const excelFile = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    // 4. Simpan file
    const now = new Date().toISOString().split("T")[0];
    saveAs(
      excelFile,
      `Data-Perawatan-Preventif/${id}_${formatDate(now, "D MMMM YYYY")}.xlsx`
    );
  };

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
  const fetchDataPreventifByID = async (ID) => {
    console.log("ini ID: " + ID);
    try {
      const data = await UseFetch(
        API_LINK + "TransaksiPreventif/GetDataPerawatanPreventifToExport",
        {
          p1: "pre_idPerawatan_mesin", // Sesuaikan dengan parameter yang benar
          p2: ID, // Gunakan ID yang dipilih
        }
      );

      console.log("Data Export by ID:", data);
      if (!data || data === "ERROR") {
        throw new Error("Gagal mengambil data export berdasarkan ID.");
      } else {
        const formattedData = data.map((item) => {
          const {
            Jadwal,
            ["Tanggal Aktual"]: Tanggal_Aktual,
            ["Tanggal Selesai"]: Tanggal_Selesai,
            Created_Date,
            ["Modified Date"]: Modified_date,
            ...rest
          } = item;
          return {
            ...rest,
            Jadwal: formatDate(Jadwal, "D MMMM YYYY"),
            "Tanggal Aktual": formatDate(Tanggal_Aktual, "D MMMM YYYY"),
            "Tanggal Selesai":
              Tanggal_Selesai != null
                ? formatDate(Tanggal_Selesai, "D MMMM YYYY")
                : "-",
            "Created Date": formatDate(Created_Date, "D MMMM YYYY"),
            "Modified Date": formatDate(Modified_date, "D MMMM YYYY"),
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
        setDataPreventifById(formattedData);
      }
    } catch (error) {
      console.error("Fetch Data Export by ID Error:", error);
      setIsError(true);
    }
  };
  useEffect(() => {
    if (DataPreventifById) {
      Swal.fire({
        title: "Info",
        html: "Pilih Format <b>Excel</b> atau <b>PDF</b>",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Excel",
        cancelButtonText: "PDF",
        confirmButtonColor: "#198754",
        cancelButtonColor: "red",
      }).then((result) => {
        if (result.isConfirmed) {
          exportToExcelByID(DataPreventifById[0]["ID Perawatan Preventif"]);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          exportToPDF(DataPreventifById[0]["ID Perawatan Preventif"]);
        }
      });
    }
  }, [DataPreventifById]);

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/GetDataPerawatanPreventifToExport",
          {
            p1: "pre_idPerawatan_mesin", // Sesuaikan dengan parameter yang benar
            p2: "",
          }
        );

        console.log("Data Export:", data);
        if (!data || data === "ERROR") {
          throw new Error("Gagal mengambil data export.");
        }
        setDataPreventif(data);
      } catch (error) {
        console.error("Fetch Data Export Error:", error);
        setIsError(true);
      }

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/GetDataPerawatanPreventifPIC",
          currentFilter
        );

        if (data === "ERROR") {
          // console.log("Ini Data",data);
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
              Teknisi: Dikerjakan_Oleh == null ? "-" : Dikerjakan_Oleh,
              "Tanggal Selesai": Tanggal_selesai
                ? formatDate(Tanggal_selesai, "D MMMM YYYY")
                : "-",
              Status: Status_Pemeliharaan,
              Aksi: ["Detail"],
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
          console.log(currentData.Key);
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
              message="Terjadi kesalahan: Gagal mengambil data. "
            />
          </div>
        )}
        <div className="card">
          <div className="card-header bg-primary lead fw-medium text-white">
            Riwayat Perawatan Preventif
          </div>
          <div className="card-body p-4">
            <div className="flex-fill">
              <div className="input-group">
                <Input
                  ref={searchQuery}
                  forInput="pencarian"
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
                    onPrint={fetchDataPreventifByID}
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
        </div>
      </div>
    </>
  );
}
