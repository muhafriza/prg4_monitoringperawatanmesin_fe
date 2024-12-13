import { useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterSparepartAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const formDataRef = useRef({
    nama_sparepart: "",
    deskripsi: "",
    merk: "",
    stok: "",
    status: 1,
  });

  const userSchema = object({
    nama_sparepart: string()
      .max(50, "maksimum 100 karakter")
      .required("harus diisi"),
    deskripsi: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    merk: string(),
    stok: string(),
    status: string(),
  });

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

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      try {
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
          <div className="card-header bg-primary fw-medium text-white">
            Tambah Data Sparepart Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="nama_sparepart"
                  label="Nama Sparepart"
                  isRequired
                  value={formDataRef.current.nama_sparepart}
                  onChange={handleInputChange}
                  errorMessage={errors.nama_sparepart}
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
