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

export default function RiwayatPreventifPIC({ onChangePage }) {
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

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [dataPrevetif, setDataPreventif] = useState();
  const [DataPreventifById, setDataPreventifById] = useState();
  const [DetailPreventifByIdExcel, setDetailPreventifByIdExcel] = useState([]);
  const [DetailSPByIdExcel, setDetailSPByIdExcel] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[pre_tanggal_penjadwalan] asc",
    status: "Selesai",
    itemPerPage: 10,
    p6: upt,
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();
  const [fetchDataDetailSP, setFetchDataDetailSP] = useState(null);
  const [fetchDataDetailSPbyID, setFetchDataDetailSPbyID] = useState(null);
  const [fetchDataDetailSPbyIDExcel, setFetchDataDetailSPbyIDexcel] =
  useState(null);


  useEffect(() => {
    if (fetchDataDetailSPbyIDExcel !== null) {
      console.log("263Ts: ", fetchDataDetailSPbyIDExcel);
    }
  }, [fetchDataDetailSPbyIDExcel]);

  useEffect(() => {
    if (DataPreventifById?.length > 0) {
      fetchDetailSPbyID();
      const formattedData = DataPreventifById.map((item) => {
        const { Key, Alignment, ...rest } = item;
        return { ...rest };
      });
      console.log("MASUK ", formattedData);
      setDetailPreventifByIdExcel(formattedData[0]);
    }
  }, [DataPreventifById]);

  useEffect(() => {
    const fetchDataAndExport = async () => {
      fetchDetailSPbyID();
      // const formattedData = DataPreventifById.map((item) => {
      //   const { Key, Alignment, ...rest } = item;
      //   return { ...rest };
      // });
      console.log("ByID: ", DataPreventifById);
      // console.log("ddddddd: ", formattedData);
      if (DataPreventifById != null) {
        const result = await Swal.fire({
          title: "Info",
          html: "Pilih Format <b>Excel</b> atau <b>PDF</b>",
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Excel",
          cancelButtonText: "PDF",
          confirmButtonColor: "#198754",
          cancelButtonColor: "red",
        });
  
        if (result.isConfirmed) {
          exportToExcelByID(DataPreventifById[0]?.["ID Perawatan Preventif"]);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          exportToPDF(DataPreventifById[0]?.["ID Perawatan Preventif"]);
        }
      }
      
      if (DetailPreventifByIdExcel === null) {
        Swal.fire("Gagal", "Tidak ada data untuk dieksport!", "error");
        return;
      }
  
      const workbook = new ExcelJS.Workbook();
      const worksheetPreventif = workbook.addWorksheet("Data Perawatan Preventif");
  
      const addDataToWorksheet = (worksheet, data) => {
        if (!Array.isArray(data) || data.length === 0) {
          console.error("Data tidak valid:", data);
          return;
        }
  
        const headers = Object.keys(data[0]);
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
  
        data.forEach((item) => {
          const row = worksheet.addRow(Object.values(item));
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
        });
      };
  
      console.log("263Excel: ", fetchDataDetailSPbyIDExcel);
      addDataToWorksheet(worksheetPreventif, [DetailPreventifByIdExcel]);
  
      if (fetchDataDetailSPbyIDExcel !== null) {
        const worksheetSparepart = workbook.addWorksheet("Detail Sparepart");
        addDataToWorksheet(worksheetSparepart, [fetchDataDetailSPbyIDExcel]);
      }
  
      const buffer = await workbook.xlsx.writeBuffer();
      const excelFile = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
  
      const now = new Date().toISOString().split("T")[0];
      saveAs(excelFile, `Data-Perawatan-Preventif/${id}_${formatDate(now, "D MMMM YYYY")}.xlsx`);
    };
  
    fetchDataAndExport();
  }, [DetailPreventifByIdExcel, DetailSPByIdExcel]);
  


  const exportToExcel = async () => {
    if (!dataPrevetif || dataPrevetif.length === 0) {
      console.log(dataPrevetif);
      Swal.fire("Gagal", "Tidak ada data untuk dieksport!", "error");
      return;
    }

    // 1. Buat workbook dan worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheetPreventif = workbook.addWorksheet(
      "Data Perawatan Preventif"
    );
    const worksheetSparepart = workbook.addWorksheet("Detail Sparepart");

    // Fungsi untuk menambahkan data ke worksheet
    const addDataToWorksheet = (worksheet, data) => {
      const headers = Object.keys(data[0]);
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
        worksheet.getColumn(colNumber).width = Math.max(
          headers[colNumber - 1].length + 5,
          10
        );
      });

      data.forEach((item) => {
        const row = worksheet.addRow(Object.values(item));
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });
    };

    // Tambahkan data
    console.log("176: ", fetchDataDetailSP);
    addDataToWorksheet(worksheetPreventif, dataPrevetif);
    addDataToWorksheet(worksheetSparepart, fetchDataDetailSP);

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
      const pdf = new jsPDF("P", "mm", "a4");
      const imgWidth = 210; // Lebar A4 dalam mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Data-Perawatan-Preventif/${id}.pdf`);
    });
  };

  const exportToExcelByID = async (id) => {
    if (DetailPreventifByIdExcel === null) {
      Swal.fire("Gagal", "Tidak ada data untuk dieksport!", "error");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheetPreventif = workbook.addWorksheet(
      "Data Perawatan Preventif"
    );

    const addDataToWorksheet = (worksheet, data) => {
      if (!Array.isArray(data)) {
        console.error("Data bukan array:", data);
        return;
      }

      if (data.length === 0) {
        console.warn("Data kosong.");
        return;
      }

      const headers = Object.keys(data[0]);
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
        worksheet.getColumn(colNumber).width = Math.max(
          headers[colNumber - 1].length + 5,
          10
        );
      });

      data.forEach((item) => {
        const row = worksheet.addRow(Object.values(item));
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });
    };

    console.log("263Excel: ", fetchDataDetailSPbyIDExcel);
    addDataToWorksheet(worksheetPreventif, [DetailPreventifByIdExcel]);

    if (fetchDataDetailSPbyIDExcel !== null) {
      const worksheetSparepart = workbook.addWorksheet("Detail Sparepart");
      addDataToWorksheet(worksheetSparepart, [fetchDataDetailSPbyIDExcel]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const excelFile = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

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
  const [IDpre, setIDpre] = useState();
  const [teknisi, setTeknisi] = useState();

  const fetchDetailSP = async () => {
    try {
      const data = await UseFetch(
        API_LINK +
          "TransaksiPreventif/getdetailSparepartPerawatanPreventifSelesai",
        {
          p1: "Selesai",
          p2: upt,
        }
      );

      if (data === "ERROR" || data.length === 0) {
        console.log("189: ", isError);
        throw new Error(
          "Terjadi kesalahan: Gagal mengambil data Sparepart. Line 189"
        );
      } else {
        setFetchDataDetailSP(data);
      }
    } catch (error) {
      console.log("P", error);
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

  const fetchDataPreventifByID = async (ID) => {
    setIDpre(ID);
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
            Teknisi: teknisi,
            ...rest
          } = item;
          // console.log("Line 299: ",teknisi);
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
        console.log("Detail Pre: ", formattedData);
        setDataPreventifById(formattedData);
      }
    } catch (error) {
      console.error("Fetch Data Export by ID Error:", error);
      setIsError(true);
    }
  };
  const fetchDetailSPbyID = async () => {
    try {
      const data = await UseFetch(
        API_LINK + "TransaksiPreventif/DetailSPPerawatanMesin",
        {
          id: IDpre,
        }
      );

      console.log("90: ", data[0]);

      if (data === "ERROR" || data.length === 0) {
        console.log("189: ", isError);
        throw new Error(
          "Terjadi kesalahan: Gagal mengambil data Sparepart. Line 189"
        );
      } else {
        const formattedData = data.map((item, index) => ({
          ...item,
          Key: index + 1,
          No: item.No,
          "Nama Sparepart": item.Nama_Sparepart,
          Jumlah: item.Jumlah,
          Alignment: ["center", "center", "center"],
        }));

        const formatSP = data.map(({ Nama_Sparepart, Jumlah, ...rest }) => ({
          ...rest,
          "Nama Sparepart": Nama_Sparepart,
          Jumlah,
        }));

        console.log("format sp:", formatSP);

        // Gunakan variabel sementara agar langsung bisa digunakan
        const updatedDataExcel = formatSP[0] || {};

        setFetchDataDetailSPbyID(formattedData[0] || {});
        setFetchDataDetailSPbyIDexcel(updatedDataExcel);

        // Langsung gunakan updatedDataExcel tanpa menunggu state update
        console.log("Data langsung digunakan: ", updatedDataExcel);
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

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/GetDataPerawatanPreventifToExportPIC",
          {
            p1: "pre_idPerawatan_mesin", // Sesuaikan dengan parameter yang benar
            p2: "",
            p3: upt,
          }
        );

        console.log("Data Export:", data);
        if (!data || data === "ERROR") {
          throw new Error("Gagal mengambil data export.");
        }
        const formattedData = data.map((value) => {
          const { Key, ...rest } = value;
          return {
            ...rest,
          };
        });
        console.log("TES", formattedData);
        setDataPreventif(formattedData);
      } catch (error) {
        console.error("Fetch Data Export Error:", error);
        setIsError(true);
      }

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/GetDataPerawatanPreventifSelesaiPIC",
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
                <Button
                  iconName="file-export"
                  classType="success px-4 ms-1"
                  label="Export to Excel"
                  title="Cetak Laporan Perawatan Preventif"
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
        <br />
        <div className="card p-5" ref={printRef} style={{ display: "block" }}>
          <img
            src={logo}
            alt="Logo AstraTech"
            className="p-3 ms-1"
            style={{ height: "70px" }}
          />
          <h2 className="text-center">Laporan Perawatan Mesin Rutin </h2>
          <hr />
          <div className="col-lg-6  ">
            <table className="table">
              <tbody>
                <tr>
                  <th style={{ border: "none" }}>Nomor Laporan</th>
                  <td style={{ border: "none" }}>: {IDpre}</td>
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
                </tr>
              </tbody>
            </table>
          </div>

          <hr />
          <br />
          <div className="card">
            <div className="card-header bg-success lead fw-medium text-white">
              Detail Perawatan Preventif
            </div>
            <div className="card-body">
              <h4></h4>
              <div className="mt-3">
                {isLoading ? (
                  <Loading />
                ) : (
                  <div className="d-flex flex-column">
                    <Table
                      data={
                        DataPreventifById != null
                          ? DataPreventifById
                          : currentData
                      }
                    />
                  </div>
                )}
              </div>
              <div className="card">
                <div className="card-body p-4">
                  <Label
                    forLabel="Detail_SP"
                    title="Detail Sparepart yang digunakan: "
                  />
                  <table className="table table-hover table-bordered table-striped table-light border">
                    <thead align="center">
                      <tr>
                        <th style={{ maxWidth: "1px" }}>NO</th>
                        <th>ID Mesin</th>
                        <th>Jenis Tindakan</th>
                        <th>Jadwal Pemeliharaan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fetchDataDetailSPbyID &&
                      fetchDataDetailSPbyID.length > 0 ? (
                        <tr>
                          <td>1</td>
                          <td>1</td>
                          <td>1</td>
                          <td>1</td>
                        </tr>
                      ) : (
                        <tr>
                          <td>Tidak Ada Sparepart yang digunakan</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
