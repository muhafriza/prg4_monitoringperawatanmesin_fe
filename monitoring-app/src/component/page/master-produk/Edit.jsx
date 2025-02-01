import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Label from "../../part/Label";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

const listJenisProduk = [
  { Value: "410001000 - Part", Text: "410001000 - Part" },
  { Value: "410002000 - Unit", Text: "410002000 - Unit" },
  { Value: "410003000 - Konstruksi", Text: "410003000 - Konstruksi" },
  { Value: "410004000 - Mass Production", Text: "410004000 - Mass Production" },
  { Value: "410005000 - Lainnya", Text: "410005000 - Lainnya" },
];

export default function MasterProdukEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    idProduk: "",
    kodeProduk: "",
    namaProduk: "",
    jenisProduk: "",
    gambarProduk: "",
    spesifikasi: "",
    isUsed: "",
  });

  const fileGambarRef = useRef(null);

  const userSchema = object({
    idProduk: string(),
    kodeProduk: string(),
    namaProduk: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    jenisProduk: string().required("harus dipilih"),
    gambarProduk: string(),
    spesifikasi: string(),
    isUsed: string(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterProduk/GetDataProdukById",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data produk.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
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

  const handleFileChange = (ref, extAllowed) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const validationError = validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024576 > 10) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
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

      const uploadPromises = [];

      if (fileGambarRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileGambarRef.current).then(
            (data) => (formDataRef.current["gambarProduk"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterProduk/EditProduk",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data produk.");
        } else {
          SweetAlert("Sukses", "Data produk berhasil disimpan", "success");
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
          <div className="card-header bg-primary lead fw-medium text-white">
            Ubah Data Produk
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Label
                  forLabel="kodeProduk"
                  title="Kode Produk"
                  data={formDataRef.current.kodeProduk}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="namaProduk"
                  label="Nama Produk"
                  isRequired
                  isDisabled={formDataRef.current.isUsed === "Ya"}
                  value={formDataRef.current.namaProduk}
                  onChange={handleInputChange}
                  errorMessage={errors.namaProduk}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="jenisProduk"
                  label="Jenis Produk"
                  arrData={listJenisProduk}
                  isRequired
                  value={formDataRef.current.jenisProduk}
                  onChange={handleInputChange}
                  errorMessage={errors.jenisProduk}
                />
              </div>
              <div className="col-lg-3">
                <FileUpload
                  forInput="gambarProduk"
                  label="Gambar Produk (.pdf, .jpg, .png)"
                  formatFile=".pdf,.jpg,.png"
                  ref={fileGambarRef}
                  onChange={() =>
                    handleFileChange(fileGambarRef, "pdf,jpg,png")
                  }
                  errorMessage={errors.gambarProduk}
                  hasExisting={formDataRef.current.gambarProduk}
                />
              </div>
              <div className="col-lg-12">
                <Input
                  type="textarea"
                  forInput="spesifikasi"
                  label="Spesifikasi"
                  value={formDataRef.current.spesifikasi}
                  onChange={handleInputChange}
                  errorMessage={errors.spesifikasi}
                />
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
