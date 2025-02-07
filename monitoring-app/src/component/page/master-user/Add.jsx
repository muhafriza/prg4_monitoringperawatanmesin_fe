import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import Swal from "sweetalert2";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

const dataUPT = [
  { Value: "PEMESINAN", Text: "PEMESINAN" },
  { Value: "MANUFAKTUR", Text: "MANUFAKTUR" },
  { Value: "DESAIN DAN METROLOGIS", Text: "DESAIN DAN METROLOGI" },
  { Value: "OTOMASI", Text: "OTOMASI" },
  { Value: "PERAWATAN", Text: "PERAWATAN" },
  { Value: "OTOMOTIF", Text: "OTOMOTIF" },
  { Value: "ALAT BERAT", Text: "ALAT BERAT" },
  { Value: "SIPIL", Text: "SIPIL" },
  { Value: "PRODUKSI", Text: "PRODUKSI" },
  { Value: "LPT3", Text: "LPT3" },
];

export default function MasterKaryawanAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showAdditionalInput, setShowAdditionalInput] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({
    p1: "",
    p2: "Aktif",
  });

  const formDataRef = useRef({
    usr_id: "",
    rol_id: "",
    app_id: "APP60",
    usr_status: "Aktif",
    upt: "", // Menambahkan upt ke form data
  });

  const [userOptions, setUserOptions] = useState([]); // State untuk menyimpan data pengguna

  // Mengambil data karyawan dari API
  useEffect(() => {
    const fetchDataKaryawan = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterUser/GetUsernameKaryawan",
          currentFilter
        );
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data User.");
        } else {
          setUserOptions(data); // Set data yang diterima ke dalam userOptions
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

    fetchDataKaryawan();
  }, [currentFilter]); // Jalankan effect jika currentFilter berubah

  const userSchema = object({
    usr_id: string().required("Pilih User terlebih dahulu"),
    rol_id: string().required("Role/Peran Harus diisi"),
    app_id: string(),
    usr_status: string(),
    upt: string().when("role_baru", {
      is: "PIC",
      then: (schema) => schema.required("UPT wajib diisi jika role adalah PIC"),
      otherwise: (schema) => schema.optional(),
    }),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Jika role yang dipilih adalah "PIC", tampilkan input tambahan
    if (name === "rol_id") {
      setShowAdditionalInput(value === "PIC"); // Menampilkan input tambahan untuk PIC
    }

    // Menyimpan nilai input ke dalam formDataRef.current
    console.log(`${formDataRef.current.rol_id}: ${value}`);
    formDataRef.current[name] = value;

    const validationError = validateInput(name, value, userSchema);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
    console.log(validationError);
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    // console.log(formDataRef.current);
    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      const rol_final =
        formDataRef.current.rol_id === "PIC"
          ? `${formDataRef.current.rol_id} ${formDataRef.current.upt}`
          : formDataRef.current.rol_id;

      console.log(formDataRef.current.upt);
      console.log("INI FINAL ROLE: ", rol_final);
      try {
        // Call the stored procedure here, assuming the API endpoint is set up for this
        const data = await UseFetch(API_LINK + "MasterUser/CreateUser", {
          usr_id: formDataRef.current.usr_id,
          rol_id: rol_final,
          app_id: "APP60",
          usr_status: "Aktif",
        });

        // Check if the 'hasil' field is 'ERROR' or 'OK'
        if (data && data[0]?.hasil === "ERROR") {
          Swal.fire("Error", data[0]?.pesan, "error");
        } else if (data && data[0]?.hasil === "OK") {
          Swal.fire("Sukses", "Data User berhasil disimpan", "success");
          onChangePage("index");
        } else {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data User.");
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
          <div className="card-header bg-primary lead fw-medium text-white">
            Tambah Data User Baru
          </div>

          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <label htmlFor="userDropdown" className="form-label">
                  Pilih User<span style={{ color: "red" }}> *</span>
                </label>
                <select
                  id="userDropdown"
                  name="usr_id"
                  className="form-select"
                  value={formDataRef.current.usr_id}
                  onChange={(e) => handleInputChange(e)}
                  required
                >
                  <option value="">-- Pilih User --</option>
                  {userOptions.map((option) => (
                    <option key={option.Username} value={option.Username}>
                      {option.Username}
                    </option>
                  ))}
                </select>
                {errors.usr_id && (
                  <div className="text-danger">{errors.usr_id}</div>
                )}
              </div>

              <div className="col-lg-3">
                <label htmlFor="role">
                  Role<span style={{ color: "red" }}> *</span>
                </label>
                <select
                  id="rol_id"
                  name="rol_id"
                  className="form-select"
                  onChange={handleInputChange}
                >
                  <option value="ADMINISTRATOR UPT">Administrator UPT</option>
                  <option value="PIC">PIC UPT</option>
                  <option value="TEKNISI">TEKNISI</option>
                </select>
              </div>

              {showAdditionalInput && (
                <div className="col-lg-3">
                  <label htmlFor="mes_upt" className="form-label fw-bold">
                    UPT <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    id="upt"
                    name="upt"
                    className="form-select"
                    onChange={handleInputChange}
                  >
                    <option value="">-- Pilih UPT --</option>
                    {dataUPT.map((upt) => (
                      <option key={upt.Value} value={upt.Value}>
                        {upt.Text}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
