import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK, FILE_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import logo from "../../../assets/IMG_Logo.png";
import Loading from "../../part/Loading";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
// import "style.css";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Nama Mesin": null,
    "Tanggal Perawatan": null,
    Tindakan: null,
    "Dibuat Oleh": null,
    Status: null,
    Aksi: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[pre_tanggal_penjadwalan] asc", Text: "Tanggal Penjadwalan [↑]" },
  { Value: "[pre_tanggal_penjadwalan] desc", Text: "Tanggal Penjadawalan [↓]" },
];

const dataFilterStatus = [
  { Value: "Menunggu Perbaikan", Text: "Menunggu Perbaikan" },
  { Value: "Dalam Pengerjaan", Text: "Dalam Pengerjaan" },
  { Value: "Tertunda", Text: "Tertunda" },
  { Value: "Selesai", Text: "Selesai" },
  { Value: "Batal", Text: "Batal" },
];

export default function LaporanKerusakan({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[kor_tanggal_pengajuan] asc",
    status: "",
    itemPerPage: 10,
  });
  const [formData, setFormData] = useState({});

  const [teknisi, setTeknisi] = useState();
  const [pic, setPic] = useState();

  const [fetchDataDetailSP, setFetchDataDetailSP] = useState([]);
  const printRef = useRef();

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

  const ExportByID = async (ID) => {
    console.log("ini ID: " + ID);
    try {
      const data = await UseFetch(
        API_LINK + "Korektif/DetailPerawatanKorektif",
        {
          p2: ID, // Gunakan ID yang dipilih
        }
      );
      console.log("Data Export by ID:", data[0]);
      if (!data || data === "ERROR") {
        throw new Error("Gagal mengambil data export berdasarkan ID.");
      } else {
        setFormData(data[0]);
        // Panggil fungsi untuk mendapatkan Full Name setelah formData di-set
        await getFullNameTeknisi(data[0].Modified_By);
        await getFullNamePIC(data[0].Created_By);
        await getDetailSP(data[0].ID_Perawatan_Korektif);
      }
      exportToPDF(ID);
    } catch (error) {
      console.error("Fetch Data Export by ID Error:", error);
      setIsError(true);
    }
    console.log("getDetailSP", fetchDataDetailSP);
  };
  const getDetailSP = async (ID) => {
    try {
      const data = await UseFetch(
        API_LINK + "Korektif/DetailSPPerawatanMesin",
        {
          p1: ID,
        }
      );
      console.log("INI SPAREPART: ", data);
      if (data === "ERROR" || data.length === 0) {
        throw new Error("Terjadi kesalahan: Gagal mengambil data DetailSP.");
      } else {
        setFetchDataDetailSP(data);
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    }
  };

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

  const getFullNamePIC = async (createdBy) => {
    try {
      const data = await UseFetch(API_LINK + "Korektif/GetKaryawanFullName", {
        p2: createdBy, // Gunakan ID yang dipilih
      });
      console.log("Data PIC:", data);
      if (!data || data === "ERROR") {
        throw new Error("Gagal mengambil data PIC berdasarkan ID.");
      } else {
        setPic(data[0]); // Set PIC dengan data pertama dari array
      }
    } catch (error) {
      console.error("Fetch Data PIC Error:", error);
      setIsError(true);
    }
  };

  const exportToPDF = async (id) => {
    const input = printRef.current;
    if (!input) {
      console.error("Elemen tidak ditemukan!");
      return;
    }

    // Convert all external images to base64
    const images = input.querySelectorAll("img");
    for (let img of images) {
      if (img.src && img.src.startsWith("http")) {
        try {
          const response = await fetch(img.src, { mode: "cors" });
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onload = () => {
            img.src = reader.result; // Replace the image src with base64 data URL
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error("Error converting image to base64:", error);
        }
      }
    }

    // Wait for images to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Render the element to canvas
    html2canvas(input, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // Lebar A4 dalam mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Data-Perawatan-Korektif_${id}.pdf`);
    });
  };

  function formatDate(dateString, format) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.getMonth(); // Get month as number (0-based)
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const dayIndex = date.getDay(); // Get day of the week (0 = Minggu, 6 = Sabtu)

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

    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
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
      case "D MMMM YYYY HH:mm:ss":
        return `${day} ${months[month]} ${year} ${String(hours).padStart(
          2,
          "0"
        )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}`;
      case "dddd, D MMMM YYYY": // Format baru: Selasa, 12 Februari 2025
        return `${days[dayIndex]}, ${day} ${months[month]} ${year}`;
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
    setIsLoading(true);
    setIsError(false);
    UseFetch(API_LINK + "MasterSparepart/SetStatusSparepart", {
      idSparepart: id,
    })
      .then((data) => {
        if (data === "ERROR" || data.length === 0) setIsError(true);
        else {
          SweetAlert(
            "Sukses",
            "Status data Sparepart berhasil diubah menjadi " + data[0].Status,
            "success"
          );
          handleSetCurrentPage(currentFilter.page);
        }
      })
      .then(() => setIsLoading(false));
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "Korektif/GetDataPerawatanKorektif",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          console.log(data);
          const formattedData = data.map((value) => {
            const {
              ["Tanggal Pengajuan"]: kor_tanggal_pengajuan,
              ["Status Pemeliharaan"]: Status,
              Dibuat,
              TindakanPerbaikan,
              kor_sparepart_diganti,
              mes_id_mesin,
              ["Tanggal Perawatan"]: Tanggal_Perawatan,
              ...rest
            } = value;
            const tanggal_pengajuan =
              kor_tanggal_pengajuan != null
                ? new Date(kor_tanggal_pengajuan).toLocaleDateString("id-ID")
                : "-";
            return {
              ...rest,
              "Tanggal Pengajuan": formatDate(tanggal_pengajuan, "D MMMM YYYY"),
              "Dibuat Oleh": Dibuat || "-", // Pembuat data
              Status: Status,
              Aksi:
                Status != "Selesai" ? ["Detail", "Edit"] : ["Detail"], // Tombol aksi, bisa disesuaikan dengan tombol yang ada
              Alignment: [
                "center",
                "center",
                "center",
                "left",
                "left",
                "LEFT",
                "center",
                "left",
                "center",
                "center",
              ],
            };
          });
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
              message="Terjadi kesalahan: Gagal mengambil data Sparepart. "
            />
          </div>
        )}
        <div className="card">
          <div className="card-header bg-primary lead fw-medium text-white">
            Perawatan Korektif
          </div>
          <div className="card-body p-4">
            <div className="flex-fill">
              <div className="input-group">
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
                      onPrint={ExportByID}
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
      </div>      
    </>
  );
}
