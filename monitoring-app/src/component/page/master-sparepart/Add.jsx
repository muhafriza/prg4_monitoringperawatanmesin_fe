import { useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import FileUpload from "../../part/FileUpload";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterSparepartAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const formDataRef = useRef({
    spa_nama_sparepart: "",
    spa_deskripsi: "",
    spa_gambar_sparepart: "",
    spa_merk: "",
    spa_stok: "",
    spa_status: "Aktif",
    spa_tanggal_masuk: "",
  });
  const fileGambarRef = useRef(null);

  const userSchema = object({
    spa_nama_sparepart: string()
      .max(50, "maksimum 100 karakter")
      .required("harus diisi"),
    spa_deskripsi: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    spa_gambar_sparepart: string(),
    spa_merk: string().required("harus diisi"),
    spa_stok: string()
      .matches(/^\d*$/, "Hanya angka yang diperbolehkan") // Validasi angka
      .min(0, "Stok tidak boleh kurang dari 0") // Menambahkan validasi minimal 0
      .required("harus diisi"), // Harus diisi
    spa_tanggal_masuk: string().test(
      "is-valid-date",
      "Tanggal masuk tidak boleh kurang dari hari ini",
      (value) => {
        const today = new Date().toISOString().split("T")[0];
        return value >= today;
      }
    ),
    spa_status: string(),
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
    // Validasi hanya angka untuk field "spa_stok"
    if (name === "spa_stok") {
      if (!/^\d*$/.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "Hanya angka yang diperbolehkan",
        }));
        return;
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      const uploadPromises = [];

      if (fileGambarRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileGambarRef.current).then(
            (data) => (formDataRef.current["spa_gambar_sparepart"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);

        // Call the stored procedure here, assuming the API endpoint is set up for this
        const data = await UseFetch(
          API_LINK + "MasterSparepart/CreateSparepart",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data Sparepart.");
        } else {
          SweetAlert("Sukses", "Data Sparepart berhasil disimpan", "success");
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
          <div className="card-header bg-primary lead fw-medium text-white">
            Tambah Data Sparepart Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="spa_nama_sparepart"
                  label="Nama Sparepart"
                  isRequired
                  value={formDataRef.current.spa_nama_sparepart}
                  onChange={handleInputChange}
                  errorMessage={errors.spa_nama_sparepart}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="spa_deskripsi"
                  label="Deskripsi"
                  isRequired
                  value={formDataRef.current.spa_deskripsi}
                  onChange={handleInputChange}
                  errorMessage={errors.spa_deskripsi}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="spa_merk"
                  label="Merk"
                  isRequired
                  value={formDataRef.current.spa_merk}
                  onChange={handleInputChange}
                  errorMessage={errors.spa_merk}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="spa_stok"
                  label="Stok"
                  isRequired
                  value={formDataRef.current.spa_stok}
                  onChange={handleInputChange}
                  errorMessage={errors.spa_stok}
                />
              </div>
              <div className="col-lg-4">
                <FileUpload
                  forInput="spa_gambar_sparepart"
                  label="Gambar Sparepart (.jpg, .png)"
                  formatFile=".jpg,.png"
                  ref={fileGambarRef}
                  onChange={() => handleFileChange(fileGambarRef, "jpg,png")}
                  errorMessage={errors.spa_gambar_sparepart}
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
                  forInput="spa_tanggal_masuk"
                  label="Tanggal Masuk"
                  isRequired
                  value={formDataRef.current.spa_tanggal_masuk}
                  onChange={handleInputChange}
                  errorMessage={errors.spa_tanggal_masuk}
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
