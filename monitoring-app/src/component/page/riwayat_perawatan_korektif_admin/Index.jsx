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
  { Value: "[kor_tanggal_penjadwalan] asc", Text: "Tanggal Penjadwalan [↑]" },
  { Value: "[kor_tanggal_penjadwalan] desc", Text: "Tanggal Penjadawalan [↓]" },
];

export default function RiwayatPreventif({ onChangePage }) {
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
  const [dataKorektif, setDataKorektif] = useState();
  const [DataKorektifByID, setDataKorektifByID] = useState();
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "kor_tanggal_penjadwalan",
    status: "",
    itemPerPage: 10,
  });
  const [fetchDataDetailSP, setFetchDataDetailSP] = useState();
  const [teknisi, setTeknisi] = useState();
  const [idKO, setIdKO] = useState();

  const getFullNameTeknisi = async (modifiedBy) => {
    try {
      const data = await UseFetch(API_LINK + "Korektif/GetKaryawanFullName", {
        p2: modifiedBy, // Gunakan ID yang dipilih
      });
      console.log("Data Teknisi:", data);
      if (!data || data === "ERROR") {
        throw new Error("Gagal mengambil data Teknisi berdasarkan ID.");
      } else {
        setTeknisi(data[0]); // Set teknisi dengan data pertama dari array
      }
    } catch (error) {
      console.error("Fetch Data Teknisi Error:", error);
      setIsError(true);
    }
  };

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  const exportToExcel = async () => {
    if (!dataKorektif || dataKorektif.length === 0) {
      console.log(dataKorektif);
      Swal.fire("Gagal", "Tidak ada data untuk dieksport!", "error");
      return;
    }

    // 1. Buat workbook dan worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Perawatan Korektif");

    // 2. Tambahkan header dengan styling, border, dan center alignment
    const headers = Object.keys(dataKorektif[0]);
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
    dataKorektif.forEach((item) => {
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
    saveAs(excelFile, `Data-Perawatan-Korektif_${now}.xlsx`);
  };

  const printRef = useRef();

  const exportToPDF = (id) => {
    const input = printRef.current;
    if (!input) {
      console.error("Elemen tidak ditemukan!");
      return;
    }

    html2canvas(input, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // Lebar A4 dalam mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Data-Perawatan-Korektif/${id}.pdf`);
    });
  };

  const exportToExcelByID = async (id) => {
    if (!DataKorektifByID || DataKorektifByID.length === 0) {
      console.log(DataKorektifByID);
      Swal.fire("Gagal", "Tidak ada data untuk dieksport!", "error");
      return;
    }

    // 1. Buat workbook dan worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Perawatan Korektif");

    // 2. Tambahkan header dengan styling, border, dan center alignment
    const headers = Object.keys(DataKorektifByID[0]);
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
    DataKorektifByID.forEach((item) => {
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
    saveAs(excelFile, `Data-Perawatan-Korektif/${id}_${now}.xlsx`);
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

  const fetchDetailSP = async () => {
    try {
      const data = await UseFetch(
        API_LINK + "Korektif/DetailSPPerawatanMesin",
        {
          id: idKO,
        }
      );

      console.log("Respone ", data);
      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil data Sparepart.");
      } else {
        const formattedData = data.map((item) => {
          return {
            ...item,
            Alignment: ["center", "center", "center"],
          };
        });
        setFetchDataDetailSP(formattedData); // Menyimpan hasil fetchDetailSP ke state
      }
    } catch (error) {
      window.scrollTo(0, 0);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    } finally {
      setIsLoading(false);
    }
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
  const fetchDataKorektifByID = async (ID) => {
    console.log("ini ID: " + ID);
    try {
      const data = await UseFetch(
        API_LINK + "Korektif/GetDataPerawatanKorektifToExport",
        {
          p1: "kor_id_perawatan_korektif", // Sesuaikan dengan parameter yang benar
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
            ["Created Date"]: Created_Date,
            ["Modified Date"]: Modified_date,
            ["Modified By"]: teknisi,
            ...rest
          } = item;
          setIdKO(item["ID Perawatan Korektif"]);
          getFullNameTeknisi(teknisi);
          return {
            ...rest,
            Jadwal: formatDate(Jadwal, "D MMMM YYYY"),
            "Tanggal Aktual": formatDate(Tanggal_Aktual, "D MMMM YYYY"),
            "Tanggal Selesai": formatDate(Tanggal_Selesai, "D MMMM YYYY"),
            Teknisi: teknisi,
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
        setDataKorektifByID(formattedData);
      }
    } catch (error) {
      console.error("Fetch Data Export by ID Error:", error);
      setIsError(true);
    }
  };
  useEffect(() => {
    if (DataKorektifByID) {
      fetchDetailSP();
      console.log("425", fetchDataDetailSP);
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
          exportToExcelByID(DataKorektifByID[0]["ID Perawatan Korektif"]);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          exportToPDF(DataKorektifByID[0]["ID Perawatan Korektif"]);
        }
      });
    }
  }, [DataKorektifByID]);

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "Korektif/GetDataPerawatanKorektifToExport",
          {
            p1: "kor_id_perawatan_korektif", // Sesuaikan dengan parameter yang benar
            p2: "",
          }
        );

        console.log("Data Export:", data);
        if (!data || data === "ERROR") {
          throw new Error("Gagal mengambil data export.");
        }
        setDataKorektif(data);
      } catch (error) {
        console.error("Fetch Data Export Error:", error);
        setIsError(true);
      }

      try {
        const data = await UseFetch(
          API_LINK + "Korektif/getDataPerawatanKorektifSelesai",
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
            Riwayat Perawatan Korektif
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
                  iconName="file-export"
                  classType="success px-4 ms-1"
                  label="Export to Excel"
                  title="Cetak Laporan Perawatan Korektif"
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
                    onDetail={onChangePage}
                    onEdit={onChangePage}
                    onPrint={fetchDataKorektifByID}
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
        <br />
        <div className="card p-5" ref={printRef} style={{ display: "block" }}>
          <img
            src={logo}
            alt="Logo AstraTech"
            className="p-3 ms-1"
            style={{ height: "70px" }}
          />
          <h2 className="text-center p-4">Laporan Perawatan Mesin Rutin </h2>
          <hr />
          <div className="col-lg-6  ">
            <table className="table">
              <tbody>
                <tr>
                  <th style={{ border: "none" }}>Nomor Laporan</th>
                  <td style={{ border: "none" }}>: {idKO}</td>
                </tr>
                <tr>
                  <th style={{ border: "none" }}>Tanggal Laporan</th>
                  <td style={{ border: "none" }}>
                    :{" "}
                    {formatDate(
                      new Date().toISOString().split("T")[0],
                      "D MMMM YYYY"
                    )}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: "none" }}>Teknisi</th>
                  <td style={{ border: "none" }}>
                    : {teknisi ? teknisi.Full_Name : "-"}
                  </td>
                </tr>

                <tr>
                  <th style={{ border: "none" }}>Status</th>
                  <td style={{ border: "none" }}>
                    :{" "}
                    {DataKorektifByID
                      ? DataKorektifByID[0]["Status Pemeliharaan"]
                      : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />
          <br />
          <div className="card">
            <div className="card-header bg-success lead fw-medium text-white">
              Riwayat Perawatan Preventif
            </div>
            <div className="card-body">
              <div className="mt-3">
                {isLoading ? (
                  <Loading />
                ) : (
                  <div className="d-flex flex-column">
                    <Table
                      data={
                        DataKorektifByID != null
                          ? DataKorektifByID
                          : currentData
                      }
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="card m-3">
              <div className="card-body p-4">
                <Label
                  forLabel="Detail_SP"
                  title="Detail Sparepart yang digunakan: "
                />
                <Table data={fetchDataDetailSP} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
