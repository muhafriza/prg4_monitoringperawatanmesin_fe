import { useEffect, useState } from "react";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import DropDown from "../../part/Dropdown";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function PerawatanPreventifTeknisiEdit({
  onChangePage,
  withID,
}) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  // State to store the form data
  const [formData, setFormData] = useState({
    ID_Mesin: "",
    Nama_Mesin: "",
    Tanggal_Penjadwalan: "",
    Tanggal_Aktual: "",
    Tanggal_Selesai: "",
    Status_Pemeliharaan: "",
    Deskripsi_Kerusakan: "",
    Created_By: "",
    Created_Date: "",
  });

  // Options for status
  const [statusOptions, setStatusOptions] = useState([
    { Value: "Menunggu Perbaikan", Text: "Menunggu Perbaikan" },
    { Value: "Dalam Pengerjaan", Text: "Dalam Pengerjaan" },
    { Value: "Tertunda", Text: "Tertunda" },
    { Value: "Selesai", Text: "Selesai" },
    { Value: "Batal", Text: "Batal" },
  ]);

  const formatDate = (dateString, format) => {
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
        return `${day}/${month + 1}/${year}`; // Add 1 to month for correct format
      case "YYYY-MM-DD":
        return `${year}-${month + 1}-${day}`; // Add 1 to month for correct format
      case "D MMMM YYYY":
        return `${day} ${months[month]} ${year}`;
      default:
        return dateString;
    }
  };

  const handleInputChange = (e, fieldName) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    // Prepare the payload for submission
    const payload = {
      p1: formData.ID_Mesin,
      p2: formData.Deskripsi_Kerusakan,
      p4: formData.Tanggal_Aktual,
      p5: formData.Tanggal_Selesai,
      p6: formData.Status_Pemeliharaan,
    };

    setIsLoading(true);
    setIsError((prevError) => ({ ...prevError, error: false }));
    setErrors({});

    try {
      // API call to update the corrective maintenance
      const data = await UseFetch(API_LINK + "Korektif/UpdateKorektif", payload);

      if (!data) {
        throw new Error("Terjadi kesalahan: Gagal menyimpan data produk.");
      } else {
        alert("Sukses", "Data produk berhasil disimpan", "success");
        onChangePage("index");
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
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "Korektif/GetDataPerawatanKorektif",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data untuk korektif.");
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
      <form onSubmit={handleEdit}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Ubah Status Perawatan Mesin
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

              <div className="col-lg-4">
                <Input
                  type="date"
                  forInput="Tanggal_Aktual"
                  label="Tanggal Aktual"
                  className="form-control"
                  isRequired
                  value={formData.Tanggal_Aktual}
                  onChange={handleInputChange}
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
                <Input
                  type="date"
                  forInput="Tanggal_Selesai"
                  label="Tanggal Selesai"
                  className="form-control"
                  value={formData.Tanggal_Selesai}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  arrData={statusOptions}
                  type="pilih"
                  label="Status Pemeliharaan"
                  forInput="Status_Pemeliharaan"
                  isRequired
                  value={formData.Status_Pemeliharaan || ""}
                  onChange={(e) => handleInputChange(e, "Status_Pemeliharaan")}
                />
              </div>
            </div>
            <div className="float-end my-4 mx-1">
              <Button
                classType="secondary px-4 py-2"
                label="KEMBALI"
                onClick={() => onChangePage("index")}
              />
              <Button
                classType="primary ms-2 px-4 py-2"
                type="submit"
                label="SIMPAN"
              />
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
