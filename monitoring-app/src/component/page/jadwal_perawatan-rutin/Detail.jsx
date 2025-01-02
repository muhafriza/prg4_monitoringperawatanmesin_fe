import { useEffect, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterSparepartDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  // Use state instead of useRef for form data
  const [formData, setFormData] = useState({
    ID_Mesin: "",
    Nama_Mesin: "",
    gambarSparepart: "",
    Tanggal_Penjadwalan: "",
    Tanggal_Aktual: "",
    Tanggal_Selesai: "",
    Tindakan_Perbaikan: "",
    Catatan_Tambahan: "",
    Status_Pemeliharaan: "",
    Created_By: "",
    Created_Date: "",
    Modified_By: "",
  });
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
          API_LINK + "TransaksiPreventif/DetailPerawatanMesin",
          {
            id: withID,
          }
        );
        console.log(data);

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Sparepart.");
        } else {
          setFormData((prevFormData) => ({ ...prevFormData, ...data[0] }));
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

    fetchData();
  }, [withID]);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Detail Data Sparepart
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-3">
              <Label
                forLabel="ID_Mesin"
                title="ID Mesin"
                data={formData.ID_Mesin}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="Nama_Mesin"
                title="Nama Mesin"
                data={formData.Nama_Mesin}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="Tanggal_Penjadwalan"
                title="Tanggal Penjadwalan"
                data={formData.Tanggal_Penjadwalan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="Tindakan_Perbaikan"
                title="TindakanPerbaikan"
                data={formData.Tindakan_Perbaikan}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="Tanggal_Aktual"
                title="Tanggal Aktual"
                data={formData.Tanggal_Aktual}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="Created_By"
                title="Dibuat Oleh"
                data={formData.Created_By}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="Created_Date"
                title="Tanggal Dibuat"
                data={formData.Created_Date}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="Tanggal_Selesai"
                title="Tanggal Selesai"
                data={formData.Tanggal_Selesai}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="Catatan_Tambahan"
                title="Catatan Tambahan"
                data={formData.Catatan_Tambahan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="Modified_By"
                title="Teknisi"
                data={formData.Modified_By}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="Status_Pemeliharaan"
                title="Status Pemeliharaan"
                data={formData.Status_Pemeliharaan}
              />
            </div>
          </div>
          <div className="float-end my-4 mx-1">
            <Button
              classType="secondary px-4 py-2"
              label="KEMBALI"
              onClick={() => onChangePage("index")}
            />
          </div>
        </div>
      </div>
    </>
  );
}