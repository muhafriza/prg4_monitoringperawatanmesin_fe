import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function Add({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [mesinOptions, setmesinOptions] = useState([]);
  const [generatedDates, setGeneratedDates] = useState([]); // State untuk menyimpan jadwal yang dihasilkan
  const formDataRef = useRef({
    mes_id_mesin: "",
    jenis_tindakan: "",
    status: "Menunggu Perbaikan",
    tanggal_mulai: "",
    interval: "",
    durasi: "",
  });
  const [currentFilter, setCurrentFilter] = useState({
    name: "",
    status: "Aktif",
  })

  const userSchema = object({
    mes_id_mesin: string().required("Pilih Mesin yang ingin di rawat"),
    tanggal_mulai: string().required("Harus diisi"),
    jenis_tindakan: string().required("Harus diisi"),
    interval: string()
      .matches(/^\d*$/, "Hanya angka yang diperbolehkan")
      .required("Harus diisi"),
    durasi: string()
      .matches(/^\d*$/, "Hanya angka yang diperbolehkan")
      .required("Harus diisi"),
      status: string()
  });

  useEffect(() => {
    const fetchDataMesin = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/getNamaMesin",
          currentFilter
        );
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Mesin.");
        } else {
          setmesinOptions(data); // Set data yang diterima ke dalam mesinOptions
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
    fetchDataMesin();
  }, [currentFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const generateSchedule = () => {
    const { tanggal_mulai, interval, durasi } = formDataRef.current;
  
    if (!tanggal_mulai || !interval || !durasi) {
      SweetAlert(
        "Peringatan",
        "Tanggal mulai, interval, dan durasi harus diisi!",
        "warning"
      );
      return;
    }
  
    const startDate = new Date(tanggal_mulai);
    const generated = [];
    const maintenanceInterval = parseInt(interval, 10);
    const totalDuration = parseInt(durasi, 10); // Durasi dalam hari
  
    let nextDate = new Date(startDate);
    let totalDaysPassed = 0;
  
    // Loop untuk generate tanggal berdasarkan interval, dan berhenti ketika total hari lebih dari durasi
    while (totalDaysPassed < totalDuration) {
      generated.push(nextDate.toISOString().split("T")[0]); // Format: YYYY-MM-DD
      nextDate.setDate(nextDate.getDate() + maintenanceInterval); // Menambahkan interval
  
      // Menghitung total hari yang telah berlalu setelah menambahkan tanggal
      totalDaysPassed = (nextDate - startDate) / (1000 * 60 * 60 * 24);
    }
  
    // Menambahkan tanggal terakhir yang valid jika totalDaysPassed masih kurang dari durasi
    if (totalDaysPassed <= totalDuration) {
      generated.push(nextDate.toISOString().split("T")[0]); // Format: YYYY-MM-DD
    }
  
    setGeneratedDates(generated);
  };
    
  


  const handleAdd = async (e) => {
    e.preventDefault(); // Pastikan ini dijalankan
  
    console.log("Form submit triggered"); // Debug log
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );
  
    console.log(validationErrors); // Cek apakah data diterima dengan benar
    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});
  
      try {        
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/CreateJadwal",
          formDataRef.current
        );
  
        console.log("Respons dari API: ", data);
        if (!data) {
          console.log("k".data.Error);
          throw new Error("Terjadi kesalahan: Gagal menyimpan data Jadwal.");
        } else {
          SweetAlert("Sukses", "Jadwal berhasil disimpan", "success");
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
            Buat Jadwal Perawatan Rutin
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <label htmlFor="userDropdown" className="form-label fw-bold">
                  Pilih Mesin <span style={{ color: "red" }}>*</span>
                  {errors.mes_id_mesin && (
                    <div className="text-danger">{errors.mes_id_mesin}</div>
                  )}
                </label>
                <select
                  id="userDropdown"
                  name="mes_id_mesin"
                  className="form-select"
                  onChange={handleInputChange}
                >
                  <option value="">-- Pilih Mesin --</option>
                  {mesinOptions.map((option) => (
                    <option key={option.ID_Mesin} value={option.ID_Mesin}>
                      {option.ID_Mesin}, {option.Nama_Mesin}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-lg-3">
                <Input
                  type="date"
                  forInput="tanggal_mulai"
                  label="Tanggal Mulai"
                  isRequired
                  onChange={handleInputChange}
                  errorMessage={errors.tanggal_mulai}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="jenis_tindakan"
                  label="Jenis Tindakan"
                  isRequired
                  onChange={handleInputChange}
                  errorMessage={errors.jenis_tindakan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="interval"
                  label="Interval Pemeliharaan (Hari)"
                  isRequired
                  onChange={handleInputChange}
                  errorMessage={errors.interval}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="durasi"
                  label="Durasi Perawatan (Hari)"
                  isRequired
                  onChange={handleInputChange}
                  errorMessage={errors.durasi}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button
                classType="secondary me-2 px-4 py-2"
                label="Generate Jadwal"
                onClick={generateSchedule}
              />
            </div>
            {generatedDates.length > 0 && (
              <div className="mt-4">
                <h5>Jadwal Perawatan:</h5>
                <ul>
                  {generatedDates.map((date, index) => (
                    <li key={index}>{date}</li>
                  ))}
                </ul>
              </div>
            )}
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
