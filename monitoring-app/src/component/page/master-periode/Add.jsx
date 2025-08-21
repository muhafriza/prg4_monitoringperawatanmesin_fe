import { useRef, useState } from "react";
import { object, string, date } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Icon from "../../part/Icon";
import Swal from "sweetalert2";

export default function MasterPeriodAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const formDataRef = useRef({
    perAwal: "",
    perAkhir: "",
    perPeriode: "",
  });

  const userSchema = object({
    perAwal: date().required("required").nullable(),
    perAkhir: date().required("required").nullable(),
    perPeriode: string().max(20, "20 characters max").required("required"),
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

    const perAwalYear = new Date(formDataRef.current.perAwal).getFullYear();
    const perAkhirYear = new Date(formDataRef.current.perAkhir).getFullYear();

    if (perAwalYear !== perAkhirYear) {
      Swal.fire(
        "Error",
        "The Activity Start Date and Activity End Date must be in the same year.",
        "error"
      );
      return;
    }

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "MasterPeriod/CreatePeriod",
          formDataRef.current
        );

        if (!data) {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data periode.");
        } else if (data[0] && data[0].hasil === "EXIST") {
          throw new Error("Data sudah ada.");
        } else {
          Swal.fire("Sukses", "Data periode berhasil disimpan", "success");
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
            Tambah Data Periode Baru
          </div>
          <div className="card-body">
            <div className="row p-4">
              <div className="col-lg-4">
                <Input
                  type="date"
                  forInput="perAwal"
                  label="Activity Start Date"
                  isRequired
                  value={formDataRef.current.perAwal}
                  onChange={handleInputChange}
                  errorMessage={errors.perAwal}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="date"
                  forInput="perAkhir"
                  label="Activity End Date"
                  isRequired
                  value={formDataRef.current.perAkhir}
                  onChange={handleInputChange}
                  errorMessage={errors.perAkhir}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="perPeriode"
                  label="Period Name"
                  isRequired
                  value={formDataRef.current.perPeriode}
                  onChange={handleInputChange}
                  errorMessage={errors.perPeriode}
                />
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
          </div>
        </div>
      </form>

    </>
  );
}
