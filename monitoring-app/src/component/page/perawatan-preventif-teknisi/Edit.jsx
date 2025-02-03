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
import Swal from "sweetalert2";
import { DateTime } from "luxon";

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
    Catatan_Tambahan: string(),
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

    // Memperbarui data form
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    // Validasi untuk Tanggal Selesai
    if (name === "Tanggal_Selesai") {
      const { Tanggal_Aktual } = formData;
      if (Tanggal_Aktual && value) {
        const actualDate = new Date(Tanggal_Aktual);
        const completionDate = new Date(value);
        if (completionDate < actualDate) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            Tanggal_Selesai:
              "Tanggal Selesai tidak boleh sebelum Tanggal Aktual.",
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            Tanggal_Selesai: "",
          }));
          setIsError(false);
        }
      }
    }

    if (name === "Tanggal_Aktual" || name === "Catatan_Tambahan") {
      const { Tanggal_Penjadwalan, Tanggal_Aktual, Catatan_Tambahan } = {
        ...formData,
        [name]: value,
      };

      if (Tanggal_Penjadwalan && Tanggal_Aktual) {
        const actualDate = DateTime.fromISO(Tanggal_Aktual, {
          zone: "Asia/Jakarta",
        });
        const jadwal = DateTime.fromISO(Tanggal_Penjadwalan, {
          zone: "Asia/Jakarta",
        });

        if (actualDate > jadwal && !Catatan_Tambahan) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            Catatan_Tambahan:
              "Catatan Tambahan wajib diisi jika Tanggal Aktual lebih dari Tanggal Penjadwalan.",
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            Catatan_Tambahan: "",
          }));
        }
      }
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    delete formData.Modified_By;
    delete formData.Modified_Date;

    console.log("Payload:", formData);

    if (formData.Tanggal_Selesai) {
      const actualDate = DateTime.fromISO(formData.Tanggal_Aktual, {
        zone: "Asia/Jakarta",
      });
      const selesai = DateTime.fromISO(formData.Tanggal_Selesai, {
        zone: "Asia/Jakarta",
      });
      if (selesai < actualDate) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          Tanggal_Selesai:
            "Tanggal Selesai tidak valid / Tidak boleh kurang dari tanggal aktual.",
        }));
        window.scrollTo(0, 0);
        return;
      }
    }

    // Validasi form
    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );

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
          Swal.fire("Sukses", "Data berhasil disimpan", "success");
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
    } else {
      window.scrollTo(0, 0);
    }
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
        delete data[0].gambar_mesin;
        delete data[0].upt;
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
          <div className="card-header bg-primary lead fw-medium text-white">
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
                  min={formatDate(new Date(), "YYYY-MM-DD")} // Set tanggal minimal hari ini
                  value={
                    formData.Tanggal_Aktual
                      ? formatDate(formData.Tanggal_Aktual, "YYYY-MM-DD")
                      : ""
                  }
                  onChange={handleInputChange}
                  errorMessage={errors.Tanggal_Aktual}
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
                  // min={formatDate(
                  //   new Date(formData.Tanggal_Aktual),
                  //   "YYYY-MM-DD"
                  // )} // Set tanggal minimal hari ini
                  value={formData.Tanggal_Selesai}
                  onChange={(e) => handleInputChange(e, "Tanggal_Selesai")}
                  errorMessage={errors.Tanggal_Selesai}
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
                  name="Catatan_Tambahan"
                  label="Catatan Tambahan"
                  value={formData.Catatan_Tambahan || ""} // Gunakan default "" jika undefined
                  onChange={(e) => handleInputChange(e, "Catatan_Tambahan")}
                  errorMessage={errors.Catatan_Tambahan}
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
