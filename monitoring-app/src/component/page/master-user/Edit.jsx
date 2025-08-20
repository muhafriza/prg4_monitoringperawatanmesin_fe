import { useEffect, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import Swal from "sweetalert2";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import SearchDropdown from "../../part/SearchDropdown";

const Role = [
  { Text: "ADMINISTRATOR UPT", Value: "ADMINISTRATOR UPT" },
  { Text: "PIC", Value: "PIC" },
  { Text: "TEKNISI", Value: "TEKNISI" },
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
  const [bagian, setBagian] = useState([]);
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
    const fetchStruktur = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const data = await UseFetch(API_LINK + "Mesin/GetStrukturBagian", {
          status: "Aktif",
        });

        if (!data) {
          setIsError(true);
          console.log("Error saat fetch data export");
        } else {
          setBagian(data);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStruktur();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const [username, role] = withID.split("_");

        const data = await UseFetch(API_LINK + `MasterUser/DetailEditUser`, {
          id: username,
          rol: role,
        });

        if (!data) {
          throw new Error("Gagal mengambil data Karyawan.");
        }

        const karyawanData = data[0];
        const roleData = karyawanData.Role_Deskripsi.split(" ")[0];
        console.log(roleData);

        console.log("roledata", data);
        if (roleData === "PIC") {
          const roleParts = karyawanData.Role_Deskripsi.split(" ");
          setFormData({
            username,
            Role_Deskripsi: karyawanData.Role_Deskripsi,
            role_baru: roleData,
            upt: roleParts.length > 1 ? roleParts.slice(1).join(" ") : "", // Menggabungkan semua kata setelah "PIC"
          });
          console.log();
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

    console.log("tes", validationErrors);
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

      if (data[0].hasil === "ERROR") {
        // Tampilkan debug info di console untuk troubleshooting
        console.error("Error details:", data[0]);
        Swal.fire(
          "Error",
          data[0]?.pesan,
          "error"
        );
      } else if (data[0]?.hasil === "OK") {
        Swal.fire("Sukses", "Data User berhasil disimpan", "success");
        onChangePage("index");
      } else {
        console.error("Unexpected response:", data);
        throw new Error("TerjadiS kesalahan: Gagal menyimpan data User.", data);
      }
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
              <div className="col-lg-3">
                <SearchDropdown
                  label="Role"
                  isRequired
                  forInput="role_baru"
                  value={formData.role_baru}
                  isPlaceHolder={false}
                  isDisabled={false}
                  arrData={Role}
                  onChange={handleInputChange}
                />
              </div>

              {showAdditionalInput && (
                <div className="form-group col-lg-4">
                  <SearchDropdown
                    label="Bagian"
                    isRequired
                    forInput="upt"
                    value={formData.upt}
                    isPlaceHolder={false}
                    isDisabled={false}
                    arrData={bagian}
                    onChange={handleInputChange}
                  />
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
