import { useEffect, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import { validateAllInputs } from "../../util/ValidateForm";
import Button from "../../part/Button";
import Input from "../../part/Input";
import DropDown from "../../part/Dropdown";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import { object, string } from "yup";
import SweetAlert from "../../util/SweetAlert";

export default function PerawatanPreventifTeknisiEdit({
  onChangePage,
  withID,
}) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const [fetchDataDetailSP, setFetchDataDetailSP] = useState(null);

  const [formData, setFormData] = useState({
    ID_Perawatan_Preventif: withID,
    ID_Mesin: "",
    Nama_Mesin: "",
    Tanggal_Penjadwalan: "",
    Tanggal_Aktual: "",
    Tanggal_Selesai: "",
    Tindakan_Perbaikan: "",
    Catatan_Tambahan: "",
    Status_Pemeliharaan: "",
    Created_By: "",
    Created_Date: "",
  });

  const userSchema = object({
    ID_Perawatan_Preventif: string().required(),
    ID_Mesin: string().required(),
    Nama_Mesin: string().required(),
    Tanggal_Penjadwalan: string().required(),
    Tanggal_Aktual: string().required("Isi Tanggal Aktual Terlebih Dahulu"),
    Tanggal_Selesai: string(),
    Tindakan_Perbaikan: string().required(),
    Catatan_Tambahan: string().test(
      "required-if-actual-date-greater",
      "Catatan Tambahan wajib diisi jika Tanggal Aktual lebih dari Tanggal Penjadwalan.",
      function (value) {
        const { Tanggal_Aktual, Tanggal_Penjadwalan } = this.parent;
        if (Tanggal_Aktual && Tanggal_Penjadwalan) {
          const actualDate = new Date(Tanggal_Aktual);
          const scheduledDate = new Date(Tanggal_Penjadwalan);
          return actualDate <= scheduledDate || (value && value.trim() !== "");
        }
        return true; // Tidak perlu validasi jika salah satu tanggal tidak ada
      }
    ),
    Status_Pemeliharaan: string().required(),
    Created_By: string().required(),
    Created_Date: string().required(),
  });

  const [statusOptions, setStatusOptions] = useState([
    { Value: "Menunggu Perbaikan", Text: "Menunggu Perbaikan" },
    { Value: "Dalam Pengerjaan", Text: "Dalam Pengerjaan" },
    { Value: "Tertunda", Text: "Tertunda" },
    { Value: "Selesai", Text: "Selesai" },
    { Value: "Batal", Text: "Batal" },
  ]);

  function formatDate(dateString, format) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0"); // Tambahkan leading zero
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tambahkan leading zero dan bulan 0-based
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
        return `${year}-${month}-${day}`; // Format untuk input date
      case "D MMMM YYYY":
        return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
      default:
        return dateString;
    }
  }

  const handleInputChange = (e, fieldName) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    delete formData.Modified_By;
    delete formData.Modified_Date;

    console.log("Payload:", formData);
    console.log("tes" + formData.Tanggal_Aktual);

    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );

    console.error("Validation :", validationErrors);

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/UpdatePerawatanPreventif",
          formData
        );

        console.log("API Response:", data);

        if (!data) {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data produk.");
        } else {
          SweetAlert("Sukses", "Data produk berhasil disimpan", "success");
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
    } else window.scrollTo(0, 0);
  };

  useEffect(() => {
    const fetchDataDetailSP = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/DetailSPPerawatanMesin",
          {
            id: withID,
          }
        );

        if (data === "ERROR" || data.length === 0) {
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
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data jadwal preventif."
          );
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

    fetchDataDetailSP();
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
                  data={formatDate(formData.Tanggal_Penjadwalan, "D MMMM YYYY")}
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
                <Input
                  type="date"
                  forInput="Tanggal_Aktual"
                  label="Tanggal Aktual"
                  className="form-control"
                  isRequired
                  value={
                    formData.Tanggal_Aktual
                      ? formatDate(formData.Tanggal_Aktual, "YYYY-MM-DD")
                      : ""
                  }
                  disabled={!!formData.Tanggal_Aktual}
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
                  data={formatDate(formData.Created_Date, "D MMMM YYYY")}
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
              <div className="col-lg-3">
                <Input
                  type="textarea"
                  forInput="Catatan_Tambahan"
                  label="Catatan Tambahan"
                  value={formData.Catatan_Tambahan || ""} // Gunakan default "" jika undefined
                  onChange={(e) => handleInputChange(e, "Catatan_Tambahan")}
                  errorMessage={errors?.Catatan_Tambahan || ""}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="Detail_SP"
                  title="Detail Sparepart yang digunakan: "
                ></Label>
                {fetchDataDetailSP && fetchDataDetailSP.length > 0 ? (
                  <ul>
                    {fetchDataDetailSP.map((item, index) => (
                      <li key={index}>
                        <strong>Sparepart {index + 1}:</strong>
                        <ul>
                          {Object.entries(item).map(([key, value]) => (
                            <li key={key}>
                              {key.replace(/_/g, " ")}:{" "}
                              {typeof value === "object" && value !== null
                                ? JSON.stringify(value) // Render objek sebagai string
                                : value}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Tidak Ada Sparepart.</p>
                )}
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
