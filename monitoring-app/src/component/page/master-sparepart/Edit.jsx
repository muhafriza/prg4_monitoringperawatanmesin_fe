import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterSparepartEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    idSparepart: "",
    namaSparepart: "",
    deskripsiSparepart: "",
    merkSparepart: "",
    stokSparepart: "",
    statusSparepart: 1,
    tanggalMasuk: "",
  });

  const userSchema = object({
    idSparepart: string().optional(), // Tambahkan ini
    namaSparepart: string()
      .max(50, "maksimum 50 karakter")
      .required("Nama sparepart harus diisi"),
    deskripsiSparepart: string()
      .max(100, "maksimum 100 karakter")
      .required("Deskripsi sparepart harus diisi"),
    merkSparepart: string().required("Merk sparepart harus diisi"),
    stokSparepart: string().required("Stok sparepart harus diisi"),
    statusSparepart: string(),
    tanggalMasuk: string().required("Tanggal masuk harus diisi"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const data = await UseFetch(
          `${API_LINK}MasterSparepart/GetDataSparepartById`,
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
  function formatDate(dateString, format = "DD/MM/YYYY") {
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

    // Validasi hanya angka untuk field "stokSparepart"
    if (name === "stokSparepart") {
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
        console.log("Data yang dikirimkan: ", formDataRef.current);

        const data = await UseFetch(
          API_LINK + "MasterSparepart/EditSparepart",
          formDataRef.current
        );

        // Check for null or empty response
        if (!data || data === "ERROR") {
          console.log(formDataRef.current);
          throw new Error(
            "Terjadi kesalahan: Tidak ada respons atau terjadi kesalahan server null. + " +
              formDataRef.current
          );
        }

        if (data.success) {
          SweetAlert("Sukses", "Data Sparepart berhasil disimpan", "success");
          onChangePage("index");
        } else {
          throw new Error("Gagal menyimpan data: " + data.message);
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
    console.log("Ini Error: ", validationErrors);
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
                  forInput="deskripsiSparepart"
                  label="Deskripsi"
                  isRequired
                  value={formDataRef.current.deskripsiSparepart}
                  onChange={handleInputChange}
                  errorMessage={errors.deskripsiSparepart}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="merkSparepart"
                  label="Merk"
                  isRequired
                  value={formDataRef.current.merkSparepart}
                  onChange={handleInputChange}
                  errorMessage={errors.merkSparepart}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="stokSparepart"
                  label="Stok"
                  isRequired
                  value={formDataRef.current.stokSparepart}
                  onChange={handleInputChange}
                  errorMessage={errors.stokSparepart}
                />
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
