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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  { Value: "[kor_tanggal_penjadwalan] asc", Text: "Tanggal Penjadwalan [↑]" },
  { Value: "[kor_tanggal_penjadwalan] desc", Text: "Tanggal Penjadawalan [↓]" },
];

const dataFilterStatus = [
  { Value: "", Text: "--" },
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
          p2: ID,
        }
      );
      console.log("Data Export by ID:", data[0]);
      if (!data || data === "ERROR") {
        throw new Error("Gagal mengambil data export berdasarkan ID.");
      } else {
        setFormData(data[0]);
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
        p2: modifiedBy,
      });
      console.log("Data Teknisi:", data);
      if (!data || data === "ERROR") {
        throw new Error("Gagal mengambil data Teknisi berdasarkan ID.");
      } else {
        setTeknisi(data[0]);
      }
    } catch (error) {
      console.error("Fetch Data Teknisi Error:", error);
      setIsError(true);
    }
  };

  const getFullNamePIC = async (createdBy) => {
    try {
      const data = await UseFetch(API_LINK + "Korektif/GetKaryawanFullName", {
        p2: createdBy,
      });
      console.log("Data PIC:", data);
      if (!data || data === "ERROR") {
        throw new Error("Gagal mengambil data PIC berdasarkan ID.");
      } else {
        setPic(data[0]);
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

    const images = input.querySelectorAll("img");
    for (let img of images) {
      if (img.src && img.src.startsWith("http")) {
        try {
          const response = await fetch(img.src, { mode: "cors" });
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onload = () => {
            img.src = reader.result;
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error("Error converting image to base64:", error);
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    html2canvas(input, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Data-Perawatan-Korektif_${id}.pdf`);
    });
  };

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

  // Fungsi untuk menampilkan legend
  function renderLegend() {
    return (
      <div className="mt-3 p-3 bg-light rounded">
        <h6 className="mb-2 fw-bold">Keterangan Warna:</h6>
        <div className="row">
          <div className="col-md-4 mb-2">
            <div className="d-flex align-items-center">
              <div 
                className="me-2" 
                style={{
                  width: "20px", 
                  height: "20px", 
                  backgroundColor: "red",
                  border: "2px solid red",
                  borderRadius: "3px"
                }}
              ></div>
              <small><strong>Merah:</strong> perawatan sudah terlewat atau belum dijadwalkan</small>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div className="d-flex align-items-center">
              <div 
                className="me-2" 
                style={{
                  width: "20px", 
                  height: "20px", 
                  backgroundColor: "orange",
                  border: "2px solid orange",
                  borderRadius: "3px"
                }}
              ></div>
              <small><strong>Orange:</strong> Jadwal perawatan hari ini atau besok</small>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div className="d-flex align-items-center">
              <div 
                className="me-2" 
                style={{
                  width: "20px", 
                  height: "20px", 
                  backgroundColor: "white",
                  border: "2px solid #dee2e6",
                  borderRadius: "3px"
                }}
              ></div>
              <small><strong>Putih:</strong> Status normal atau sudah selesai/dalam pengerjaan</small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "Korektif/GetDataPerawatanKorektifTeknisi",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => {
            const {
              ["Tanggal Pengajuan"]: kor_tanggal_pengajuan,
              ["Status Pemeliharaan"]: Status,
              Dibuat,
              UPT,
              ["Tanggal Perawatan"]: Tanggal_Perawatan,
              ...rest
            } = value;

            let rowStyle = null;

            const today = new Date();
            const jadwal = new Date(Tanggal_Perawatan);
            today.setHours(0, 0, 0, 0);
            jadwal.setHours(0, 0, 0, 0);

            if (Status !== "Selesai" && Status !== "Dalam Pengerjaan") {
              const diffInDays = Math.ceil(
                (jadwal - today) / (1000 * 60 * 60 * 24)
              );
              if (diffInDays < 0 || Tanggal_Perawatan === null) {
                rowStyle = { backgroundColor: "red", border: "3px solid red" };
              } else if (diffInDays === 1 || diffInDays === 0) {
                rowStyle = { backgroundColor: "orange", border: "3px solid orange" };
              }
            }
            
            return {
              ...rest,
              Bagian: UPT,
              "Tanggal Pengajuan":
                kor_tanggal_pengajuan != null
                  ? formatDate(kor_tanggal_pengajuan, "D MMMM YYYY")
                  : "-",
              "Dibuat Oleh": Dibuat || "-",
              Status: Status,
              Aksi: Status != "Selesai" ? ["Detail", "Edit"] : ["Detail"],
              rowStyle,
              Alignment: [
                "center", "center", "center", "left", "left",
                "LEFT", "center", "left", "center", "center",
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
              message="Terjadi kesalahan: Gagal mengambil data Perawatan Korektif."
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
                  forInput="pencarianKorektif"
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
                    defaultValue="[kor_tanggal_pengajuan] asc"
                  />
                  <DropDown
                    ref={searchFilterStatus}
                    forInput="ddStatus"
                    label="Status"
                    type="none"
                    arrData={dataFilterStatus}
                    defaultValue=""
                  />
                </Filter>
              </div>
              <div className="mt-3">
                {isLoading ? (
                  <Loading />
                ) : (
                  <div className="d-flex flex-column">
                    <Table
                      onDetail={onChangePage}
                      onEdit={onChangePage}
                      onPrint={ExportByID}
                      data={currentData.map(({ rowStyle, ...rest }) => rest)}
                      rowStyles={(row, index) =>
                        currentData[index]?.rowStyle || {}
                      }
                    />
                    <Paging
                      pageSize={PAGE_SIZE}
                      pageCurrent={currentFilter.page}
                      totalData={currentData[0]["Count"]}
                      navigation={handleSetCurrentPage}
                    />
                    {/* Legend ditampilkan di bawah tabel */}
                    {renderLegend()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Hidden div untuk PDF export */}
        <div ref={printRef} style={{ display: "none" }}>
          {/* Konten untuk PDF akan dirender di sini */}
        </div>
      </div>
    </>
  );
}