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

export default function MasterMesinAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const formDataRef = useRef({
    kondisi: "",
    no_panel: "",
    lab: "",
    nama_mesin: "",
    daya_mesin: "",
    jumlah: "",
    kapasitas: "",
    tipe: "",
    status: "Aktif", // Default "Aktif"
    //mes_gambar: "", // File gambar
  });

  const fileGambarRef = useRef(null); // Reference for file upload input
  const userSchema = object({
    kondisi: string().max(50, "Maksimum 50 karakter").required("Kondisi harus diisi"),
    no_panel: string().max(25, "Maksimum 25 karakter"),
    lab: string().max(50, "Maksimum 50 karakter"),
    nama_mesin: string().max(100, "Maksimum 100 karakter").required("Nama Mesin harus diisi"),
    daya_mesin: number()
      .typeError("Daya Mesin harus berupa angka")
      .positive("Harus angka positif")
      .required("Daya Mesin harus diisi"),
    jumlah: number()
      .typeError("Jumlah harus berupa angka")
      .positive("Harus angka positif")
      .integer("Harus bilangan bulat")
      .required("Jumlah harus diisi"),
    kapasitas: string().max(25, "Maksimum 25 karakter"),
    tipe: string().max(25, "Maksimum 25 karakter"),
    status: string(),
    mes_gambar: string().test(
      "mes_gambar",
      "File harus berupa gambar (.jpg, .png, .pdf)",
      (value) => {
        // Optional: Validate if it's a valid file
        if (value) {
          const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
          return allowedTypes.includes(value.type);
        }
        return true; // Allow if no file is uploaded
      }
    ),
  });
  

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

    // Validate all inputs
    const validationErrors = await validateAllInputs(formDataRef.current, userSchema, setErrors);

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      try {
        // Handle file upload if there's a file
        if (fileGambarRef.current && fileGambarRef.current.files.length > 0) {
          const fileUploadResult = await UploadFile(fileGambarRef.current);
          formDataRef.current["mes_gambar"] = fileUploadResult.Hasil;
        }

        // Send data to API
        const data = await UseFetch(
          API_LINK + "MasterMesin/CreateMesin",
          formDataRef.current
        );

        if (data === "ERROR") {
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
          <div className="card-header bg-primary fw-medium text-white">
            Tambah Data Mesin Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="kondisi"
                  label="Kondisi Operasional (%)"
                  isRequired
                  value={formDataRef.current.kondisi}
                  onChange={handleInputChange}
                  errorMessage={errors.kondisi}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="no_panel"
                  label="No Panel"
                  value={formDataRef.current.no_panel}
                  onChange={handleInputChange}
                  errorMessage={errors.no_panel}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="lab"
                  label="Lab"
                  value={formDataRef.current.lab}
                  onChange={handleInputChange}
                  errorMessage={errors.lab}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="nama_mesin"
                  label="Nama Mesin"
                  isRequired
                  value={formDataRef.current.nama_mesin}
                  onChange={handleInputChange}
                  errorMessage={errors.nama_mesin}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="daya_mesin"
                  label="Daya Mesin (W)"
                  isRequired
                  value={formDataRef.current.daya_mesin}
                  onChange={handleInputChange}
                  errorMessage={errors.daya_mesin}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="jumlah"
                  label="Jumlah"
                  isRequired
                  value={formDataRef.current.jumlah}
                  onChange={handleInputChange}
                  errorMessage={errors.jumlah}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="kapasitas"
                  label="Kapasitas"
                  value={formDataRef.current.kapasitas}
                  onChange={handleInputChange}
                  errorMessage={errors.kapasitas}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="tipe"
                  label="Tipe"
                  value={formDataRef.current.tipe}
                  onChange={handleInputChange}
                  errorMessage={errors.tipe}
                />
              </div>
              <div className="col-lg-4">
                <FileUpload
                  forInput="mes_gambar"
                  label="Gambar Alat/Mesin (.pdf, .jpg, .png)"
                  formatFile=".pdf,.jpg,.png"
                  ref={fileGambarRef}
                  errorMessage={errors.mes_gambar}
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
