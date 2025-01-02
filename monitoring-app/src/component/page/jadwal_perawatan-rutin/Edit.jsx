import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UploadFile from "../../util/UploadFile";
import FileUpload from "../../part/FileUpload";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterSparepartEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const formDataRef = useRef({
    idSparepart: "",
    namaSparepart: "",
    deskripsi: "",
    gambarSparepart: "",
    merk: "",
    stok: "",
    tanggalMasuk: "",
  });

  const fileGambarRef = useRef(null);

  const userSchema = object({
    idSparepart: string(),
    namaSparepart: string()
      .max(50, "maksimum 50 karakter")
      .required("harus diisi"),
    deskripsi: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    gambarSparepart: string().nullable(),
    merk: string().nullable(),
    stok: string()
    .matches(/^\d*$/, "Hanya angka yang diperbolehkan") // Validasi angka
    .min(0, "Stok tidak boleh kurang dari 0") // Menambahkan validasi minimal 0
    .required("harus diisi"), // Harus diisi
    tanggalMasuk: string().test(
      "is-valid-date",
      "Tanggal masuk tidak boleh kurang dari hari ini",
      (value) => {
        const today = new Date().toISOString().split("T")[0];
        return value >= today;
      }
    ),
  });

  const handleFileChange = (ref, extAllowed) => {
    const file = ref.current.files[0];

    if (file) {
      const fileExt = file.name.split(".").pop().toLowerCase();
      const fileSize = file.size;
      let error = "";

      if (fileSize / 1024 / 1024 > 10) error = "Berkas terlalu besar";
      else if (!extAllowed.split(",").includes(fileExt))
        error = "Format berkas tidak valid";

      if (error) {
        ref.current.value = "";
        setErrors((prevErrors) => ({
          ...prevErrors,
          [ref.current.name]: error,
        }));
        setPreviewImage(null); // Reset preview jika ada error
        console.log("Error File:", error); // Debug log
        return; // Hentikan eksekusi jika error
      }

      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);

      setErrors((prevErrors) => ({
        ...prevErrors,
        [ref.current.name]: null,
      }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const data = await UseFetch(
          API_LINK + `MasterSparepart/DetailSparepart`,
          { id: withID }
        );
        if (!data || data === "ERROR" || data.length === 0) {
          throw new Error("Gagal mengambil data Sparepart.");
        }

        const sparepartData = data[0];
        sparepartData.tanggalMasuk = formatDate(
          sparepartData.tanggalMasuk,
          "YYYY-MM-DD"
        );
        sparepartData.idSparepart = withID;
        delete sparepartData.status;
        delete sparepartData.spa_status;

        formDataRef.current = { ...formDataRef.current, ...sparepartData };

        // Jika gambar tersedia, buat preview
        if (sparepartData.gambarSparepart) {
          setPreviewImage(FILE_LINK + sparepartData.gambarSparepart); // FILE_LINK berisi URL path ke file
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  function formatDate(dateString, format) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    switch (format) {
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      default:
        return dateString;
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validasi hanya angka untuk field "stok"
    if (name === "stok") {
      if (!/^\d*$/.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "Hanya angka yang diperbolehkan",
        }));
        return;
      }
    }

    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    console.error("Validation :", validationErrors);

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      const uploadPromises = [];

      if (fileGambarRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileGambarRef.current)
            .then((data) => {
              formDataRef.current["gambarSparepart"] = data.Hasil;
              console.log("Hasil upload file:", data);
            })
            .catch((error) => {
              console.error("Error upload file:", error);
            })
        );
      }
      console.log("Data gambar dikirim:", formDataRef.current.gambarSparepart);
      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterSparepart/EditSparepart",
          formDataRef.current
        );

        console.log("Payload:", formDataRef.current);
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
    console.log("ErrorSaat Simpan Data: ".formDataRef.gambarSparepart);
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Ubah Data Sparepart
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="namaSparepart"
                  label="Nama Sparepart"
                  isRequired
                  value={formDataRef.current.namaSparepart}
                  onChange={handleInputChange}
                  errorMessage={errors.namaSparepart}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="deskripsi"
                  label="Deskripsi"
                  isRequired
                  value={formDataRef.current.deskripsi}
                  onChange={handleInputChange}
                  errorMessage={errors.deskripsi}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="merk"
                  label="Merk"
                  isRequired
                  value={formDataRef.current.merk}
                  onChange={handleInputChange}
                  errorMessage={errors.merk}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="stok"
                  label="Stok"
                  isRequired
                  value={formDataRef.current.stok}
                  onChange={handleInputChange}
                  errorMessage={errors.stok}
                />
              </div>
              <div className="col-lg-4">
                <FileUpload
                  forInput="gambarSparepart"
                  label="Gambar Sparepart (.jpg, .png)"
                  formatFile=".jpg,.png"
                  ref={fileGambarRef}
                  onChange={() => handleFileChange(fileGambarRef, "jpg,png")}
                  errorMessage={errors.gambarSparepart}
                />
                {previewImage && (
                  <div className="mt-3">
                    <img
                      src={previewImage}
                      alt="Preview Gambar"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="col-lg-6">
                <Input
                  type="date"
                  forInput="tanggalMasuk"
                  label="Tanggal Masuk"
                  value={formDataRef.current.tanggalMasuk}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalMasuk}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="float-end my-4 mx-1">
          <Button
            classType="secondary me-2 px-4 py-2"
            label="BATAL"
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