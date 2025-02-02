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
    sparepart: "",
    qty: "",
  });
  const [currentFilter, setCurrentFilter] = useState({
    name: "",
    status: "Aktif",
  });
  const [sparepartOptions, setSparepartOptions] = useState([]);
  const [spareparts, setSpareparts] = useState([{ sparepart: "", qty: "" }]);

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
    status: string(),
    sparepart: string(),
    qty: string(),
  });

  useEffect(() => {
    const fetchDataMesin = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/getNamaMesin",
          currentFilter
        );
        if (data === "ERROR") {
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
    const fetchDataSparepart = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPreventif/getNamaSparepart",
          { status: "Aktif" }
        );
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Sparepart.");
        } else {
          setSparepartOptions(data); // Set data yang diterima ke dalam
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

    fetchDataSparepart();
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

  // Fungsi untuk menangani perubahan pada spareparts
  const handleSparepartChange = (index, field, value) => {
    const updatedSpareparts = [...spareparts];
    updatedSpareparts[index][field] = value; // Update sparepart berdasarkan index
    setSpareparts(updatedSpareparts);
  };

  // Fungsi untuk menambahkan field sparepart baru
  const addSparepartField = () => {
    setSpareparts([...spareparts, { sparepart: "", qty: "" }]); // Tambahkan field baru
  };

  // Fungsi untuk mengurangi sparepart berdasarkan index
  const removeSparepartField = (index) => {
    const updatedSpareparts = spareparts.filter((_, i) => i !== index); // Hapus sparepart yang dipilih
    setSpareparts(updatedSpareparts);
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
    console.log(formDataRef.current);
    const sparepartString = spareparts.map((item) => item.sparepart).join(",");
    const qtyString = spareparts.map((item) => item.qty).join(",");

    console.log(validationErrors); // Cek apakah data diterima dengan benar

    formDataRef.current.sparepart = sparepartString;
    formDataRef.current.qty = qtyString;

    const dateList = generatedDates;
    const dateListText = dateList.map((date) => `<li>${date}</li>`).join(""); // Membuat list HTML

    // Menampilkan SweetAlert konfirmasi dengan daftar tanggal
    const confirmation = await SweetAlert(
      "Warning", // title
      "Yakin ingin menyimpan jadwal ?", // text, menampilkan list tanggal
      "warning", // icon
      "Ya" // confirmText
    );

    // Jika pengguna memilih "Ya"
    if (confirmation) {
      console.log("User memilih Ya");

      // Lakukan validasi jika tidak ada error
      if (Object.values(validationErrors).every((error) => !error)) {
        setIsLoading(true);
        setIsError({ error: false, message: "" });
        setErrors({});

        console.log("Pe: ");
        try {
          const data = await UseFetch(
            API_LINK + "TransaksiPreventif/CreateJadwal",
            formDataRef.current
          );

          console.log("Respons dari API: ", data);
          if (data[0].Message != "Jadwal berhasil disimpan") {
            SweetAlert("Gagal", data[0].Message, "info", "Ok");
          } else {
            SweetAlert("Sukses", data[0].Message, "success");
            onChangePage("index");
          }
        } catch (error) {
          SweetAlert(
            "Terjadi Kesalahan!",
            "Error saat menyimpan data.",
            "Error",
            "Ok"
          );
          setIsError({ error: true, message: error.message });
        } finally {
          setIsLoading(false);
        }
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      console.log("User memilih Tidak");
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
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="durasi"
                  label="Durasi Perawatan (Hari)"
                  isRequired
                  onChange={handleInputChange}
                  errorMessage={errors.durasi}
                />
              </div>
              {/* Spareparts Input */}
              {spareparts.map((sparepart, index) => (
                <div key={index} className="row mb-3">
                  <div className="col-lg-3">
                    <label
                      htmlFor={`sparepart-${index}`}
                      className="form-label fw-bold"
                    >
                      {`Sparepart ${index + 1}`}{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                      id={`sparepart-${index}`}
                      name="sparepart"
                      className="form-select"
                      onChange={(e) =>
                        handleSparepartChange(
                          index,
                          "sparepart",
                          e.target.value
                        )
                      }
                      value={sparepart.kode_sparepart}
                    >
                      <option value="">-- Pilih Sparepart --</option>
                      {sparepartOptions.map((option) => (
                        <option value={option.kode_sparepart}>
                          {option.nama_sparepart}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-lg-3">
                    <Input
                      type="text"
                      forInput={`qty-${index}`}
                      label="Jumlah Sparepart"
                      isRequired
                      onChange={(e) =>
                        handleSparepartChange(index, "qty", e.target.value)
                      }
                      value={sparepart.qty}
                    />
                  </div>
                  <div className="col-lg-2 d-flex align-items-center">
                    <Button
                      classType="danger"
                      label="-"
                      onClick={() => removeSparepartField(index)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              classType="success me-2 px-4 py-2"
              label="Tambah Sparepart"
              onClick={addSparepartField}
            />
            <Button
              classType="info me-2 px-4 py-2"
              label="Generate Schedule"
              onClick={() => generateSchedule()}
            />
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
