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
    namaSparepart: "",
    deskripsi: "",
    gambarSparepart: "",
    merk: "",
    stok: "",
    tanggalMasuk: "",
    status: "",
  });
  function formatDate(dateString, format) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.getMonth(); // Get month as number (0-based)
    const year = date.getFullYear();

    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
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
          API_LINK + "MasterSparepart/DetailSparepart",
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
            <div className="col-md-4 mb-3">
              <Label
                forLabel="gambarSparepart"
                title="Gambar Sparepart"
                data={
                  formData.gambarSparepart &&
                  formData.gambarSparepart !== "" ? (
                    <img
                      src={FILE_LINK + formData.gambarSparepart}
                      alt="Gambar Sparepart"
                      className="img-fluid"
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "300px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      }}
                    />
                  ) : (
                    "-"
                  )
                }
              />
            </div>
            <div class="col-md-8">
              <div class="row">
                <div className="col-lg-3">
                  <Label
                    forLabel="namaSparepart"
                    title="Nama Sparepart"
                    data={formData.namaSparepart}
                  />
                </div>
                <div className="col-lg-5">
                  <Label
                    forLabel="deskripsi"
                    title="Deskripsi"
                    data={formData.deskripsi}
                  />
                </div>
                <div className="col-lg-4">
                  <Label forLabel="merk" title="Merk" data={formData.merk} />
                </div>
                <div className="col-lg-3">
                  <Label forLabel="stok" title="Stok" data={formData.stok} />
                </div>
                <div className="col-lg-5">
                  <Label
                    forLabel="tanggalMasuk"
                    title="Tanggal Masuk"
                    data={formatDate(formData.tanggalMasuk, "D MMMM YYYY")}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="status"
                    title="Status"
                    data={formData.status}
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
        </div>
      </div>
    </>
  );
}
