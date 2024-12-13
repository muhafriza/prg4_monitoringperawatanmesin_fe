import { useEffect, useRef, useState } from "react";
import { object, string, date } from "yup";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { separator } from "../../util/Formatting";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
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

export default function SuratPerintahKerjaAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listPermintaan, setListPermintaan] = useState({});
  const [namaPelanggan, setNamaPelanggan] = useState("-");
  const [nomorPurchaseOrder, setNomorPurchaseOrder] = useState("-");
  const [nomorRegistrasiPenawaran, setNomorRegistrasiPenawaran] = useState("-");
  const [dataProduk, setDataProduk] = useState(inisialisasiDataProduk);

  const [biayaMaterial, setBiayaMaterial] = useState(0);
  const [biayaProses, setBiayaProses] = useState(0);
  const [biayaEngineering, setBiayaEngineering] = useState(0);
  const [biayaTools, setBiayaTools] = useState(0);
  const [biayaOverhead, setBiayaOverhead] = useState(0);
  const [biayaGaransi, setBiayaGaransi] = useState(0);
  const [biayaLainnya, setBiayaLainnya] = useState(0);
  const [biayaPO, setBiayaPO] = useState(0);

  const formDataRef = useRef({
    nomorRegistrasiPermintaan: "",
    targetPengiriman: "",
    catatanPengiriman: "",
  });

  const userSchema = object({
    nomorRegistrasiPermintaan: string().required("harus dipilih"),
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
  });

  // MENGAMBIL DAFTAR PERMINTAAN PELANGGAN -- BEGIN
  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "PermintaanPelanggan/GetListPermintaanPelanggan3",
          {}
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar permintaan pelanggan."
          );
        } else {
          setListPermintaan(data);
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
        setListPermintaan({});
      }
    };

    fetchData();
  }, []);
  // MENGAMBIL DAFTAR PERMINTAAN PELANGGAN -- END

  // MENGAMBIL DATA LAIN BERDASARKAN PERMINTAAN PELANGGAN YANG DIPILIH -- BEGIN
  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data1 = await UseFetch(
          API_LINK + "SuratPerintahKerja/DetailPenawaranbyPermintaanPelanggan",
          { idPermintaan: formDataRef.current["nomorRegistrasiPermintaan"] }
        );

        if (data1 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data permintaan pelanggan."
          );
        } else if (data1.length === 0) {
          setNamaPelanggan("-");
          setNomorPurchaseOrder("-");
          setNomorRegistrasiPenawaran("-");

          setBiayaMaterial(0);
          setBiayaProses(0);
          setBiayaEngineering(0);
          setBiayaTools(0);
          setBiayaOverhead(0);
          setBiayaGaransi(0);
          setBiayaLainnya(0);
          setBiayaPO(0);
        } else {
          setNamaPelanggan(data1[0].namaPelanggan);
          setNomorPurchaseOrder(data1[0].nomorPurchaseOrder);
          setNomorRegistrasiPenawaran(data1[0].nomorRegistrasiPenawaran);

          setBiayaMaterial(data1[0].biayaMaterial);
          setBiayaProses(data1[0].biayaProses);
          setBiayaEngineering(data1[0].biayaEngineering);
          setBiayaTools(data1[0].biayaTools);
          setBiayaOverhead(
            hitungBiaya(
              "Overhead/Garansi",
              data1[0].biayaMaterial,
              data1[0].biayaProses,
              data1[0].biayaEngineering,
              data1[0].biayaTools,
              data1[0].biayaOverhead,
              data1[0].biayaLainnyaNominal
            )
          );
          setBiayaGaransi(
            hitungBiaya(
              "Overhead/Garansi",
              data1[0].biayaMaterial,
              data1[0].biayaProses,
              data1[0].biayaEngineering,
              data1[0].biayaTools,
              data1[0].biayaGaransi,
              data1[0].biayaLainnyaNominal
            )
          );
          setBiayaLainnya(
            hitungBiaya(
              "Lainnya",
              data1[0].biayaMaterial,
              data1[0].biayaProses,
              data1[0].biayaEngineering,
              data1[0].biayaTools,
              data1[0].biayaLainnyaPersen,
              data1[0].biayaLainnyaNominal
            )
          );
          setBiayaPO(data1[0].nominalPO);
        }

        const data2 = await UseFetch(
          API_LINK + "SuratPerintahKerja/GetDataProdukByPermintaan2",
          {
            idPermintaan: formDataRef.current["nomorRegistrasiPermintaan"],
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
        setNamaPelanggan("-");
        setNomorPurchaseOrder("-");
        setNomorRegistrasiPenawaran("-");
        setDataProduk(inisialisasiDataProduk);

        setBiayaMaterial(0);
        setBiayaProses(0);
        setBiayaEngineering(0);
        setBiayaTools(0);
        setBiayaOverhead(0);
        setBiayaGaransi(0);
        setBiayaLainnya(0);
        setBiayaPO(0);
      }
    };

    fetchData();
  }, [formDataRef.current["nomorRegistrasiPermintaan"]]);
  // MENGAMBIL DATA LAIN BERDASARKAN PERMINTAAN PELANGGAN YANG DIPILIH -- END

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
          API_LINK + "SuratPerintahKerja/CreateSuratPerintahKerja",
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

  function hitungBiaya(
    jenis,
    material,
    proses,
    engineering,
    tools,
    additionPersen,
    additionNominal
  ) {
    let total = 0;

    switch (jenis) {
      case "Profit":
        return (
          biayaPO -
          (biayaMaterial +
            biayaProses +
            biayaEngineering +
            biayaTools +
            biayaOverhead +
            biayaGaransi +
            biayaLainnya)
        );
      case "Overhead/Garansi": {
        total = material + proses + engineering + tools + additionNominal;
        return (total * additionPersen) / 100;
      }
      case "Lainnya": {
        total = material + proses + engineering + tools;
        total = (total * additionPersen) / 100;
        return total + additionNominal;
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
            Tambah Surat Perintah Kerja Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <DropDown
                  forInput="nomorRegistrasiPermintaan"
                  label="Nomor Registrasi Permintaan"
                  arrData={listPermintaan}
                  isRequired
                  value={formDataRef.current.nomorRegistrasiPermintaan}
                  onChange={handleInputChange}
                  errorMessage={errors.nomorRegistrasiPermintaan}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="nomorRegistrasiPenawaran"
                  title="Nomor Registrasi Penawaran"
                  data={nomorRegistrasiPenawaran}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="namaPelanggan"
                  title="Nama Pelanggan"
                  data={namaPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="nomorPurchaseOrder"
                  title="Nomor Purchase Order"
                  data={nomorPurchaseOrder}
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
              <div className="col-lg-9">
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
                                {separator(biayaMaterial)}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Proses
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(biayaProses)}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Engineering
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(biayaEngineering)}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Alat
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(biayaTools)}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Overhead
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(biayaOverhead)}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Garansi
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(biayaGaransi)}
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <th className="lead fw-semibold ps-3">
                                Biaya Lainnya
                              </th>
                              <td className="lead text-end pe-3">
                                {separator(biayaLainnya)}
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
                                {separator(biayaPO)}
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
