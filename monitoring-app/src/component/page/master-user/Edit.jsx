import { useEffect, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

const dataUPT = [
  { Value: "PEMESINAN", Text: "PEMESINAN" },
  { Value: "MANUFAKTUR", Text: "MANUFAKTUR" },
  { Value: "DESAIN DAN METROLOGI", Text: "DESAIN DAN METROLOGI" },
  { Value: "OTOMASI", Text: "OTOMASI" },
  { Value: "PERAWATAN", Text: "PERAWATAN" },
  { Value: "OTOMOTIF", Text: "OTOMOTIF" },
  { Value: "ALAT BERAT", Text: "ALAT BERAT" },
  { Value: "SIPIL", Text: "SIPIL" },
  { Value: "PRODUKSI", Text: "PRODUKSI" },
  { Value: "LPT3", Text: "LPT3" },
];

export default function MasterKaryawanEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [showAdditionalInput, setShowAdditionalInput] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    Role_Deskripsi: "",
    role_baru: "",
    upt: "",
  });

  const userSchema = object({
    username: string().optional(),
    Role_Deskripsi: string().required(),
    role_baru: string().required(),
    upt: string().when("role_baru", {
      is: "PIC",
      then: (schema) => schema.required("UPT wajib diisi jika role adalah PIC"),
      otherwise: (schema) => schema.optional(),
    }),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const [username, role] = withID.split("_");

        const data = await UseFetch(API_LINK + `MasterUser/DetailEditUser`, {
          id: username,
          rol: role,
        });

        if (!data || data === "ERROR" || data.length === 0) {
          throw new Error("Gagal mengambil data Karyawan.");
        }

        const karyawanData = data[0];
        const roleData = karyawanData.Role_Deskripsi.split(" ")[0];
        console.log(roleData);

        if (roleData === "PIC") {
          const roleParts = karyawanData.Role_Deskripsi.split(" ");
          setFormData({
            username,
            Role_Deskripsi: karyawanData.Role_Deskripsi,
            role_baru: roleData,
            upt: roleParts.length > 1 ? roleParts.slice(1).join(" ") : "", // Menggabungkan semua kata setelah "PIC"
          });
          setShowAdditionalInput(true);
        } else {
          setFormData({
            username,
            Role_Deskripsi: karyawanData.Role_Deskripsi,
            role_baru: roleData,
            upt: "",
          });
        }
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

    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      // Jika role yang dipilih adalah "PIC", tampilkan input tambahan
      if (name === "role_baru") {
        setShowAdditionalInput(value === "PIC");
        updatedData.upt = value === "PIC" ? prevData.upt : ""; // Reset UPT jika bukan PIC
      }

      const validationError = validateInput(name, value, userSchema);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [validationError.name]: validationError.error,
      }));

      return updatedData;
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).some((error) => error)) {
      window.scrollTo(0, 0);
      return;
    }

    setIsLoading(true);
    setIsError({ error: false, message: "" });

    try {
      const roleFinal =
        formData.role_baru === "PIC"
          ? `${formData.role_baru} ${formData.upt}`
          : formData.role_baru;

      const data = await UseFetch(API_LINK + "MasterUser/EditUser", {
        username: formData.username,
        Role_Deskripsi: formData.Role_Deskripsi,
        upt: roleFinal,
      });

      if (!data) {
        throw new Error("Terjadi kesalahan: Gagal menyimpan data karyawan.");
      }

      SweetAlert("Sukses", "Data karyawan berhasil disimpan", "success");
      onChangePage("index");
    } catch (error) {
      window.scrollTo(0, 0);
      setIsError({ error: true, message: error.message });
    } finally {
      setIsLoading(false);
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
            Ubah Data Karyawan
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="form-group col-lg-4">
                <label htmlFor="role_baru">Role</label>
                <select
                  id="role_baru"
                  name="role_baru"
                  className="form-select"
                  value={formData.role_baru || ""}
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
                    value={formData.upt || ""}
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
