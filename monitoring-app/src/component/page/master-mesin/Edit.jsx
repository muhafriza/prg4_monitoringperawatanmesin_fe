import { useEffect, useRef, useState } from "react";
import { object, string, number } from "yup"; // Adjusted for new schema validation
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterMesinEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    mes_id_mesin: "",
    mes_nama_mesin: "",
    mes_daya_mesin: "",
    mes_jumlah: "",
    mes_kapasitas: "",
    mes_tipe: "",
    mes_status: "",
    mes_kondisi_operasional: "",
    mes_no_panel: "",
    mes_lab: "",
  });

  const userSchema = object({
    mes_id_mesin: string().optional(),
    mes_nama_mesin: string()
      .max(100, "Maksimum 100 karakter")
      .required("Nama Mesin harus diisi"),
    mes_kondisi_operasional: string().optional(),
    mes_no_panel: string().optional(),
    mes_lab: string().optional(),
    mes_daya_mesin: number()
      .positive("Daya Mesin harus lebih besar dari 0")
      .required("Daya Mesin harus diisi"),
    mes_jumlah: number()
      .integer("Jumlah harus berupa angka bulat")
      .positive("Jumlah harus lebih besar dari 0")
      .required("Jumlah Mesin harus diisi"),
    mes_kapasitas: string().optional(),
    mes_tipe: string().optional(),
    mes_status: string().optional(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const data = await UseFetch(
          `${API_LINK}MasterMesin/DetailMesin`,
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Gagal mengambil data Mesin.");
        }

        const MesinData = data[0];
        MesinData.mes_created_date = formatDate(MesinData.mes_created_date, "YYYY-MM-DD");
        MesinData.mes_modi_date = formatDate(MesinData.mes_modi_date, "YYYY-MM-DD");

        // Initialize formDataRef with the fetched data
        formDataRef.current = { ...formDataRef.current, ...MesinData };
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);

  const formatDate = (dateString, format) => {
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validasi hanya angka untuk field "mes_jumlah" and "mes_daya_mesin"
    if (name === "mes_jumlah" || name === "mes_daya_mesin") {
      if (!/^\d*\.?\d*$/.test(value)) {
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

    // Log the data before validation
    console.log("Attempting to submit form with data:", formDataRef.current);

    // Validate the form inputs
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    // Log the validation errors
    console.log("Validation Errors:", validationErrors);

    // If there are no validation errors
    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      try {
        const data = await UseFetch(
          `${API_LINK}MasterMesin/EditMesin`,
          formDataRef.current
        );

        if (!data || data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data mesin.");
        } else {
          SweetAlert("Sukses", "Data mesin berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        console.error("Error saving data:", error.message);
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    } else {
      window.scrollTo(0, 0);  // Scroll to the top of the page if validation fails
      console.log("Form validation failed, scrolling to top.");
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
            Ubah Data Mesin
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
                <Input
                  type="text"
                  forInput="mes_kondisi_operasional"
                  label="Kondisi Operasional"
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
                  type="number"
                  forInput="mes_daya_mesin"
                  label="Daya Mesin"
                  isRequired
                  value={formDataRef.current.mes_daya_mesin}
                  onChange={handleInputChange}
                  errorMessage={errors.mes_daya_mesin}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="number"
                  forInput="mes_jumlah"
                  label="Jumlah Mesin"
                  isRequired
                  value={formDataRef.current.mes_jumlah}
                  onChange={handleInputChange}
                  errorMessage={errors.mes_jumlah}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="mes_kapasitas"
                  label="Kapasitas"
                  value={formDataRef.current.mes_kapasitas}
                  onChange={handleInputChange}
                  errorMessage={errors.mes_kapasitas}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="mes_tipe"
                  label="Tipe"
                  value={formDataRef.current.mes_tipe}
                  onChange={handleInputChange}
                  errorMessage={errors.mes_tipe}
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
