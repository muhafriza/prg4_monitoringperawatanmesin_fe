import { useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import DropDown from "../../part/Dropdown";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterUserAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const formDataRef = useRef({
    use_npk: "",
    use_role: "",
    // use_created_by: "",
    // use_status: "Aktif",
  });

  const userSchema = object({
    use_npk: string()
      .required("NPK harus diisi")
      .max(20, "NPK maksimum 20 karakter"),
    use_role: string().required("Role harus dipilih"),
    // use_created_by: string().max(50, "Maksimum 50 karakter"),
    // use_status: string().required("Status harus dipilih"),
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
          API_LINK + "MasterUser/CreateUser",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data User.");
        } else {
          SweetAlert("Sukses", "Data User berhasil disimpan", "success");
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
            Tambah Data User Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="use_npk"
                  label="NPK"
                  isRequired
                  value={formDataRef.current.use_npk}
                  onChange={handleInputChange}
                  errorMessage={errors.use_npk}
                />
              </div>
              <div className="col-lg-4">
                <DropDown
                  forInput="use_role"
                  label="Role"
                  isRequired
                  value={formDataRef.current.use_role}
                  onChange={(e) =>
                    (formDataRef.current.use_role = e.target.value)
                  }
                  errorMessage={errors.use_role}
                  arrData={[
                    { Value: "Admin", Text: "1" },
                    { Value: "User", Text: "User" },
                    { Value: "Manager", Text: "Manager" },
                  ]}
                />
              </div>
              {/* <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="use_created_by"
                  label="Dibuat Oleh"
                  value={formDataRef.current.use_created_by}
                  onChange={handleInputChange}
                  errorMessage={errors.use_created_by}
                />
              </div> */}
              {/* <div className="col-lg-4">
                <DropDown
                  forInput="use_status"
                  label="Status"
                  isRequired
                  value={formDataRef.current.use_status}
                  onChange={(e) =>
                    (formDataRef.current.use_status = e.target.value)
                  }
                  errorMessage={errors.use_status}
                  arrData={[
                    { Value: "Aktif", Text: "Aktif" },
                    { Value: "Tidak Aktif", Text: "Tidak Aktif" },
                  ]}
                />
              </div> */}
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
