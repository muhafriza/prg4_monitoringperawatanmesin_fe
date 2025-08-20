import { useEffect, useRef, useState } from "react";
import { object, string, number } from "yup"; // Adjusted for new schema validation
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import Swal from "sweetalert2";
import UploadFile from "../../util/UploadFile";
import FileUpload from "../../part/FileUpload";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import SearchDropdown from "../../part/SearchDropdown";
import Cookies from "js-cookie"
import { decryptId } from "../../util/Encryptor";

export default function MasterMesinEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const [bagian, setBagian] = useState([]);
  const formDataRef = useRef({
    mes_id_mesin: "",
    mes_kondisi_operasional: "",
    mes_no_panel: "",
    mes_lab: "",
    mes_nama_mesin: "",
    mes_upt: "",
    mes_daya_mesin: "",
    mes_kapasitas: "",
    mes_tipe: "",
    mes_gambar: "",
  });
  const fileGambarRef = useRef(null);

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
      .required("Daya Mesin harus diisi")
      .positive("Jumlah harus lebih besar dari 0"),
    mes_kapasitas: string().optional(),
    mes_upt: string(),
    mes_tipe: string().optional(),
    mes_gambar: string(),
  });

  const getUserInfo = () => {
      const encryptedUser = Cookies.get("activeUser");
      if (encryptedUser) {
        try {
          const userInfo = JSON.parse(decryptId(encryptedUser));
          return userInfo;
        } catch (error) {
          console.error("Failed to decrypt user info:", error);
          return null;
        }
      }
      return null;
    };
      const userInfo = getUserInfo();

  const handleFileChange = (ref, extAllowed) => {
    const file = ref.current.files[0];

    if (file) {
      const fileExt = file.name.split(".").pop().toLowerCase();
      const fileSize = file.size;
      let error = "";

      if (fileSize / 1024 / 1024 > 10) error = "Berkas terlalu besar";
      else if (!extAllowed.split(",").includes(fileExt))
        error = "Format berkas tidak valid";

      if (error) {
        ref.current.value = "";
        setErrors((prevErrors) => ({
          ...prevErrors,
          [ref.current.name]: error,
        }));
        setPreviewImage(null); // Reset preview jika ada error
        console.log("Error File:", error); // Debug log
        return; // Hentikan eksekusi jika error
      }

      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);

      setErrors((prevErrors) => ({
        ...prevErrors,
        [ref.current.name]: null,
      }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const data = await UseFetch(`${API_LINK}Mesin/DetailMesin`, {
          id: withID,
        });

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Gagal mengambil data Mesin.");
        }

        const MesinData = data[0];
        MesinData.mes_id_mesin = withID;
        delete MesinData.status;
        delete MesinData.mes_status1;
        delete MesinData.mes_status;
        delete MesinData.mes_jumlah;

        // Initialize formDataRef with the fetched data
        formDataRef.current = { ...formDataRef.current, ...MesinData };

        // Jika gambar tersedia, buat preview
        if (MesinData.mes_gambar) {
          setPreviewImage(FILE_LINK + MesinData.mes_gambar); // FILE_LINK berisi URL path ke file
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "mes_daya_mesin") {
      if (!/^[\d.,/]*\.?\d*$/.test(value)) {
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

    const dataToSend = {
      mes_id_mesin: formDataRef.current.mes_id_mesin, // @p1
      mes_kondisi_operasional: formDataRef.current.mes_kondisi_operasional, // @p2
      mes_no_panel: formDataRef.current.mes_no_panel, // @p3
      mes_lab: formDataRef.current.mes_lab, // @p4
      mes_nama_mesin: formDataRef.current.mes_nama_mesin, // @p5
      mes_upt: formDataRef.current.mes_upt, // @p6
      mes_daya_mesin: formDataRef.current.mes_daya_mesin, // @p7
      mes_kapasitas: formDataRef.current.mes_kapasitas, // @p8
      mes_tipe: formDataRef.current.mes_tipe, // @p9 - BUKAN file!
      mes_gambar: formDataRef.current.mes_gambar, // @p10 - File gambar
    };

    // Validate the form inputs
    const validationErrors = await validateAllInputs(
      dataToSend,
      userSchema,
      setErrors
    );

    console.log("userInfo", validationErrors)

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      const uploadPromises = [];

      if (fileGambarRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileGambarRef.current)
            .then((data) => {
              formDataRef.current["mes_gambar"] = data.Hasil;
              console.log("Hasil upload file:", data);
            })
            .catch((error) => {
              console.error("Error upload file:", error);
              throw error; // Re-throw to be caught in main try-catch
            })
        );
      }

      try {
        // Wait for file uploads to complete
        await Promise.all(uploadPromises);

        console.log("Data yang akan dikirim:", formDataRef.current);

        const data = await UseFetch(
          API_LINK + "Mesin/EditMesin",
          formDataRef.current
        );

        console.log("Response dari API:", data);

        // Check response properly
        if (!data || data.length === 0) {
          throw new Error("Tidak ada response dari server");
        }

        // Check if the response has hasil field
        if (data[0]?.hasil === "ERROR") {
          Swal.fire("Error", data[0]?.pesan || "Terjadi kesalahan", "error");
        } else if (data[0]?.hasil === "OK") {
          Swal.fire(
            "Sukses",
            data[0]?.pesan || "Data mesin berhasil disimpan",
            "success"
          );
          onChangePage("index");
        } else {
          // For backward compatibility if SP doesn't return hasil field
          Swal.fire("Sukses", "Data mesin berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        console.error("Error saving data:", error);
        window.scrollTo(0, 0);
        setIsError({
          error: true,
          message: error.message || "Terjadi kesalahan saat menyimpan data",
        });

        // Show error in SweetAlert too
        Swal.fire(
          "Error",
          error.message || "Terjadi kesalahan saat menyimpan data",
          "error"
        );
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
                <SearchDropdown
                  label="Bagian"
                  forInput="mes_upt"
                  isPlaceHolder={false}
                  isRequire
                  value={formDataRef.current.mes_upt}
                  isDisabled={false}
                  arrData={bagian}
                  onChange={handleInputChange}
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
                  type="text"
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
              <div className="col-lg-4">
                <FileUpload
                  forInput="mes_gambar"
                  label="Gambar Mesin (.jpg, .png)"
                  formatFile=".jpg,.png"
                  ref={fileGambarRef}
                  onChange={() => handleFileChange(fileGambarRef, "jpg,png")}
                  errorMessage={errors.mes_gambar}
                />
                {previewImage && (
                  <div className="mt-3">
                    <img
                      src={previewImage}
                      alt="Preview Gambar"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
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
