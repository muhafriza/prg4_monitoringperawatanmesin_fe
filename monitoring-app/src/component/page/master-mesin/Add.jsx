import { useRef, useState } from "react";
import { object, string, number } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import FileUpload from "../../part/FileUpload";
import UploadFile from "../../util/UploadFile";

const dataUPT = [
  { Value: "PEMESINAN", Text: "PEMESINAN" },
  { Value: "MANUFAKTUR", Text: "MANUFAKTUR" },
  { Value: "DESAIN DAN METROLOGI", Text: "DESAIN DAN METROLOGI" },
  { Value: "OTOMASI", Text: "OTOMASI" },
  { Value: "PERAWATAN", Text: "PERAWATAN" },
  { Value: "OTOMOTIF", Text: "OTOMOTIF" },
  { Value: "ALAT BERAT", Text: "ALAT BERAT" },
  { Value: "SIPIL", Text: "SIPIL" },
  { Value: "PRODUKSI", Text: "PRODUKSI" },
  { Value: "LPT3", Text: "LPT3" },
];

export default function MasterMesinAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const formDataRef = useRef({
    mes_kondisi_operasional: "",
    mes_no_panel: "",
    mes_lab: "",
    mes_nama_mesin: "",
    mes_upt: "",
    mes_daya_mesin: "",
    mes_kapasitas: "",
    mes_tipe: "",
    mes_status: "Aktif",
    mes_gambar: "", // File gambar
  });

  const fileGambarRef = useRef(null); // Reference for file upload input
  const userSchema = object({
    mes_kondisi_operasional: string()
      .max(50, "Maksimum 50 karakter")
      .required("mes_kondisi_operasional harus diisi"),
    mes_no_panel: string().max(25, "Maksimum 25 karakter"),
    mes_lab: string().max(50, "Maksimum 50 karakter"),
    mes_nama_mesin: string()
      .max(100, "Maksimum 100 karakter")
      .required("Nama Mesin harus diisi"),
    mes_daya_mesin: number()
      .typeError("Daya Mesin harus berupa angka")
      .required("Daya Mesin harus diisi"),
    mes_kapasitas: string().max(25, "Maksimum 25 karakter"),
    mes_tipe: string().max(25, "Maksimum 25 karakter"),
    mes_status: string(),
    mes_gambar: string(),
    mes_upt: string().required("UPT Harus diisi"),
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
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    console.log(formDataRef.current);
    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      const uploadPromises = [];

      // Handle file upload if present
      if (fileGambarRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileGambarRef.current).then((data) => {
            // Store the file URL (assuming data.Hasil contains the file URL or path)
            formDataRef.current["mes_gambar"] = data.Hasil;
          })
        );
      }

      try {
        // Wait for all uploads to complete
        await Promise.all(uploadPromises);

        // Prepare FormData for API request
        const formData = new FormData();

        console.log("144: ", formData);

        // Send data to API using FormData
        const data = await UseFetch(
          API_LINK + "Mesin/CreateMesin",
          formDataRef.current
        );

        if (!data) {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data Mesin.");
        } else {
          SweetAlert("Sukses", "Data Mesin berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    } else {
      window.scrollTo(0, 0);
    }
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
            Tambah Data Mesin Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="mes_nama_mesin"
                  label="Nama Mesin"
                  isRequired
                  value={formDataRef.current.mes_nama_mesin}
                  onChange={handleInputChange}
                  errorMessage={errors.mes_nama_mesin}
                />
              </div>
              <div className="col-lg-3">
                <label htmlFor="mes_upt" className="form-label fw-bold">
                  UPT <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  id="mes_upt"
                  name="mes_upt"
                  className="form-select"
                  value={formDataRef.current.mes_upt}
                  onChange={handleInputChange}
                >
                  <option value="">-- Pilih UPT --</option>
                  {dataUPT.map((upt) => (
                    <option key={upt.Value} value={upt.Value}>
                      {upt.Text}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="mes_kondisi_operasional"
                  label="Kondisi Operasional (%)"
                  isRequired
                  value={formDataRef.current.mes_kondisi_operasional}
                  onChange={handleInputChange}
                  errorMessage={errors.mes_kondisi_operasional}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="mes_no_panel"
                  label="No Panel"
                  value={formDataRef.current.mes_no_panel}
                  onChange={handleInputChange}
                  errorMessage={errors.mes_no_panel}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="mes_lab"
                  label="Lab"
                  value={formDataRef.current.mes_lab}
                  onChange={handleInputChange}
                  errorMessage={errors.mes_lab}
                />
              </div>

              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="mes_daya_mesin"
                  label="Daya Mesin (W)"
                  isRequired
                  value={formDataRef.current.mes_daya_mesin}
                  onChange={handleInputChange}
                  errorMessage={errors.mes_daya_mesin}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="mes_kapasitas"
                  label="mes_kapasitas"
                  value={formDataRef.current.mes_kapasitas}
                  onChange={handleInputChange}
                  errorMessage={errors.mes_kapasitas}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="mes_tipe"
                  label="mes_tipe"
                  value={formDataRef.current.mes_tipe}
                  onChange={handleInputChange}
                  errorMessage={errors.mes_tipe}
                />
              </div>
              <div className="col-lg-4">
                <FileUpload
                  forInput="mes_gambar"
                  label="Gambar Mesin (.jpg, .png)"
                  formatFile=".jpg,.png"
                  ref={fileGambarRef}
                  onChange={() => handleFileChange(fileGambarRef, "jpg,png")}
                  errorMessage={errors.mes_gambar}
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
