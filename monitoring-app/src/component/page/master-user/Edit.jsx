import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterKaryawanEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    idRole: "",
    namaKaryawan: "",
    NIK: "",
    tanggalLahir: "",
    noTelp: "",
    alamat: "",
  });

  const userSchema = object({
    idRole: string().optional(),
    namaKaryawan: string()
      .max(50, "maksimum 50 karakter")
      .required("Nama karyawan harus diisi"),
    NIK: string().required("NIK harus diisi"),
    tanggalLahir: string().required("Tanggal Lahir harus diisi"),
    noTelp: string().required("No Telepon harus diisi"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const data = await UseFetch(
          API_LINK + `MasterKaryawan/DetailKaryawan`,
          { id: withID }
        );
        console.log("ini data: " + data);
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Gagal mengambil data Karyawan.");
        }

        const karyawanData = data[0];
        karyawanData.tanggalLahir = formatDate(
          karyawanData.tanggalLahir,
          "YYYY-MM-DD"
        );
        // nanya
        delete sparepartData.status;
        delete sparepartData.spa_status;

        formDataRef.current = { ...formDataRef.current, ...sparepartData };
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

    // Validasi hanya angka untuk field "NIK"
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
    console.log("Data yang dikirimkan: ", validationErrors);

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "MasterKaryawan/EditKaryawan",
          formDataRef.current
        );

        if (!data || data == "ERROR") {
          console.log("ini data edit form nya: "+formDataRef.current);
          throw new Error("Terjadi kesalahan: Gagal menyimpan data karyawan.");
        } else {
          SweetAlert("Sukses", "Data karyawan berhasil disimpan", "success");
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
            Ubah Data Karyawan
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="namaKaryawan"
                  label="Nama Karyawan"
                  isRequired
                  value={formDataRef.current.namaKaryawan}
                  onChange={handleInputChange}
                  errorMessage={errors.namaKaryawan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="nik"
                  label="NIK"
                  isRequired
                  value={formDataRef.current.NIK}
                  onChange={handleInputChange}
                  errorMessage={errors.deskripsi}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="date"
                  forInput="tanggalLahir"
                  label="Tanggal Lahir"
                  value={formDataRef.current.tanggalLahir}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalLahir}
                />
              </div>
              {/* nanya */}
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="notelp"
                  label="No Telepon"
                  isRequired
                  value={formDataRef.current.merk}
                  onChange={handleInputChange}
                  errorMessage={errors.merk}
                />
              </div>
              {/* nanya */}
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="alamat"
                  label="Alamat"
                  isRequired
                  value={formDataRef.current.alamat}
                  onChange={handleInputChange}
                  errorMessage={errors.alamat}
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
