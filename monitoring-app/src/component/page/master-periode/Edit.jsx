import { useRef, useState, useEffect } from "react";
import { number, object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Icon from "../../part/Icon";

export default function MasterPeriodEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    perId: "",
    perAwal: "",
    perAkhir: "",
    perPeriode: "",
  });

  const userSchema = object({
    perId: number(),
    perAwal: string().required("required"),
    perAkhir: string().required("required"),
    perPeriode: string().max(20, "20 chars max").required("required"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(API_LINK + "MasterPeriod/GetPeriodById", {
          id: withID,
        });

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data periode.");
        } else {
          const formattedData = {
            perId: data[0].perId,
            perAwal: new Date(data[0].perAwal).toLocaleDateString("en-CA"),
            perAkhir: new Date(data[0].perAkhir).toLocaleDateString("en-CA"),
            perPeriode: data[0].perPeriode,
          };
          formDataRef.current = formattedData;
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
    };

    fetchData();
  }, [withID]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleUpdate = async (e) => {
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
          API_LINK + "MasterPeriod/UpdatePeriod",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Error: Failed to submit the data.");
        } else {
          SweetAlert("Success", "Data successfully updated", "success");
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

  return (
    <>

      
        {isError.error && (
          <div className="flex-fill">
            <Alert type="danger" message={isError.message} />
          </div>
        )}
        <form onSubmit={handleUpdate}>
          <div className="card">
            <div className="card-header bg-primary lead fw-medium text-white">
            Ubah Data Periode
          </div>

            <div className="card-body p-4">
              {isLoading ? (
                <Loading />
              ) : (
                <div className="row mt-4">
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
              )}
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
