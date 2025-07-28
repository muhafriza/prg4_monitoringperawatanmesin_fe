import { useEffect, useState, useRef } from "react";
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
import Table from "../../part/Table";

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
    Tanggal_Selesai: string().optional(),
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

  const [statusOptions2, setStatusOptions2] = useState([
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
        }
      }
    }
    if (name === "Tanggal_Aktual" || name === "Catatan_Tambahan") {
      const { Tanggal_Penjadwalan, Tanggal_Aktual, Catatan_Tambahan } = {
        ...formData,
        [name]: value,
      };

      if (!Tanggal_Aktual) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          Tanggal_Aktual: "Isi Tanggal Aktual Terlebih Dahulu",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          Tanggal_Aktual: "",
        }));
      }

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

    if (name === "Status_Pemeliharaan") {
      if (value === "Selesai" && !formData.Tanggal_Selesai) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          Tanggal_Selesai: "Tanggal Selesai wajib diisi jika status selesai.",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          Tanggal_Selesai: "",
        }));
        if (Tanggal_Aktual) {
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
          }
        }
      }
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    delete formData.upt;
    const payload = {
      p1: formData.ID_Perawatan_Preventif ?? null, // ID Perawatan Preventif
      p2: formData.ID_Mesin ?? null, // ID Mesin
      p3: formData.Nama_Mesin ?? "", // Nama Mesin
      p4: formData.Tanggal_Penjadwalan ?? null, // Tanggal Penjadwalan
      p5: formData.Tanggal_Aktual ?? null, // Tanggal Aktual
      p6: formData.Tanggal_Selesai ?? null, // Tanggal Selesai (NULL jika kosong)
      p7: formData.Tindakan_Perbaikan ?? "", // Tindakan Perbaikan
      p8: formData.Catatan_Tambahan ?? "", // Catatan Tambahan
      p9: formData.Status_Pemeliharaan ?? "", // Status Pemeliharaan
      p10: formData.Created_By ?? "", // Created By
      p11: formData.Created_Date ?? null, // Created Date
    };


    let newErrors = { ...errors };
    console.log("Payload: ", payload);

    if (formData.Status_Pemeliharaan !== "Selesai") {
      delete newErrors.Tanggal_Selesai;
    } else {
      if (!formData.Tanggal_Selesai) {
        newErrors.Tanggal_Selesai =
          "Tanggal Selesai wajib diisi jika status selesai.";
      } else {
        const tanggalAktual = new Date(formData.Tanggal_Aktual);
        const tanggalSelesai = new Date(formData.Tanggal_Selesai);

        if (tanggalAktual && tanggalSelesai && tanggalSelesai < tanggalAktual) {
          newErrors.Tanggal_Selesai =
            "Tanggal Selesai tidak boleh sebelum Tanggal Aktual.";
        }
      }
    }

    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );

    console.log("NIH ERROR NYA: ", errors);
    newErrors = { ...newErrors, ...validationErrors };

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/UpdatePerawatanPreventif",
          payload
        );

        if (!data || data.error) {
          throw new Error(
            data?.message || "Terjadi kesalahan: Gagal menyimpan data."
          );
        }

        Swal.fire("Sukses", "Data berhasil disimpan", "success");
        onChangePage("index");
      } catch (error) {
        window.scrollTo(0, 0);
        setErrors(newErrors);
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    } else window.scrollTo(0, 0);
  };
  const [uptN, setUPT] = useState();

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
          const formattedData = data.map((item) => {
            const { Nama_Sparepart, Jumlah, ...rest } = item;
            return {
              ...rest,
              "Nama Sparepart": Nama_Sparepart,
              Jumlah: Jumlah,
              Alignment: ["center", "center", "center"],
            };
          });
          setFetchDataDetailSP(formattedData); // Menyimpan hasil fetchDetailSP ke state
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
        setUPT(data[0].upt);
        delete data[0].gambar_mesin;
        delete data[0].upt;
        delete data[0].Modified_By;
        delete data[0].Modified_Date;

        console.log("DATA: ", data);

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
                  title="Tindakan Perbaikan"
                  data={formData.Tindakan_Perbaikan}
                />
              </div>
              <div className="col-lg-4">
                <Label forLabel="UPT" title="UPT" data={uptN} />
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
              <div className="col-lg-4">
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
                  value={
                    formData.Tanggal_Selesai
                      ? formatDate(formData.Tanggal_Selesai, "YYYY-MM-DD")
                      : "-"
                  }
                  onChange={(e) => handleInputChange(e, "Tanggal_Selesai")}
                  errorMessage={errors.Tanggal_Selesai}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  arrData={formData.Status_Pemeliharaan !== "Menunggu Perbaikan" ? statusOptions2 : statusOptions}
                  type="pilih"
                  label="Status Pemeliharaan"
                  forInput="Status_Pemeliharaan"
                  isRequired
                  value={formData.Status_Pemeliharaan || ""}
                  onChange={(e) => handleInputChange(e, "Status_Pemeliharaan")}
                />
              </div>
              <div className="col-lg-4">
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
              <div className="row mt-3">
                <Label
                  forLabel="Detail_SP"
                  title="Detail Sparepart yang digunakan: "
                ></Label>
                {fetchDataDetailSP && fetchDataDetailSP.length > 0 ? (
                  <Table data={fetchDataDetailSP} />
                ) : (
                  <p>Tidak Ada Sparepart.</p>
                )}
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
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="SIMPAN"
          />
        </div>
      </form>
    </>
  );
}
