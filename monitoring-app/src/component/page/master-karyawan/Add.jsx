import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input"; // Importing the Input component
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterKaryawanAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [usernames, setUsernames] = useState([]);
  
  const formDataRef = useRef({
    kry_username: "",
    kry_role: "Admin UPT", // Default "Admin UPT"
  });

  const userSchema = object({
    kry_username: string().required("Username harus diisi"),
    kry_role: string().required("Role harus dipilih"),
  });

  // Fetch usernames from the database when the component mounts
  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const data = await UseFetch(API_LINK + "MasterUser/GetDataAlatMesin");
        setUsernames(data);  // Assume this returns an array of usernames
      } catch (error) {
        setIsError({ error: true, message: "Gagal memuat data username" });
      }
    };
    
    fetchUsernames();
  }, []);

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
        // Send data to API
        const data = await UseFetch(
          API_LINK + "MasterKaryawan/CreateKaryawan",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data Karyawan.");
        } else {
          SweetAlert("Sukses", "Data Karyawan berhasil disimpan", "success");
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
            Tambah Data Karyawan Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Input
                  type="select" // Using the Input component for the dropdown
                  forInput="kry_username"
                  label="Pilih Username"
                  value={formDataRef.current.kry_username}
                  onChange={handleInputChange}
                  errorMessage={errors.kry_username}
                >
                  <option value="">Pilih Username</option>
                  {usernames.map((username, index) => (
                    <option key={index} value={username}>{username}</option>
                  ))}
                </Input>
              </div>
              <div className="col-lg-6">
                <Input
                  type="select" // Using the Input component for the dropdown
                  forInput="kry_role"
                  label="Pilih Role"
                  value={formDataRef.current.kry_role}
                  onChange={handleInputChange}
                  errorMessage={errors.kry_role}
                >
                  <option value="Admin UPT">Admin UPT</option>
                  <option value="Teknisi">Teknisi</option>
                  <option value="PIC UPT">PIC UPT</option>
                </Input>
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
