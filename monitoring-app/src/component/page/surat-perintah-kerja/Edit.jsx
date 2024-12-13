import { useEffect, useRef, useState } from "react";
import { object, string, date } from "yup";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { separator } from "../../util/Formatting";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Icon from "../../part/Icon";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

const inisialisasiDataProduk = [
  {
    Key: null,
    No: null,
    "Nama Produk/Jasa": null,
    Kategori: null,
    Catatan: null,
    Jumlah: null,
    "Gambar Validasi": null,
    Count: 0,
  },
];

export default function SuratPerintahKerjaEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [dataProduk, setDataProduk] = useState(inisialisasiDataProduk);

  const formDataRef = useRef({
    idSPK: "",
    idPermintaan: "",
    nomorRegistrasiSPK: "",
    nomorRegistrasiPermintaan: "",
    nomorRegistrasiPenawaran: "",
    namaPelanggan: "",
    targetPengiriman: "",
    catatanPengiriman: "",
    nomorPurchaseOrder: "",
    nominalPO: "",
    biayaMaterial: "",
    biayaProses: "",
    biayaEngineering: "",
    biayaTools: "",
    biayaLainnyaNominal: "",
    biayaOverhead: "",
    biayaGaransi: "",
    biayaLainnyaPersen: "",
  });

  const userSchema = object({
    idSPK: string(),
    idPermintaan: string(),
    nomorRegistrasiSPK: string(),
    nomorRegistrasiPermintaan: string(),
    nomorRegistrasiPenawaran: string(),
    namaPelanggan: string(),
    targetPengiriman: date()
      .max(
        new Date(new Date().setDate(new Date().getDate() + 365))
          .toISOString()
          .split("T")[0],
        "tanggal tidak valid"
      )
      .typeError("harus diisi")
      .required("harus diisi"),
    catatanPengiriman: string(),
    nomorPurchaseOrder: string(),
    nominalPO: string(),
    biayaMaterial: string(),
    biayaProses: string(),
    biayaEngineering: string(),
    biayaTools: string(),
    biayaLainnyaNominal: string(),
    biayaOverhead: string(),
    biayaGaransi: string(),
    biayaLainnyaPersen: string(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data1 = await UseFetch(
          API_LINK + "SuratPerintahKerja/GetDataSuratPerintahKerjaById",
          { id: withID }
        );

        if (data1 === "ERROR" || data1.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data surat perintah kerja."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data1[0] };
        }

        const data2 = await UseFetch(
          API_LINK + "SuratPerintahKerja/GetDataProdukByPermintaan2",
          {
            idPermintaan: formDataRef.current["idPermintaan"],
          }
        );

        if (data2 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data permintaan pelanggan."
          );
        } else if (data2.length === 0) {
          setDataProduk(inisialisasiDataProduk);
        } else {
          const formattedData = data2.map((value) => ({
            ...value,
            Kategori: value["Kategori"].split(" - ")[1],
            "Gambar Validasi": value["Gambar Validasi"] ? (
              <a
                href={FILE_LINK + value["Gambar Validasi"]}
                className="text-decoration-none fw-bold"
                target="_blank"
              >
                Unduh <Icon name="download" type="Bold" cssClass="ms-1" />
              </a>
            ) : (
              "-"
            ),
            Alignment: ["center", "left", "center", "left", "center", "center"],
          }));
          setDataProduk(formattedData);
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

      try {
        const data = await UseFetch(
          API_LINK + "SuratPerintahKerja/EditSuratPerintahKerja",
          { ...formDataRef.current }
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data surat perintah kerja."
          );
        }

        SweetAlert(
          "Sukses",
          "Data surat perintah kerja berhasil disimpan",
          "success"
        );
        onChangePage("index");
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

  function hitungBiaya(jenis) {
    let total =
      formDataRef.current.biayaMaterial +
      formDataRef.current.biayaProses +
      formDataRef.current.biayaEngineering +
      formDataRef.current.biayaTools;

    switch (jenis) {
      case "Profit":
        return (
          formDataRef.current.nominalPO -
          (total +
            hitungBiaya("Overhead") +
            hitungBiaya("Garansi") +
            hitungBiaya("Lainnya"))
        );
      case "Overhead": {
        total = total + formDataRef.current.biayaLainnyaNominal;
        return (total * formDataRef.current.biayaOverhead) / 100;
      }
      case "Garansi": {
        total = total + formDataRef.current.biayaLainnyaNominal;
        return (total * formDataRef.current.biayaGaransi) / 100;
      }
      case "Lainnya": {
        total = (total * formDataRef.current.biayaLainnyaPersen) / 100;
        return total + formDataRef.current.biayaLainnyaNominal;
      }
    }
  }

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
            Ubah Data Surat Perintah Kerja
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Label
                  forLabel="nomorRegistrasiSPK"
                  title="Nomor Registrasi SPK"
                  data={formDataRef.current.nomorRegistrasiSPK}
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
                  forLabel="nomorRegistrasiPenawaran"
                  title="Nomor Registrasi Penawaran"
                  data={formDataRef.current.nomorRegistrasiPenawaran}
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
                <Label
                  forLabel="nomorPurchaseOrder"
                  title="Nomor Purchase Order"
                  data={formDataRef.current.nomorPurchaseOrder}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="date"
                  forInput="targetPengiriman"
                  label="Target Pengiriman"
                  isRequired
                  value={formDataRef.current.targetPengiriman}
                  onChange={handleInputChange}
                  errorMessage={errors.targetPengiriman}
                  max={
                    new Date(new Date().setDate(new Date().getDate() + 365))
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="textarea"
                  forInput="catatanPengiriman"
                  label="Catatan Pengiriman"
                  value={formDataRef.current.catatanPengiriman}
                  onChange={handleInputChange}
                  errorMessage={errors.catatanPengiriman}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Daftar Permintaan Produk/Jasa
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-12">
                        <Table data={dataProduk} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Detail Anggaran{" "}
                    <span className="fw-normal ms-1 fst-italic">
                      (dalam satuan Rupiah)
                    </span>
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-6 col-md-9 col-sm-12">
                        <table className="table table-borderless table-sm">
                          <tbody>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Material
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(formDataRef.current.biayaMaterial)}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Proses
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(formDataRef.current.biayaProses)}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Engineering
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(
                                  formDataRef.current.biayaEngineering
                                )}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Alat
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(formDataRef.current.biayaTools)}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Overhead
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(hitungBiaya("Overhead"))}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Garansi
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(hitungBiaya("Garansi"))}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Lainnya
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(hitungBiaya("Lainnya"))}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold bg-success-subtle bg-gradient ps-3">
                                Keuntungan
                              </th>
                              <td className="lead fw-semibold bg-success-subtle bg-gradient text-end pe-3">
                                {separator(hitungBiaya("Profit"))}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <td
                                colSpan={2}
                                style={{ verticalAlign: "middle" }}
                              >
                                <hr
                                  style={{
                                    borderTop: "solid black 3px",
                                    opacity: ".7",
                                  }}
                                />
                              </td>
                              <td
                                className="fw-bold fw-semibold"
                                style={{ fontSize: "2em" }}
                              >
                                +
                              </td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Total{" "}
                                <span className="fw-normal small ms-1 fst-italic">
                                  (sesuai PO)
                                </span>
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(formDataRef.current.nominalPO)}
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
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
