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
  const [uptN, setUPT] = useState("");

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
    Tanggal_Selesai: string().when('Status_Pemeliharaan', {
      is: 'Selesai',
      then: (schema) => schema.required('Tanggal Selesai wajib diisi jika status selesai'),
      otherwise: (schema) => schema.optional()
    }),
    Tindakan_Perbaikan: string().required(),
    Catatan_Tambahan: string().when(['Tanggal_Penjadwalan', 'Tanggal_Aktual'], {
      is: (tanggal_penjadwalan, tanggal_aktual) => {
        if (!tanggal_penjadwalan || !tanggal_aktual) return false;
        const actualDate = DateTime.fromISO(tanggal_aktual);
        const scheduledDate = DateTime.fromISO(tanggal_penjadwalan);
        return actualDate > scheduledDate;
      },
      then: (schema) => schema.required('Catatan Tambahan wajib diisi jika Tanggal Aktual lebih dari Tanggal Penjadwalan'),
      otherwise: (schema) => schema.optional()
    }),
    Status_Pemeliharaan: string().required(),
    Created_By: string().required(),
    Created_Date: string().required(),
  });

  const statusOptions = [
    { Value: "Menunggu Perbaikan", Text: "Menunggu Perbaikan" },
    { Value: "Dalam Pengerjaan", Text: "Dalam Pengerjaan" },
    { Value: "Tertunda", Text: "Tertunda" },
    { Value: "Selesai", Text: "Selesai" },
    { Value: "Batal", Text: "Batal" },
  ];

  const statusOptions2 = [
    { Value: "Dalam Pengerjaan", Text: "Dalam Pengerjaan" },
    { Value: "Tertunda", Text: "Tertunda" },
    { Value: "Selesai", Text: "Selesai" },
    { Value: "Batal", Text: "Batal" },
  ];

  function formatDate(dateString, format) {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    switch (format) {
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "D MMMM YYYY":
        return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
      default:
        return dateString;
    }
  }

  const validateDateInputs = (name, value, currentFormData) => {
    const updatedFormData = { ...currentFormData, [name]: value };
    let newErrors = {};

    // Validasi Tanggal Selesai
    if (name === "Tanggal_Selesai" || name === "Tanggal_Aktual" || name === "Status_Pemeliharaan") {
      const { Tanggal_Aktual, Tanggal_Selesai, Status_Pemeliharaan } = updatedFormData;
      
      if (Status_Pemeliharaan === "Selesai" && !Tanggal_Selesai) {
        newErrors.Tanggal_Selesai = "Tanggal Selesai wajib diisi jika status selesai.";
      } else if (Tanggal_Aktual && Tanggal_Selesai) {
        const actualDate = new Date(Tanggal_Aktual);
        const completionDate = new Date(Tanggal_Selesai);
        
        if (completionDate < actualDate) {
          newErrors.Tanggal_Selesai = "Tanggal Selesai tidak boleh sebelum Tanggal Aktual.";
        }
      }
    }

    // Validasi Tanggal Aktual dan Catatan Tambahan
    if (name === "Tanggal_Aktual" || name === "Catatan_Tambahan") {
      const { Tanggal_Penjadwalan, Tanggal_Aktual, Catatan_Tambahan } = updatedFormData;

      if (!Tanggal_Aktual) {
        newErrors.Tanggal_Aktual = "Isi Tanggal Aktual Terlebih Dahulu";
      } else if (Tanggal_Penjadwalan && Tanggal_Aktual) {
        const actualDate = DateTime.fromISO(Tanggal_Aktual, { zone: "Asia/Jakarta" });
        const scheduledDate = DateTime.fromISO(Tanggal_Penjadwalan, { zone: "Asia/Jakarta" });

        if (actualDate > scheduledDate && !Catatan_Tambahan) {
          newErrors.Catatan_Tambahan = 
            "Catatan Tambahan wajib diisi jika Tanggal Aktual lebih dari Tanggal Penjadwalan.";
        }
      }
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prevFormData) => {
      const updatedFormData = { ...prevFormData, [name]: value };
      
      // Validasi input yang berubah
      const validationErrors = validateDateInputs(name, value, updatedFormData);
      
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        
        // Clear previous errors untuk field yang sedang divalidasi
        if (name === "Tanggal_Selesai" || name === "Status_Pemeliharaan") {
          delete newErrors.Tanggal_Selesai;
        }
        if (name === "Tanggal_Aktual") {
          delete newErrors.Tanggal_Aktual;
        }
        if (name === "Catatan_Tambahan" || name === "Tanggal_Aktual") {
          delete newErrors.Catatan_Tambahan;
        }
        
        // Add new validation errors
        return { ...newErrors, ...validationErrors };
      });
      
      return updatedFormData;
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validasi manual untuk kasus khusus
      let customErrors = {};
      
      if (formData.Status_Pemeliharaan === "Selesai") {
        if (!formData.Tanggal_Selesai) {
          customErrors.Tanggal_Selesai = "Tanggal Selesai wajib diisi jika status selesai.";
        } else {
          const tanggalAktual = new Date(formData.Tanggal_Aktual);
          const tanggalSelesai = new Date(formData.Tanggal_Selesai);

          if (tanggalAktual && tanggalSelesai && tanggalSelesai < tanggalAktual) {
            customErrors.Tanggal_Selesai = 
              "Tanggal Selesai tidak boleh sebelum Tanggal Aktual.";
          }
        }
      }

      // Validasi dengan Yup schema
      const validationErrors = await validateAllInputs(
        formData,
        userSchema,
        setErrors
      );

      const allErrors = { ...validationErrors, ...customErrors };

      if (Object.values(allErrors).some((error) => error)) {
        setErrors(allErrors);
        window.scrollTo(0, 0);
        setIsLoading(false);
        return;
      }

      // Prepare payload - pastikan semua field yang dibutuhkan ada
      const currentUser = JSON.parse(localStorage.getItem("activeUser")) || {};
      const modifiedBy = currentUser.username || currentUser.nama || currentUser.id || currentUser.user_id || "SISTEM";
      
      // Helper function untuk format tanggal ke format yang SQL Server terima
      const formatDateForSQL = (dateString) => {
        if (!dateString) return "";
        
        // Jika sudah dalam format YYYY-MM-DD, langsung return
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateString;
        }
        
        // Jika dalam format ISO atau lainnya, konversi ke YYYY-MM-DD
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        
        return `${year}-${month}-${day}`;
      };
      
      const payload = {
        p1: formData.ID_Perawatan_Preventif, // Wajib ada untuk WHERE clause
        p2: formData.ID_Mesin || "",
        p3: formData.Nama_Mesin || "",
        p4: formatDateForSQL(formData.Tanggal_Penjadwalan), // Format tanggal untuk SQL
        p5: formatDateForSQL(formData.Tanggal_Aktual), // Format tanggal untuk SQL
        p6: formatDateForSQL(formData.Tanggal_Selesai), // Format tanggal untuk SQL
        p7: formData.Tindakan_Perbaikan || "",
        p8: formData.Catatan_Tambahan || "",
        p9: formData.Status_Pemeliharaan || "",
        p10: formData.Created_By || "",
        p11: formatDateForSQL(formData.Created_Date), // Format tanggal untuk SQL
        p12: modifiedBy, // Modified_By dari user yang sedang login
      };

      console.log("Form Data sebelum kirim:", formData);
      console.log("Payload yang dikirim:", payload);

      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      const data = await UseFetch(
        API_LINK + "TransaksiPreventif/UpdatePerawatanPreventif",
        payload
      );

      console.log("Response dari API:", data);

      // Cek response dari stored procedure
      if (data && data.length > 0) {
        const result = data[0];
        
        // Jika ada field 'hasil' dengan value 'ERROR'
        if (result.hasil === "ERROR") {
          throw new Error(result.pesan || "Terjadi kesalahan saat update data.");
        }
        
        // Jika sukses
        if (result.hasil === "SUCCESS" || result.message) {
          await Swal.fire("Sukses", result.pesan || result.message || "Data berhasil disimpan", "success");
          onChangePage("index");
          return;
        }
      }

      // Jika format response tidak sesuai
      if (!data) {
        throw new Error("Tidak ada response dari server.");
      }

      // Default success jika tidak ada error
      await Swal.fire("Sukses", "Data berhasil disimpan", "success");
      onChangePage("index");
      
    } catch (error) {
      console.error("Error updating data:", error);
      window.scrollTo(0, 0);
      setIsError({ error: true, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDataDetailSP = async () => {
      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/DetailSPPerawatanMesin",
          { id: withID }
        );

        if (data === "ERROR" || !Array.isArray(data) || data.length === 0) {
          setFetchDataDetailSP([]);
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
          setFetchDataDetailSP(formattedData);
        }
      } catch (error) {
        console.error("Error fetching sparepart data:", error);
        setFetchDataDetailSP([]);
      }
    };

    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/DetailPerawatanMesin",
          { id: withID }
        );

        if (data === "ERROR" || !Array.isArray(data) || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data jadwal preventif.");
        }

        const detailData = data[0];
        setUPT(detailData.upt || "");
        
        // Clean up data
        const cleanedData = { ...detailData };
        delete cleanedData.gambar_mesin;
        delete cleanedData.upt;
        delete cleanedData.Modified_By;
        delete cleanedData.Modified_Date;

        console.log("DATA: ", cleanedData);
        setFormData((prevFormData) => ({ ...prevFormData, ...cleanedData }));
        
      } catch (error) {
        console.error("Error fetching main data:", error);
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

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchDataDetailSP(), fetchData()]);
    };

    if (withID) {
      loadData();
    }
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
                  min={formatDate(new Date(), "YYYY-MM-DD")}
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
                      : ""
                  }
                  onChange={handleInputChange}
                  errorMessage={errors.Tanggal_Selesai}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  arrData={
                    formData.Status_Pemeliharaan !== "Menunggu Perbaikan" 
                      ? statusOptions2 
                      : statusOptions
                  }
                  type="pilih"
                  label="Status Pemeliharaan"
                  forInput="Status_Pemeliharaan"
                  isRequired
                  value={formData.Status_Pemeliharaan || ""}
                  onChange={handleInputChange}
                  errorMessage={errors.Status_Pemeliharaan}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="textarea"
                  forInput="Catatan_Tambahan"
                  name="Catatan_Tambahan"
                  label="Catatan Tambahan"
                  value={formData.Catatan_Tambahan || ""}
                  onChange={handleInputChange}
                  errorMessage={errors.Catatan_Tambahan}
                />
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <Label
                    forLabel="Detail_SP"
                    title="Detail Sparepart yang digunakan:"
                  />
                  {fetchDataDetailSP && fetchDataDetailSP.length > 0 ? (
                    <Table data={fetchDataDetailSP} />
                  ) : (
                    <p className="text-muted">Tidak Ada Sparepart.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="float-end my-4 mx-1">
          <Button
            classType="secondary px-4 py-2"
            label="KEMBALI"
            onClick={() => onChangePage("index")}
            type="button"
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="SIMPAN"
            disabled={isLoading}
          />
        </div>
      </form>
    </>
  );
}