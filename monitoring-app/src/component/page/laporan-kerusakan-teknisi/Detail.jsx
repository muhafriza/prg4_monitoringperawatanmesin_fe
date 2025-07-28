import { useEffect, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function Detail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  // State untuk menampung data fetch dari DetailSPPerawatanMesin
  const [fetchDataDetailSP, setFetchDataDetailSP] = useState(null);

  // Use state instead of useRef for form data
  const [formData, setFormData] = useState({});

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
        return `${day}/${month}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "D MMMM YYYY":
        return `${day} ${months[month]} ${year}`;
      default:
        return dateString;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "Korektif/DetailPerawatanKorektif",
          {
            id: withID,
          }
        );
        console.log("Response: ", data);

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Detail.");
        } else {
          setFormData(data[0]);
          console.log("Ini Form Data: ", formData);
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

    const fetchDataDetailSP = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "Korektif/DetailSPPerawatanMesin",
          {
            id: withID,
          }
        );
        console.log("INI SPAREPART DATA: ", data);

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Sparepart.");
        } else {
          setFetchDataDetailSP(data); // Menyimpan hasil fetchDetailSP ke state
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

    fetchDataDetailSP(); // Panggil fetchDataDetailSP untuk mendapatkan data tambahan
    fetchData(); // Panggil fetchData untuk mendapatkan data utama
  }, [withID]);

  if (isLoading) return <Loading />;

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Detail Perawatan Korektif</h5>
        </div>
        <div className="card-body">
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th>ID Mesin</th>
                <td>{formData.ID_Mesin}</td>
              </tr>
              <tr>
                <th>Nama Mesin</th>
                <td>{formData.Nama_Mesin}</td>
              </tr>
              <tr>
                <th>Tanggal Penjadwalan</th>
                <td>
                  {formData.Tanggal_Penjadwalan
                    ? formatDate(formData.Tanggal_Penjadwalan, "D MMMM YYYY")
                    : "-"}
                </td>
              </tr>
              <tr>
                <th>Tindakan Perbaikan</th>
                <td>{formData.Tindakan_Perbaikan || "Belum Ada Tindakan"}</td>
              </tr>
              <tr>
                <th>Tanggal Aktual</th>
                <td>
                  {formData.Tanggal_Aktual
                    ? formatDate(formData.Tanggal_Aktual, "D MMMM YYYY")
                    : "-"}
                </td>
              </tr>
              <tr>
                <th>Status Pemeliharaan</th>
                <td>
                  <span
                    className={`badge ${
                      formData.Status_Pemeliharaan === "Selesai"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {formData.Status_Pemeliharaan || "Menunggu Perbaikan"}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Teknisi</th>
                <td>{formData.Modified_By || "-"}</td>
              </tr>
              <tr>
                <th>Gambar Kerusakan</th>
                <td>
                  {formData.gambar_mesin ? (
                    <img
                      src={FILE_LINK + formData.gambar_mesin}
                      alt="Gambar Mesin"
                      className="img-fluid"
                      style={{ maxHeight: "300px", objectFit: "cover" }}
                    />
                  ) : (
                    "Tidak ada gambar"
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <h5 className="mt-4">Detail Sparepart</h5>
          <table className="table table-bordered table-striped">
            <thead align="center">
              <tr>
                <th>NO</th>
                <th>NAMA SPAREPART</th>
                <th>JUMLAH</th>
              </tr>
            </thead>
            <tbody>
              {fetchDataDetailSP && fetchDataDetailSP.length > 0 ? (
                fetchDataDetailSP.map((item, index) => (
                  <tr key={index}>
                    <td align="center">{index + 1}</td>
                    <td>{item["Nama Sparepart"]}</td>
                    <td align="right">{item.Jumlah}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">Tidak Ada Sparepart.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-end mt-4 mb-6">
        <Button
          classType="secondary px-4 py-2"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />
      </div>
    </>
  );
}
