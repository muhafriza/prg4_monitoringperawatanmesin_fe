import { useEffect, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterKaryawanEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    Role_Deskripsi: "", // Placeholder untuk Role_Deskripsi yang diambil dari API
    role_baru: "", // Ini untuk dropdown
  });

  const userSchema = object({
    username: string().optional(),
    Role_Deskripsi: string(),
    role_baru: string(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });
      const key = withID;

      const username = key.split("_")[0];
      const role = key.split("_")[1];

      try {
        const data = await UseFetch(API_LINK + `MasterUser/DetailEditUser`, {
          id: username,
          rol: role,
        });

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Gagal mengambil data Karyawan.");
        }

        const karyawanData = data[0];

        setFormData({
          username:username,
          Role_Deskripsi: karyawanData.Role_Deskripsi, 
          role_baru: karyawanData.Role_Deskripsi,
        });
        
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      console.log(formData);
      try {
        const data = await UseFetch(
          API_LINK + "MasterUser/EditUser",
          formData
        );

        if (!data) {
          console.log(data);
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
              <div className="form-group">
                <label htmlFor="role_baru">Role</label>
                <select
                  id="role_baru"
                  name="role_baru"
                  className="form-control"
                  value={formData.role_baru || ""} // Pastikan dropdown mengikat nilai role_baru
                  onChange={handleInputChange}
                >
                  <option value="ADMINISTRATOR UPT">Administrator UPT</option>
                  <option value="PIC">PIC UPT</option>
                  <option value="TEKNISI">TEKNISI</option>
                </select>
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
