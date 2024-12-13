import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { separator, clearSeparator } from "../../util/Formatting";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Label from "../../part/Label";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

const inisialisasiDataProduk = [
  {
    Key: null,
    No: null,
    "Nama Produk/Jasa": null,
    Jumlah: null,
    "Biaya Material": null,
    "Biaya Proses": null,
    "Biaya Lainnya": null,
    "Biaya Tambahan": null,
    Keuntungan: null,
    Diskon: null,
    "Total Harga": null,
    "Harga Satuan": null,
    Count: 0,
  },
];

export default function SuratPenawaranEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listRekening, setListRekening] = useState({});
  const [listAlternatif, setListAlternatif] = useState({});
  const [dataProduk, setDataProduk] = useState(inisialisasiDataProduk);

  const formDataRef = useRef({
    idPenawaran: "",
    idPermintaan: "",
    nomorRegistrasiPenawaran: "",
    nomorRegistrasiPermintaan: "",
    nomorRegistrasiRAK: "",
    namaPelanggan: "",
    nomorRekening: "",
    alternatifRAK: "",
    keterangan: "",
  });

  const userSchema = object({
    idPenawaran: string(),
    idPermintaan: string(),
    nomorRegistrasiPenawaran: string(),
    nomorRegistrasiPermintaan: string(),
    nomorRegistrasiRAK: string(),
    namaPelanggan: string(),
    nomorRekening: string().required("harus dipilih"),
    alternatifRAK: string().required("harus dipilih"),
    keterangan: string().required("harus diisi"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data1 = await UseFetch(
          API_LINK + "Utilities/GetListRekening",
          {}
        );

        if (data1 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar rekening."
          );
        } else {
          setListRekening(data1);
        }

        const data2 = await UseFetch(
          API_LINK + "SuratPenawaran/GetDataSuratPenawaranById",
          { id: withID }
        );

        if (data2 === "ERROR" || data2.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data surat penawaran."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data2[0] };
        }

        const data3 = await UseFetch(
          API_LINK + "SuratPenawaran/GetListAlternatifKeuntunganDiskonRAK",
          { idPermintaan: formDataRef.current["idPermintaan"] }
        );

        if (data3 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data surat penawaran."
          );
        } else {
          setListAlternatif(data3);
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
        setListRekening({});
        setListAlternatif({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // MENGAMBIL DATA PRODUK BERDASARKAN PROFIT/DISKON YANG DIPILIH -- BEGIN
  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "SuratPenawaran/GetDataProdukByPermintaan",
          {
            idPermintaan: formDataRef.current["idPermintaan"],
          }
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data permintaan pelanggan."
          );
        } else if (
          data.length === 0 ||
          formDataRef.current.alternatifRAK === ""
        ) {
          setDataProduk(inisialisasiDataProduk);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            "Biaya Material": separator(value["Biaya Material"]),
            "Biaya Proses": separator(value["Biaya Proses"]),
            "Biaya Lainnya": separator(value["Biaya Lainnya"]),
            "Biaya Tambahan": separator(
              hitungBiaya(
                "Tambahan",
                value["Biaya Material"],
                value["Biaya Proses"],
                value["Biaya Lainnya"]
              )
            ),
            Keuntungan: separator(
              hitungBiaya(
                "Keuntungan",
                value["Biaya Material"],
                value["Biaya Proses"],
                value["Biaya Lainnya"]
              )
            ),
            Diskon: separator(
              hitungBiaya(
                "Diskon",
                value["Biaya Material"],
                value["Biaya Proses"],
                value["Biaya Lainnya"]
              )
            ),
            "Total Harga": separator(
              hitungBiaya(
                "Total Harga",
                value["Biaya Material"],
                value["Biaya Proses"],
                value["Biaya Lainnya"]
              )
            ),
            "Harga Satuan": (
              <b>
                {separator(
                  hitungBiaya(
                    "Harga Satuan",
                    value["Biaya Material"],
                    value["Biaya Proses"],
                    value["Biaya Lainnya"],
                    value["Jumlah"]
                  ) + "</b>"
                )}
              </b>
            ),
            Alignment: [
              "center",
              "left",
              "center",
              "right",
              "right",
              "right",
              "right",
              "right",
              "right",
              "right",
              "right",
            ],
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
        setDataProduk(inisialisasiDataProduk);
      }
    };

    fetchData();
  }, [formDataRef.current["alternatifRAK"]]);
  // MENGAMBIL DATA PRODUK BERDASARKAN PROFIT/DISKON YANG DIPILIH -- END

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
          API_LINK + "SuratPenawaran/EditSuratPenawaran",
          {
            ...formDataRef.current,
            ProfitAktual: formDataRef.current.alternatifRAK.split("#")[0],
            DiskonAktual: formDataRef.current.alternatifRAK.split("#")[1],
            TotalHarga: clearSeparator(hitungTotalHarga()),
          }
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data surat penawaran."
          );
        }

        SweetAlert(
          "Sukses",
          "Data surat penawaran berhasil disimpan",
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

  function hitungBiaya(tipe, material, proses, lainnya, jumlah = 1) {
    let totalCOGM = material + proses + lainnya;
    let tambahan =
      (totalCOGM *
        parseFloat(formDataRef.current.alternatifRAK.split("#")[2])) /
      100;
    let keuntungan =
      ((totalCOGM + tambahan) *
        parseFloat(formDataRef.current.alternatifRAK.split("#")[0])) /
      100;
    let diskon =
      (keuntungan *
        parseFloat(formDataRef.current.alternatifRAK.split("#")[1])) /
      100;
    let totalHarga = totalCOGM + tambahan + keuntungan - diskon;
    let hargaSatuan = totalHarga / jumlah;

    switch (tipe) {
      case "Tambahan":
        return Math.round(tambahan);
      case "Keuntungan":
        return Math.round(keuntungan);
      case "Diskon":
        return Math.round(diskon);
      case "Total Harga":
        return Math.round(totalHarga);
      case "Harga Satuan":
        return Math.round(hargaSatuan);
      default:
        return;
    }
  }

  function hitungTotalHarga() {
    let total = dataProduk.reduce(
      (akumulasi, val) => akumulasi + clearSeparator(val["Total Harga"]),
      0
    );

    if (isNaN(total))
      return <span className="text-danger fst-italic">Tidak Valid</span>;
    return separator(total);
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
            Ubah Data Surat Penawaran
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
                <DropDown
                  forInput="alternatifRAK"
                  label="Alternatif Keuntungan dan Diskon"
                  arrData={listAlternatif}
                  isRequired
                  value={formDataRef.current.alternatifRAK}
                  onChange={handleInputChange}
                  errorMessage={errors.alternatifRAK}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="nomorRekening"
                  label="Rekening pada Surat Penawaran"
                  arrData={listRekening}
                  isRequired
                  value={formDataRef.current.nomorRekening}
                  onChange={handleInputChange}
                  errorMessage={errors.nomorRekening}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="textarea"
                  forInput="keterangan"
                  isRequired
                  label="Keterangan atau Kondisi Penawaran"
                  value={formDataRef.current.keterangan}
                  onChange={handleInputChange}
                  errorMessage={errors.keterangan}
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
                        <div className="px-3 py-2 bg-info-subtle border-start border-5 border-info mb-3 fw-bold">
                          {
                            <>
                              -&emsp;Biaya dan harga dalam satuan rupiah (Rp).
                              <br />
                              -&emsp;Biaya lainnya merupakan total dari biaya
                              alat, engineering, dan lainnya.
                              <br />
                              -&emsp;Biaya tambahan merupakan total dari biaya
                              tidak langsung, pengiriman, garansi, dan lainnya.
                              <br />
                              <b>
                                -&emsp;Silakan periksa kembali perhitungan yang
                                tertera dalam tabel di bawah ini.
                              </b>
                            </>
                          }
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <Table data={dataProduk} />
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="float-end mx-2">
                      <span className="fw-bold">
                        Total Harga Produk/Jasa :&emsp;
                        {hitungTotalHarga()}
                      </span>
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
