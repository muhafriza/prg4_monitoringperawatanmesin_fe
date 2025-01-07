import { useRef, useState, useEffect } from "react";
import { object, string, date, number } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function KorektifAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [mesinOptions, setMesinOptions] = useState([]);
  const [selectedMesin, setSelectedMesin] = useState("");

  const formDataRef = useRef({
    kor_id_perawatan_korektif: "", // Auto-increment, no need to set
    kor_mes_id_mesin: "", // Will be updated when user selects an option
    kor_tanggal_penjadwalan: "",
    kor_tanggal_aktual: "",
    kor_tanggal_pengajuan: "",
    kor_deskripsi_kerusakan: "",
    kor_tindakan_perbaikan: "",
    kor_sparepart_diganti: "",
    kor_status_pemeliharaan: "",
    kor_created_by: "", // Add your user info or authentication data here
    kor_modi_by: "", // Add your user info or authentication data here
  });

  const userSchema = object({
    kor_mes_id_mesin: string().required("ID Mesin is required"),
    kor_tanggal_penjadwalan: date().required("Tanggal Penjadwalan is required"),
    kor_tanggal_aktual: date().required("Tanggal Aktual is required"),
    kor_tanggal_pengajuan: date().required("Tanggal Pengajuan is required"),
    kor_deskripsi_kerusakan: string().max(255, "Deskripsi Kerusakan too long"),
    kor_tindakan_perbaikan: string().max(255, "Tindakan Perbaikan too long"),
    kor_sparepart_diganti: string().max(255, "Sparepart Diganti too long"),
    kor_status_pemeliharaan: number().required("Status Pemeliharaan is required").min(0, "Invalid status"),
  });

  // Fetch the mesin data
  useEffect(() => {
    const fetchMesinData = async () => {
      try {
        // Perbaiki penggunaan UseFetch untuk mengambil data mesin
        const mesinData = await UseFetch(API_LINK + "Mesin/GetDataMesin", {
          method: "GET", // Pastikan metode GET digunakan jika hanya mengambil data
        });

        if (mesinData && Array.isArray(mesinData)) {
          setMesinOptions(mesinData); // Assuming mesinData is an array
        } else {
          throw new Error("Data mesin tidak valid.");
        }
      } catch (error) {
        setIsError({ error: true, message: "Failed to load mesin data: " + error.message });
      }
    };

    fetchMesinData();
  }, []); // empty dependency array, run once on component mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    formDataRef.current[name] = value; // Update formDataRef with the new value

    // Validate the input field
    const validationError = validateInput(name, value, userSchema);
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

    // Check if there are no validation errors
    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "Korektif/CreateKorektif",
          {
            method: "POST",
            body: JSON.stringify(formDataRef.current),
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!data) {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data perawatan korektif.");
        } else {
          SweetAlert("Sukses", "Data perawatan korektif berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    } else {
      window.scrollTo(0, 0); // Scroll to the top if validation fails
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
            Tambah Data Perawatan Korektif
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <label htmlFor="kor_mes_id_mesin" className="form-label">
                  ID Mesin
                </label>
                <select
                  id="kor_mes_id_mesin"
                  className="form-control"
                  value={selectedMesin}
                  onChange={(e) => {
                    setSelectedMesin(e.target.value);
                    formDataRef.current.kor_mes_id_mesin = e.target.value;
                  }}
                >
                  <option value="">Pilih ID Mesin</option>
                  {mesinOptions.map((mesin) => (
                    <option key={mesin.id} value={mesin.id}>
                      {mesin.nama_mesin} ({mesin.id})
                    </option>
                  ))}
                </select>
                {errors.kor_mes_id_mesin && <div className="text-danger">{errors.kor_mes_id_mesin}</div>}
              </div>
              <div className="col-lg-4">
                <Input
                  type="date"
                  forInput="kor_tanggal_penjadwalan"
                  label="Tanggal Penjadwalan"
                  isRequired
                  value={formDataRef.current.kor_tanggal_penjadwalan}
                  onChange={handleInputChange}
                  errorMessage={errors.kor_tanggal_penjadwalan}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="date"
                  forInput="kor_tanggal_aktual"
                  label="Tanggal Aktual"
                  isRequired
                  value={formDataRef.current.kor_tanggal_aktual}
                  onChange={handleInputChange}
                  errorMessage={errors.kor_tanggal_aktual}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="date"
                  forInput="kor_tanggal_pengajuan"
                  label="Tanggal Pengajuan"
                  isRequired
                  value={formDataRef.current.kor_tanggal_pengajuan}
                  onChange={handleInputChange}
                  errorMessage={errors.kor_tanggal_pengajuan}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="kor_deskripsi_kerusakan"
                  label="Deskripsi Kerusakan"
                  value={formDataRef.current.kor_deskripsi_kerusakan}
                  onChange={handleInputChange}
                  errorMessage={errors.kor_deskripsi_kerusakan}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="kor_tindakan_perbaikan"
                  label="Tindakan Perbaikan"
                  value={formDataRef.current.kor_tindakan_perbaikan}
                  onChange={handleInputChange}
                  errorMessage={errors.kor_tindakan_perbaikan}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="kor_sparepart_diganti"
                  label="Sparepart Diganti"
                  value={formDataRef.current.kor_sparepart_diganti}
                  onChange={handleInputChange}
                  errorMessage={errors.kor_sparepart_diganti}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="number"
                  forInput="kor_status_pemeliharaan"
                  label="Status Pemeliharaan"
                  isRequired
                  value={formDataRef.current.kor_status_pemeliharaan}
                  onChange={handleInputChange}
                  errorMessage={errors.kor_status_pemeliharaan}
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
