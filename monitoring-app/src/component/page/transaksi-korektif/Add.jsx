import { useRef, useState, useEffect } from "react";
import { object, string, date } from "yup";
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
   
    kor_mes_id_mesin: "",   
    kor_deskripsi_kerusakan: "",
  });

  const [currentFilter, setCurrentFilter] = useState({
    name: "",
    status: "Aktif",
  });

    // useEffect(() => {
    //   // Automatically update the formDataRef if necessary
    //   formDataRef.current.kor_tanggal_pengajuan = new Date().toISOString(); // Updates to current time when component mounts
    // }, []); 

  const userSchema = object({
    kor_mes_id_mesin: string().required("ID Mesin is required"),
    kor_deskripsi_kerusakan: string().max(255, "Deskripsi Kerusakan too long"),
   
  });

  useEffect(() => {
    const fetchDataMesin = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(API_LINK + "Korektif/getNamaMesin", currentFilter);
        // console.log(data);
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Mesin.");
        } else {
          setMesinOptions(data); // Set data yang diterima ke dalam mesinOptions
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
  }, []); // Empty dependency array to ensure fetch is called once on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    formDataRef.current[name] = value;

    const validationError = validateInput(name, value, userSchema);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    console.log(1)
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );
    
    console.log(2)
    if (Object.values(validationErrors).every((error) => !error)) {
      console.log(3)
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});
      
      try {
        // formDataRef.current.kor_status_pemeliharaan =
        //   formDataRef.current.kor_status_pemeliharaan || 0;

        const data = await UseFetch(
          API_LINK + "Korektif/Createkorektif",
          formDataRef.current
        );

        if (!data) {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data perawatan korektif.");
        } else {
          SweetAlert("Sukses", "Data perawatan korektif berhasil disimpan", "success");
          onChangePage("index");
        }
        
      } catch (error) {
        setIsError({ error: true, message: error.message });
        console.error(error); 
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
                  name="kor_mes_id_mesin"
                >
                  <option value="">Pilih ID Mesin</option>
                  {mesinOptions.map((mesin) => (
                    <option key={mesin.ID_Mesin} value={mesin.ID_Mesin}>
                      {mesin.Nama_Mesin} ({mesin.ID_Mesin})
                    </option>
                  ))}
                </select>
                {errors.kor_mes_id_mesin && <div className="text-danger">{errors.kor_mes_id_mesin}</div>}
              </div>
              
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="kor_deskripsi_kerusakan"
                  label="Deskripsi Kerusakan"
                  value={formDataRef.current.kor_deskripsi_kerusakan}
                  onChange={handleInputChange}
                  errorMessage={errors.kor_deskripsi_kerusakan}
                  name="kor_deskripsi_kerusakan"
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
