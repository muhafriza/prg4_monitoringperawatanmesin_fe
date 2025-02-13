import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import DropDown from "../../part/Dropdown";
import Swal from "sweetalert2";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

const dataUPT = [
  { Value: "PEMESINAN", Text: "PEMESINAN" },
  { Value: "PERAWATAN", Text: "PERAWATAN" },
  { Value: "ALAT BERAT", Text: "ALAT BERAT" },
  { Value: "OTOMOTIF", Text: "OTOMOTIF" },
  { Value: "MANUFAKTUR", Text: "MANUFAKTUR" },
  { Value: "OTOMASI", Text: "OTOMASI" },
  { Value: "DESAIN DAN METROLOGI", Text: "DESAIN DAN METROLOGI" },
  { Value: "OTOMASI", Text: "OTOMASI" },
  { Value: "SIPIL", Text: "SIPIL" },
  { Value: "LPT3", Text: "LPT3" },
];

export default function Add({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [mesinOptions, setmesinOptions] = useState([]);
  let selectedUPT = "";
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
  const [displayedSchedules, setDisplayedSchedules] = useState([]);
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

  const handleUPTChange = (e) => {
    selectedUPT = e.target.value;
    console.log(e.target.value);
    fetchDataMesin();
  };

  const fetchDataMesin = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));

    try {
      const data = await UseFetch(
        API_LINK + "TransaksiPreventif/getNamaMesin",
        {
          p1: "",
          upt: selectedUPT,
          status: "Aktif",
        }
      );
      console.log(data);
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

  useEffect(() => {
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
  }, []);

  function formatDate(dateString, format) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    switch (format) {
      case "DD/MM/YYYY":
        return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(
          2,
          "0"
        )}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
      case "D MMMM YYYY":
        return `${day} ${months[month]} ${year}`;
      default:
        return dateString;
    }
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));

    const { tanggal_mulai, interval, durasi } = formDataRef.current;

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
      console.log(totalDaysPassed);
    }

    // Menambahkan tanggal terakhir yang valid jika totalDaysPassed masih kurang dari durasi
    if (totalDaysPassed <= totalDuration) {
      generated.push(nextDate.toISOString().split("T")[0]); // Format: YYYY-MM-DD
    }

    setGeneratedDates(generated);
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

    const confirmation = await Swal.fire({
      title: "Information",
      html: `Yakin ingin menyimpan Jadwal Perawatan?.`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "YA, SIMPAN",
      cancelButtonText: "BATAL",
    });

    // Jika pengguna memilih "Ya"
    if (confirmation.isConfirmed) {
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
            Swal.fire("Gagal", data[0].Message, "info", "Ok");
          } else {
            Swal.fire("Success!", "Berhasil menyimpan data.", "success");
            onChangePage("index");
          }
        } catch (error) {
          Swal.fire("Error!", "Terjadi kesalahan saat mengirim data.", "error");
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
  const TampilkanJadwal = async () => {
    setDisplayedSchedules(generatedDates);
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
                <label htmlFor="mes_upt" className="form-label fw-bold">
                  UPT <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  id="mes_upt"
                  name="upt"
                  className="form-select"
                  onChange={handleUPTChange}
                >
                  <option value="">-- Pilih UPT --</option>
                  {dataUPT.map((upt) => (
                    <option key={upt.Value} value={upt.Value}>
                      {upt.Text}
                    </option>
                  ))}
                </select>
              </div>
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
              classType="secondary me-2 px-4 py-2"
              label="TAMPILKAN JADWAL"
              onClick={TampilkanJadwal}
            />
          </div>
        </div>
        <div className="card mt-4">
          <div className="card-header bg-primary lead fw-medium text-white">
            Jadwal Yang Dihasilkan
          </div>
          <div className="card-body p-4">
            <div className="mt-3">
              {isLoading ? (
                <Loading />
              ) : (
                <div className="d-flex flex-column">
                  <table className="table table-hover table-bordered table-striped table-light border">
                    <thead align="center">
                      <tr>
                        <th style={{ maxWidth: "1px" }}>NO</th>
                        <th>ID Mesin</th>
                        <th>Jenis Tindakan</th>
                        <th>Jadwal Pemeliharaan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSchedules &&
                      Array.isArray(displayedSchedules) &&
                      displayedSchedules.length > 0 ? (
                        displayedSchedules.map((date, index) => (
                          <tr key={`schedule-${index}`}>
                            <td align="center" style={{ maxWidth: "10px" }}>
                              {index + 1}
                            </td>
                            <td>
                              {formDataRef.current?.mes_id_mesin || "N/A"}
                            </td>
                            <td>
                              {formDataRef.current?.jenis_tindakan || "N/A"}
                            </td>
                            <td align="center">
                              {formatDate(date, "D MMMM YYYY")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" align="center">
                            Tidak ada Jadwal yang dihasilkan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
