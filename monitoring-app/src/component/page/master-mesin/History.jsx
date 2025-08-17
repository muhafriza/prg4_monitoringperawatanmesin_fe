import { useEffect, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import { PAGE_SIZE } from "../../util/Constants";
import Table from "../../part/Table";
import Paging from "../../part/Paging";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Jenis Perawatan": null,
    "Deskripsi Kerusakan": null,
    "Tindakan Perbaikan": null,
    "Tanggal Selesai": null,
    Aksi: null,
    Count: 0,
  },
];

export default function MasterMesinHistory({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    id: withID,
    sort: "[Tanggal_Selesai] DESC",
    status: "",
    itemPerPage: 10,
  });

  // Use state for the form data corresponding to pro_msmesin fields
  const [formData, setFormData] = useState();
  const [detail, setdetail] = useState();
  const [dataTable, setdataTable] = useState(inisialisasiData);

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        // Call API to fetch the details of the machine
        const data = await UseFetch(API_LINK + "Mesin/DetailMesin", {
          id: withID, // Pass the machine ID to the API
        });

        console.log("detail", data);
        if (!data) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Mesin.");
        } else {
          // Update the formData state with the fetched data
          setdetail(data[0]); // Assuming data[0] contains the correct object with the machine details
        }
      } catch (error) {
        window.scrollTo(0, 0); // Scroll to top in case of error
        setIsError({
          error: true,
          message: error.message,
        });
      } finally {
        setIsLoading(false); // Set loading state to false once data is fetched
      }
    };

    fetchData(); // Call the fetchData function when component mounts or withID changes
  }, [withID]);

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
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));
      setIsLoading(true);
      try {
        const data = await UseFetch(
          API_LINK + "Mesin/CountMaintenanceHistory",
          currentFilter
        );

        if (!data) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Mesin.");
        } else if (data.length === 0) {
          setdataTable(inisialisasiData);
        } else {
          setFormData(data[0]);
          const formattedData = data.map((value) => {
            const {
              ID_Mesin,
              Preventif_Selesai,
              Korektif_Selesai,
              Total_Perawatan_Selesai,
              Nama_Mesin,
              Jenis_Perawatan,
              Tanggal_Selesai,
              Tindakan_Perbaikan,
              Dikerjakan_Oleh,
              Deskripsi_Kerusakan,
              ...rest
            } = value;
            return {
              ...rest,
              "Jenis Perawatan": Jenis_Perawatan,
              "Deskripsi Kerusakan": Deskripsi_Kerusakan,
              "Tindakan Perbaikan":
                Tindakan_Perbaikan == null ? "-" : Tindakan_Perbaikan,
              "Tanggal Selesai": formatDate(Tanggal_Selesai, "D MMMM YYYY"),
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
          setdataTable(formattedData);
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError({
          error: true,
          message: error.message,
        });
      } finally {
        setIsLoading(false); // Set loading state to false once data is fetched
      }
    };

    fetchData(); // Call the fetchData function when component mounts or withID changes
  }, [withID]);

  if (isLoading) return <Loading />; // Show loading component while fetching data

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}

      {/* Card Riwayat Perawatan */}
      <div className="card">
        <div className="card-header bg-success lead fw-medium text-white">
          <i className="fi fi-rr-stats me-2"></i>
          Riwayat Perawatan Mesin - {detail.mes_nama_mesin} - ({detail.mes_id_mesin})
        </div>
        <div className="card-body p-4">
          <div className="row">
            {/* Card Perawatan Preventif */}
            <div className="col-md-4 mb-3">
              <div className="card border-primary h-100">
                <div className="card-body text-center">
                  <div className="text-primary mb-2">
                    <i
                      className="fi fi-rr-calendar-check"
                      style={{ fontSize: "2.5rem" }}
                    ></i>
                  </div>
                  <h5 className="card-title text-primary">
                    Perawatan Preventif
                  </h5>
                  <h2 className="text-primary fw-bold mb-2">
                    {formData?.Preventif_Selesai || 0}
                  </h2>
                  <p className="text-muted small mb-0">Perawatan Selesai</p>
                </div>
              </div>
            </div>

            {/* Card Perawatan Korektif */}
            <div className="col-md-4 mb-3">
              <div className="card border-warning h-100">
                <div className="card-body text-center">
                  <div className="text-warning mb-2">
                    <i
                      className="fi fi-rr-tool-box"
                      style={{ fontSize: "2.5rem" }}
                    ></i>
                  </div>
                  <h5 className="card-title text-warning">
                    Perawatan Korektif
                  </h5>
                  <h2 className="text-warning fw-bold mb-2">
                    {formData?.Korektif_Selesai || 0}
                  </h2>
                  <p className="text-muted small mb-0">Perawatan Selesai</p>
                </div>
              </div>
            </div>

            {/* Card Total Perawatan */}
            <div className="col-md-4 mb-3">
              <div className="card border-success h-100">
                <div className="card-body text-center">
                  <div className="text-success mb-2">
                    <i
                      className="fi fi-rr-chart-histogram"
                      style={{ fontSize: "2.5rem" }}
                    ></i>
                  </div>
                  <h5 className="card-title text-success">Total Perawatan</h5>
                  <h2 className="text-success fw-bold mb-2">
                    {formData?.Total_Perawatan_Selesai || 0}
                  </h2>
                  <p className="text-muted small mb-0">Perawatan Selesai</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar Visualization */}
          <div className="row mt-4">
            <div className="col-12">
              <Table data={dataTable} />
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={dataTable[0]["Count"]}
                navigation={handleSetCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="float-end my-4 mx-1">
        <Button
          classType="secondary px-4 py-2"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />
      </div>
    </>
  );
}
