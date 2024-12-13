import { useEffect, useRef, useState } from "react";
import { object, string, date } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { separator } from "../../util/Formatting";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function SuratPenawaranKonfirmasi({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    nomorRegistrasiPenawaran: "",
    nomorRegistrasiPermintaan: "",
    nomorRegistrasiRAK: "",
    namaPelanggan: "",
    nomorPO: "",
    nominalPO: "",
    tanggalPO: "",
    catatanPO: "",
    berkasPO: "",
    berkasPenawaran: "",
    berkasSPK: "",
    berkasLainnya: "",
    totalHarga: "",
  });

  const filePORef = useRef(null);
  const filePenawaranRef = useRef(null);
  const fileSPKRef = useRef(null);
  const fileLainRef = useRef(null);

  const userSchema = object({
    nomorRegistrasiPenawaran: string(),
    nomorRegistrasiPermintaan: string(),
    nomorRegistrasiRAK: string(),
    namaPelanggan: string(),
    nomorPO: string().max(50, "maksimum 50 karakter").required("harus diisi"),
    nominalPO: string().required("harus diisi"),
    tanggalPO: date()
      .max(new Date().toISOString().split("T")[0], "tanggal tidak valid")
      .typeError("harus diisi")
      .required("harus diisi"),
    catatanPO: string(),
    berkasPO: string(),
    berkasPenawaran: string(),
    berkasSPK: string(),
    berkasLainnya: string(),
    totalHarga: string(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "SuratPenawaran/GetDataSuratPenawaranKonfirmasi",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data surat penawaran."
          );
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

    if (name === "nominalPO") {
      if (value > formDataRef.current.totalHarga) {
        document.getElementById("selisihNominal").innerHTML = "Tidak Valid";
        document.getElementById("selisihPersen").innerHTML = "";
      } else {
        document.getElementById("selisihNominal").innerHTML = separator(
          formDataRef.current.totalHarga - value
        );
        document.getElementById("selisihPersen").innerHTML =
          "(-" +
          (
            ((formDataRef.current.totalHarga - value) * 100) /
            formDataRef.current.totalHarga
          ).toFixed(2) +
          "%)";
      }
    }

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
      const result = await SweetAlert(
        "Simpan Data Konfirmasi Persetujuan Pelanggan",
        "Pastikan data yang dimasukkan sudah lengkap dan benar. Konfirmasi persetujuan pelanggan yang telah disimpan tidak dapat diubah kembali. Apakah Anda yakin ingin menyimpan data konfirmasi persetujuan pelanggan ini?",
        "info",
        "Ya, saya yakin!"
      );

      if (result) {
        setIsLoading(true);
        setIsError((prevError) => ({ ...prevError, error: false }));
        setErrors({});

        const uploadPromises = [];

        const fileInputs = [
          { ref: filePORef, key: "berkasPO" },
          { ref: filePenawaranRef, key: "berkasPenawaran" },
          { ref: fileSPKRef, key: "berkasSPK" },
          { ref: fileLainRef, key: "berkasLainnya" },
        ];

        fileInputs.forEach((fileInput) => {
          if (fileInput.ref.current.files.length > 0) {
            uploadPromises.push(
              UploadFile(fileInput.ref.current).then(
                (data) => (formDataRef.current[fileInput.key] = data.Hasil)
              )
            );
          }
        });

        try {
          await Promise.all(uploadPromises);

          const data = await UseFetch(
            API_LINK + "SuratPenawaran/ApproveSuratPenawaran",
            { idPenawaran: withID, ...formDataRef.current }
          );

          if (data === "ERROR") {
            throw new Error(
              "Terjadi kesalahan: Gagal menyimpan data konfirmasi persetujuan pelanggan."
            );
          } else {
            SweetAlert(
              "Sukses",
              "Data konfirmasi persetujuan pelanggan berhasil disimpan",
              "success"
            );
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
            Konfirmasi Persetujuan Pelanggan
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Label
                  forLabel="nomorRegistrasiPenawaran"
                  title="Nomor Registrasi Penawaran"
                  data={formDataRef.current.nomorRegistrasiPenawaran}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="nomorRegistrasiPermintaan"
                  title="Nomor Registrasi Permintaan"
                  data={formDataRef.current.nomorRegistrasiPermintaan}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="nomorRegistrasiRAK"
                  title="Nomor Registrasi RAK"
                  data={formDataRef.current.nomorRegistrasiRAK}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="namaPelanggan"
                  title="Nama Pelanggan"
                  data={formDataRef.current.namaPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="nomorPO"
                  label="Nomor Purchase Order"
                  isRequired
                  value={formDataRef.current.nomorPO}
                  onChange={handleInputChange}
                  errorMessage={errors.nomorPO}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="number"
                  forInput="nominalPO"
                  label="Nominal Purchase Order (Rp)"
                  isRequired
                  value={formDataRef.current.nominalPO}
                  onChange={handleInputChange}
                  errorMessage={errors.nominalPO}
                  onKeyDown={(e) => {
                    if (e.key === "e" || e.key === "E") e.preventDefault();
                  }}
                />
                <div className="small fst-italic">
                  <span className="me-1">Nominal pada Penawaran: </span>
                  <span id="nominalRAK" className="fw-bold me-2">
                    {separator(formDataRef.current.totalHarga)}
                  </span>
                </div>
                <div className="mb-4 small fst-italic">
                  <span className="me-1">Selisih dengan Penawaran: </span>
                  <span
                    id="selisihNominal"
                    className="text-danger fw-bold me-2"
                  >
                    0
                  </span>
                  <span id="selisihPersen" className="text-danger fw-bold">
                    (0%)
                  </span>
                </div>
              </div>
              <div className="col-lg-3">
                <Input
                  type="date"
                  forInput="tanggalPO"
                  label="Tanggal Purchase Order"
                  isRequired
                  value={formDataRef.current.tanggalPO}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalPO}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="textarea"
                  forInput="catatanPO"
                  label="Catatan/Keterangan"
                  value={formDataRef.current.catatanPO}
                  onChange={handleInputChange}
                  errorMessage={errors.catatanPO}
                />
              </div>
              <div className="col-lg-3">
                <FileUpload
                  forInput="berkasPO"
                  label="Berkas Purchase Order (.pdf, .zip)"
                  formatFile=".pdf,.zip"
                  ref={filePORef}
                  onChange={() => handleFileChange(filePORef, "pdf,zip")}
                  errorMessage={errors.berkasPO}
                  hasExisting={formDataRef.current.berkasPO}
                />
              </div>
              <div className="col-lg-3">
                <FileUpload
                  forInput="berkasPenawaran"
                  label="Berkas Konfirmasi Penawaran (.pdf, .zip)"
                  formatFile=".pdf,.zip"
                  ref={filePenawaranRef}
                  onChange={() => handleFileChange(filePenawaranRef, "pdf,zip")}
                  errorMessage={errors.berkasPenawaran}
                  hasExisting={formDataRef.current.berkasPenawaran}
                />
              </div>
              <div className="col-lg-3">
                <FileUpload
                  forInput="berkasSPK"
                  label="Berkas Surat Perintah Kerja (.pdf, .zip)"
                  formatFile=".pdf,.zip"
                  ref={fileSPKRef}
                  onChange={() => handleFileChange(fileSPKRef, "pdf,zip")}
                  errorMessage={errors.berkasSPK}
                  hasExisting={formDataRef.current.berkasSPK}
                />
              </div>
              <div className="col-lg-3">
                <FileUpload
                  forInput="berkasLainnya"
                  label="Berkas Lainnya (.pdf, .zip)"
                  formatFile=".pdf,.zip"
                  ref={fileLainRef}
                  onChange={() => handleFileChange(fileLainRef, "pdf,zip")}
                  errorMessage={errors.berkasLainnya}
                  hasExisting={formDataRef.current.berkasLainnya}
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
