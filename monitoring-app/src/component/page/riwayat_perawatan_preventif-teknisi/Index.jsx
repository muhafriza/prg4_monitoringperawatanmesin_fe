import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
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
import logo from "../../../assets/IMG_Logo.png";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import Label from "../../part/Label";

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

// Data untuk dropdown jenis export
const dataJenisExport = [
  { Value: "excel", Text: "Excel" },
  { Value: "pdf", Text: "PDF" },
];

// Data untuk dropdown periode
const dataPeriode = [
  { Value: "all", Text: "Semua Data" },
  { Value: "2024", Text: "2024" },
  { Value: "2025", Text: "2025" },
  { Value: "2026", Text: "2026" },
];

export default function RiwayatPreventifTEKNISI({ onChangePage }) {

  // State untuk modal export
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jenisExport, setJenisExport] = useState("excel");
  const [periode, setPeriode] = useState("all");

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
  const username = userInfo.username;

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [dataPrevetif, setDataPreventif] = useState();
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[pre_tanggal_penjadwalan] asc",
    status: "Selesai",
    itemPerPage: 10,
    p6: username,
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();
  const [fetchDataDetailSP, setFetchDataDetailSP] = useState(null);

  // Fungsi untuk format tanggal dd MMMM YYYY
  const formatDateCustom = (dateString) => {
    if (!dateString || dateString === "-" || dateString === null) return "-";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";

      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];

      const day = date.getDate().toString().padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      return `${day} ${month} ${year}`;
    } catch (e) {
      return "-";
    }
  };

  // Fungsi untuk menghitung tanggal berdasarkan periode
  const calculateDateRange = (yearFilter) => {
    if (yearFilter === "all") return null;

    const startDate = `${yearFilter}-01-01`;
    const endDate = `${yearFilter}-12-31`;

    return {
      start: startDate,
      end: endDate
    };
  };

  // Headers yang sama untuk Excel dan PDF
  const commonHeaders = [
    "No",
    "ID Perawatan",
    "ID Mesin",
    "Nama Mesin",
    "Bagian",
    "Tanggal Aktual",
    "Tanggal Selesai",
    "Tindakan Perbaikan",
    "Status Pemeliharaan",
    "Teknisi"
  ];

  // Headers untuk sparepart
  const sparepartHeaders = [
    "No",
    "ID Perawatan",
    "Nama Sparepart",
    "Jumlah"
  ];

  // Modifikasi fungsi exportToExcel
  const exportToExcel = async (periodFilter = null) => {
    try {
      // Fetch data berdasarkan periode dengan parameter yang sesuai SP
      const data = await UseFetch(
        API_LINK + "TransaksiPreventif/GetDataPerawatanPreventifToExportTEKNISI",
        {
          p1: "pre_tanggal_penjadwalan",
          p2: "",
          p3: userInfo.username,
          p4: periodFilter,
          p5: ""
        }
      );

      if (!data || data.length === 0) {
        Swal.fire("Gagal", "Tidak ada data untuk dieksport!", "error");
        return;
      }

      // Buat workbook dan worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheetPreventif = workbook.addWorksheet("Data Perawatan Preventif");
      const worksheetSparepart = workbook.addWorksheet("Detail Sparepart");

      // Add headers untuk preventif
      worksheetPreventif.addRow(commonHeaders);

      // Style headers preventif
      const headerRowPreventif = worksheetPreventif.getRow(1);
      headerRowPreventif.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 10 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "0074CC" }, // Blue background
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true
        };
        cell.border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        };
      });

      // Set column widths untuk preventif
      const columnWidthsPreventif = [8, 22, 15, 25, 20, 18, 18, 22, 18, 15];
      columnWidthsPreventif.forEach((width, index) => {
        worksheetPreventif.getColumn(index + 1).width = width;
      });

      // Add data rows untuk preventif
      data.forEach((item, index) => {
        const rowData = [
          index + 1, // No
          item["ID Perawatan"] || "-",
          item["ID Mesin"] || "-",
          item["Nama Mesin"] || "-",
          item["Bagian"] || "-",
          formatDateCustom(item["Tanggal Aktual"]),
          formatDateCustom(item["Tanggal Selesai"]),
          item["Tindakan Perbaikan"] || "-",
          item["Status Pemeliharaan"] || "-",
          item["Teknisi"] || "-"
        ];

        const row = worksheetPreventif.addRow(rowData);

        // Style data rows
        row.eachCell((cell, colNumber) => {
          cell.alignment = {
            horizontal: colNumber === 1 ? "center" : "left",
            vertical: "middle",
            wrapText: true
          };
          cell.border = {
            top: { style: "thin", color: { argb: "CCCCCC" } },
            left: { style: "thin", color: { argb: "CCCCCC" } },
            bottom: { style: "thin", color: { argb: "CCCCCC" } },
            right: { style: "thin", color: { argb: "CCCCCC" } },
          };

          // Alternating row colors
          if (index % 2 === 0) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F8F9FA" },
            };
          }
        });

        row.height = 18;
      });

      headerRowPreventif.height = 22;

      // ===== WORKSHEET SPAREPART =====
      if (fetchDataDetailSP && fetchDataDetailSP.length > 0) {
        // Add headers sparepart
        worksheetSparepart.addRow(sparepartHeaders);

        // Style headers sparepart
        const headerRowSparepart = worksheetSparepart.getRow(1);
        headerRowSparepart.eachCell((cell, colNumber) => {
          cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 10 };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "28A745" }, // Green background
          };
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true
          };
          cell.border = {
            top: { style: "thin", color: { argb: "000000" } },
            left: { style: "thin", color: { argb: "000000" } },
            bottom: { style: "thin", color: { argb: "000000" } },
            right: { style: "thin", color: { argb: "000000" } },
          };
        });

        // Set column widths untuk sparepart
        const columnWidthsSparepart = [8, 22, 30, 12];
        columnWidthsSparepart.forEach((width, index) => {
          worksheetSparepart.getColumn(index + 1).width = width;
        });

        // Add data sparepart
        fetchDataDetailSP.forEach((item, index) => {
          const rowDataSparepart = [
            index + 1,
            item["ID Perawatan"] || item["id_perawatan"] || "-",
            item["Nama Sparepart"] || item["nama_sparepart"] || "-",
            item["Jumlah"] || item["jumlah"] || "-"
          ];

          const rowSparepart = worksheetSparepart.addRow(rowDataSparepart);

          // Style data rows sparepart
          rowSparepart.eachCell((cell, colNumber) => {
            cell.alignment = {
              horizontal: colNumber === 1 || colNumber === 4 ? "center" : "left",
              vertical: "middle",
              wrapText: true
            };
            cell.border = {
              top: { style: "thin", color: { argb: "CCCCCC" } },
              left: { style: "thin", color: { argb: "CCCCCC" } },
              bottom: { style: "thin", color: { argb: "CCCCCC" } },
              right: { style: "thin", color: { argb: "CCCCCC" } },
            };

            // Alternating row colors
            if (index % 2 === 0) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "F8F9FA" },
              };
            }
          });

          rowSparepart.height = 18;
        });

        headerRowSparepart.height = 22;
      } else {
        // Jika tidak ada data sparepart
        worksheetSparepart.addRow(["Tidak ada data sparepart tersedia"]);
        const emptyRow = worksheetSparepart.getRow(1);
        emptyRow.getCell(1).font = { italic: true, color: { argb: "666666" } };
        emptyRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
        worksheetSparepart.getColumn(1).width = 40;
      }

      // Konversi workbook ke buffer
      const buffer = await workbook.xlsx.writeBuffer();
      const excelFile = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Save file
      const now = formatDateCustom(new Date().toISOString().split("T")[0]).replace(/ /g, '-');
      saveAs(excelFile, `Data-Perawatan-Preventif_${now}.xlsx`);

      Swal.fire("Berhasil", "Data berhasil diexport ke Excel!", "success");
    } catch (error) {
      console.error("Export Excel Error:", error);
      Swal.fire("Gagal", "Terjadi kesalahan saat export data!", "error");
    }
  };

  // Fungsi untuk export PDF
  const exportToPDF = async (periodFilter = null) => {
    try {
      // === FETCH DATA ===
      const data = await UseFetch(
        API_LINK + "TransaksiPreventif/GetDataPerawatanPreventifToExportTEKNISI",
        {
          p1: "pre_tanggal_penjadwalan",
          p2: "",
          p3: periodFilter?.start || "",
          p4: periodFilter?.end || "",
          p5: ""
        }
      );

      if (!data || data.length === 0) {
        Swal.fire("Gagal", "Tidak ada data untuk dieksport!", "error");
        return;
      }

      const pdf = new jsPDF("L", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const rowHeight = 7;
      const headerHeight = 10;

      const commonHeaders = ["No", "ID Perawatan", "ID Mesin", "Nama Mesin", "Bagian", "Tanggal Aktual", "Tanggal Selesai", "Tindakan Perbaikan", "Status Pemeliharaan", "Teknisi"];
      const colWidths = [12, 28, 15, 40, 20, 25, 25, 50, 20, 25];

      const sparepartHeaders = ["No", "ID Perawatan", "Nama Sparepart", "Jumlah"];
      // Perbaiki lebar kolom sparepart agar tidak menumpuk
      const sparepartColWidths = [15, 35, 70, 25]; // Total: 145, lebih kecil dari pageWidth-margin

      const periode = periodFilter ? `${periodFilter.start} - ${periodFilter.end}` : "";

      // === HEADER - KONSISTEN UNTUK SEMUA HALAMAN ===
      const addHeader = (yPosition, title = "LAPORAN DATA PERAWATAN PREVENTIF") => {
        try {
          if (logo) pdf.addImage(logo, "PNG", margin, yPosition, 60, 15);
        } catch { }

        const titleY = yPosition + 20;
        pdf.setFontSize(14).setFont("helvetica", "bold").setTextColor(0, 0, 0);
        pdf.text(title, pageWidth / 2, titleY, { align: "center" });

        pdf.setFontSize(10).setFont("helvetica", "normal").setTextColor(0, 0, 0);
        pdf.text("POLITEKNIK ASTRA", pageWidth / 2, titleY + 7, { align: "center" });

        if (periodFilter) {
          pdf.setFontSize(9);
          pdf.text(`Periode: Tahun ${periode}`, pageWidth / 2, titleY + 14, { align: "center" });
        }

        pdf.setFontSize(8);
        pdf.text(`Tanggal Export: ${formatDateCustom(new Date().toISOString())}`, pageWidth / 2, titleY + 21, { align: "center" });

        return titleY + 25;
      };

      // === FOOTER - KONSISTEN UNTUK SEMUA HALAMAN ===
      const addFooter = () => {
        const footerStartY = pageHeight - 35;
        pdf.setFontSize(7).setFont("helvetica", "normal").setTextColor(128, 128, 128);
        pdf.setFont("helvetica", "bold").setFontSize(8);
        pdf.text("POLITEKNIK ASTRA", margin, footerStartY);

        pdf.setFont("helvetica", "normal").setFontSize(7);
        pdf.text("Kampus Sunter : Kompleks PT. Astra International Tbk.", margin, footerStartY + 5);
        pdf.text("Gedung B, Jl. Gaya Motor Raya No.8, Sunter II", margin, footerStartY + 9);
        pdf.text("Jakarta 14330, Indonesia", margin, footerStartY + 13);
        pdf.text("Kampus Cikarang : Jl. Gaharu Blok F-3 Delta Silicon 2", margin, footerStartY + 20);
        pdf.text("Lippo Cikarang, Kel. Cibatu, Kec. Cikarang Selatan", margin, footerStartY + 24);
        pdf.text("Bekasi, Jawa Barat 17530, Indonesia", margin, footerStartY + 28);

        pdf.setFont("helvetica", "bold").setFontSize(8);
        pdf.text("CONTACT", pageWidth - 55, footerStartY);

        pdf.setFont("helvetica", "normal").setFontSize(7);
        pdf.text("Tlp : +62 21 50227222", pageWidth - 55, footerStartY + 5);
        pdf.text("Email : sekretariat@polytechnic.astra.ac.id", pageWidth - 55, footerStartY + 9);
        pdf.text("www.polytechnic.astra.ac.id", pageWidth - 55, footerStartY + 28);

        // Reset warna teks ke hitam
        pdf.setTextColor(0, 0, 0);
      };

      // === CEK HALAMAN BARU ===
      const checkNewPage = (currentY, headersArray, widthsArray) => {
        if (currentY + rowHeight > pageHeight - 45) {
          addFooter();
          pdf.addPage();
          let newY = addHeader(10, headersArray === sparepartHeaders ? "LAPORAN DETAIL SPAREPART" : "LAPORAN DATA PERAWATAN PREVENTIF");
          return drawTableHeader(newY, headersArray, widthsArray);
        }
        return currentY;
      };

      // === DRAW TABLE HEADER - KONSISTEN UNTUK SEMUA TABEL ===
      const drawTableHeader = (startY, headersArray, widthsArray) => {
        // Set font yang konsisten untuk header
        pdf.setFont("helvetica", "bold").setFontSize(8).setTextColor(0, 0, 0);
        let xPos = margin;

        headersArray.forEach((header, colIndex) => {
          const width = widthsArray[colIndex];

          // Gambar border
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.1);
          pdf.rect(xPos, startY, width, headerHeight);

          // Split text jika terlalu panjang
          const lines = pdf.splitTextToSize(header, width - 2);
          const lineHeight = 2.5;
          const totalTextHeight = lines.length * lineHeight;
          const textStartY = startY + (headerHeight - totalTextHeight) / 2 + lineHeight;

          lines.forEach((line, i) => {
            const textWidth = pdf.getTextWidth(line);
            pdf.text(line, xPos + (width - textWidth) / 2, textStartY + i * lineHeight);
          });

          xPos += width;
        });

        return startY + headerHeight;
      };

      // === DRAW TABLE BODY - KONSISTEN UNTUK SEMUA TABEL ===
      const drawTable = (startY, dataArray, headersArray, widthsArray) => {
        let yPos = startY;

        dataArray.forEach((item, index) => {
          yPos = checkNewPage(yPos, headersArray, widthsArray);

          // Set font yang konsisten untuk body
          pdf.setFont("helvetica", "normal").setFontSize(7).setTextColor(0, 0, 0);
          let xPos = margin;

          headersArray.forEach((header, colIndex) => {
            const width = widthsArray[colIndex];
            let cellValue = "-";

            if (header === "No") {
              cellValue = (index + 1).toString();
            } else if (item[header] !== undefined && item[header] !== null) {
              if (header.includes("Tanggal")) {
                cellValue = formatDateCustom(item[header]);
              } else {
                cellValue = item[header].toString();
              }
            }

            // Gambar border
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.1);
            pdf.rect(xPos, yPos, width, rowHeight);

            // Split text dan batasi ke maksimal 2 baris
            const lines = pdf.splitTextToSize(cellValue, width - 2);
            const lineHeight = 2;
            const maxLines = 2;
            const totalTextHeight = Math.min(lines.length, maxLines) * lineHeight;
            const textStartY = yPos + (rowHeight - totalTextHeight) / 2 + lineHeight;

            lines.slice(0, maxLines).forEach((line, i) => {
              const textX = (header === "No") ?
                xPos + (width - pdf.getTextWidth(line)) / 2 : // Center untuk nomor
                xPos + 1; // Left align untuk yang lain
              pdf.text(line, textX, textStartY + i * lineHeight);
            });

            xPos += width;
          });

          yPos += rowHeight;
        });

        return yPos;
      };

      // === HALAMAN 1: PERAWATAN ===
      let yPos = addHeader(10, "LAPORAN DATA PERAWATAN PREVENTIF");
      yPos = drawTableHeader(yPos, commonHeaders, colWidths);
      yPos = drawTable(yPos, data, commonHeaders, colWidths);

      // === HALAMAN 2: SPAREPART ===
      if (fetchDataDetailSP && fetchDataDetailSP.length > 0) {
        addFooter();
        pdf.addPage();
        yPos = addHeader(10, "LAPORAN DETAIL SPAREPART");
        yPos = drawTableHeader(yPos, sparepartHeaders, sparepartColWidths);
        yPos = drawTable(yPos, fetchDataDetailSP, sparepartHeaders, sparepartColWidths);
      }

      // === FOOTER AKHIR & SAVE ===
      addFooter();
      const now = formatDateCustom(new Date().toISOString()).replace(/ /g, "-");
      pdf.save(`Data-Perawatan-Preventif_${now}.pdf`);
      Swal.fire("Berhasil", "Data berhasil diexport ke PDF!", "success");

    } catch (error) {
      console.error("Export PDF Error:", error);
      Swal.fire("Gagal", "Terjadi kesalahan saat export data!", "error");
    }
  };

  // Fungsi untuk menangani proses export
  const handleExport = () => {
    const periodFilter = calculateDateRange(periode);

    if (jenisExport === "excel") {
      exportToExcel(periodFilter);
    } else if (jenisExport === "pdf") {
      exportToPDF(periodFilter);
    }

    setIsModalOpen(false);
  };

  // Fungsi untuk membuka modal
  const openExportModal = () => {
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const closeExportModal = () => {
    setIsModalOpen(false);
  };

  const fetchDetailSP = async () => {
    try {
      const data = await UseFetch(
        API_LINK + "TransaksiPreventif/getdetailSparepartPerawatanPreventifSelesaiTeknisi",
        {
          p1: "Selesai",
          p2: userInfo.username
        }
      );

      if (data === "ERROR" || data.length === 0) {
        console.log("No sparepart data available");
        setFetchDataDetailSP([]);
      } else {
        setFetchDataDetailSP(data);
      }
    } catch (error) {
      console.log("Fetch Sparepart Error:", error);
      setFetchDataDetailSP([]);
    }
  };

  useEffect(() => {
    fetchDetailSP();
  }, []);

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
    const month = date.getMonth();
    const year = date.getFullYear();

    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    switch (format) {
      case "DD/MM/YYYY":
        return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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
          API_LINK +
          "TransaksiPreventif/GetDataPerawatanPreventifToExportTEKNISI",
          {
            p1: "pre_idPerawatan_mesin", // Sesuaikan dengan parameter yang benar
            p2: "",
            p3: username,
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
          API_LINK +
          "TransaksiPreventif/GetDataPerawatanPreventifSelesaiTEKNISI",
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
              "Dikerjakan Oleh":
                Dikerjakan_Oleh == null ? "-" : Dikerjakan_Oleh,
              "Tanggal Selesai": formatDate(Tanggal_selesai, "D MMMM YYYY"),
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
              message="Terjadi kesalahan: Gagal mengambil data."
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
                <Button
                  iconName="send"
                  classType="success px-4 ms-1"
                  label="Export"
                  title="Export Laporan Perawatan Preventif"
                  onClick={openExportModal}
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
        </div>

        {/* Modal Export */}
        {isModalOpen && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Export Data Perawatan Preventif</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeExportModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <Label forLabel="jenisExport" title="Jenis File Export" />
                    <select
                      className="form-select"
                      value={jenisExport}
                      onChange={(e) => setJenisExport(e.target.value)}
                    >
                      {dataJenisExport.map((item, index) => (
                        <option key={index} value={item.Value}>
                          {item.Text}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <Label forLabel="periode" title="Filter Periode" />
                    <select
                      className="form-select"
                      value={periode}
                      onChange={(e) => setPeriode(e.target.value)}
                    >
                      {dataPeriode.map((item, index) => (
                        <option key={index} value={item.Value}>
                          {item.Text}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <Button
                    classType="secondary"
                    label="Batal"
                    onClick={closeExportModal}
                  />
                  <Button
                    classType="primary"
                    label="Export"
                    onClick={handleExport}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <br />
      </div>
    </>
  );
}
