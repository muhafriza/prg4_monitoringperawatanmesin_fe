import { useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import { useEffect } from "react";


export default function MasterKaryawanAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const formDataRef = useRef({
    usr_id: "",
    rol_id: "",
    app_id: "",
    usr_status: "Aktif",
    usr_created_by: "",
    usr_created_date: "",
  });

  const [userOptionData, setUserOptionData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterUser/CreateUser",
          {
            id: withID
          }
        );
        console.log(data);


        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data User.");
        } else {
          // Update state with the fetched data
          setFormData(data[0]); // Assuming data[0] is the correct object with the fields
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
  });
  
  
  const userSchema = object({
    usr_id: string()
      .max(50, "maksimum 100 karakter")
      .required("harus diisi"),
    rol_id: string(),
    app_id: string(),
    usr_status: string(),
    usr_created_by: string(),
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
        // Call the stored procedure here, assuming the API endpoint is set up for this
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
            Tambah Data User Baru
          </div>
                
          <div class="form-group">
    <label for="role">Role</label>
    <select id="role" name="role" class="form-control">
        <option value="ROL60">Administrator UPT</option>
        <option value="ROL61">PIC UPT</option>
        <option value="ROL62">TEKNISI</option>
    </select>
</div>
   
              {/* dropdown user */}
             <div className="card-body p-4">
            <div className="row">
            <div className="col-lg-3">
            <label htmlFor="userDropdown" className="form-label">
              Pilih User
             </label>
             <select
        id="userDropdown"
        className="form-select"
        value={formDataRef.current.usr_id}
        onChange={(e) => handleInputChange(e)}
        required
      >
        <option value="">-- Pilih User --</option>
        {userOptions.map((option) => (
          <option key={option.usr_id} value={option.usr_id}>
            {option.usr_id}
          </option>
        ))}
      </select>
      {errors.usr_id && (
        <div className="text-danger">{errors.usr_id}</div>
      )}
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
        </div>
      </form>
    </>
  );
}