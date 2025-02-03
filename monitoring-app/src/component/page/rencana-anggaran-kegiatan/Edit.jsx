import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { separator, clearSeparator } from "../../util/Formatting";
import Swal from "sweetalert2";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
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
    "Biaya Material (Rp)": null,
    "Biaya Proses (Rp)": null,
    "Biaya Lainnya (Rp)": null,
    "Total Biaya (Rp)": null,
    Count: 0,
  },
];

export default function RencanaAnggaranKegiatanEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [biayaIndirect, setBiayaIndirect] = useState(0);
  const [biayaDelivery, setBiayaDelivery] = useState(0);
  const [biayaWarranty, setBiayaWarranty] = useState(0);
  const [biayaLainnya, setBiayaLainnya] = useState(0);
  const [profit1, setProfit1] = useState(60);
  const [profit2, setProfit2] = useState(80);
  const [profit3, setProfit3] = useState(100);
  const [diskon1, setDiskon1] = useState(0);
  const [diskon2, setDiskon2] = useState(0);
  const [diskon3, setDiskon3] = useState(0);
  const [dataProduk, setDataProduk] = useState(inisialisasiDataProduk);

  const formDataRef = useRef({
    idRAK: "",
    idPermintaan: "",
    namaPelanggan: "",
    nomorRegistrasiRAK: "",
    nomorRegistrasiPermintaan: "",
    keterangan: "",
    biayaIndirect: "",
    biayaDelivery: "",
    biayaWarranty: "",
    biayaLainnya: "",
    profit1: "",
    profit2: "",
    profit3: "",
    diskon1: "",
    diskon2: "",
    diskon3: "",
  });

  const userSchema = object({
    idRAK: string(),
    idPermintaan: string(),
    namaPelanggan: string(),
    nomorRegistrasiRAK: string(),
    nomorRegistrasiPermintaan: string(),
    keterangan: string(),
    biayaIndirect: string(),
    biayaDelivery: string(),
    biayaWarranty: string(),
    biayaLainnya: string(),
    profit1: string(),
    profit2: string(),
    profit3: string(),
    diskon1: string(),
    diskon2: string(),
    diskon3: string(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data1 = await UseFetch(
          API_LINK +
            "RencanaAnggaranKegiatan/GetDataRencanaAnggaranKegiatanById",
          { id: withID }
        );

        if (data1 === "ERROR" || data1.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data rencana anggaran kegiatan."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data1[0] };
          setBiayaIndirect(data1[0].biayaIndirect);
          setBiayaDelivery(data1[0].biayaDelivery);
          setBiayaWarranty(data1[0].biayaWarranty);
          setBiayaLainnya(data1[0].biayaLainnya);
          setProfit1(data1[0].profit1);
          setProfit2(data1[0].profit2);
          setProfit3(data1[0].profit3);
          setDiskon1(data1[0].diskon1);
          setDiskon2(data1[0].diskon2);
          setDiskon3(data1[0].diskon3);
        }

        const data2 = await UseFetch(
          API_LINK + "RencanaAnggaranKegiatan/GetDataProdukByRAK",
          {
            idRAK: withID,
            mode: "Detail",
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
            "Biaya Material (Rp)": separator(value["Biaya Material (Rp)"]),
            "Biaya Proses (Rp)": separator(value["Biaya Proses (Rp)"]),
            "Biaya Lainnya (Rp)": separator(value["Biaya Lainnya (Rp)"]),
            "Total Biaya (Rp)": separator(value["Total Biaya (Rp)"]),
            Aksi: [
              {
                IconName: "overview",
                Title: "Lihat Detail Biaya Proses dan Material",
                Function: () => {
                  onChangePage("analisa", {
                    IDRAK: withID,
                    IDProduk: value["Key"],
                    From: "edit",
                  });
                },
              },
            ],
            Alignment: [
              "center",
              "left",
              "center",
              "right",
              "right",
              "right",
              "right",
              "center",
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
        if (
          (hitungTotalAnggaran().props &&
            hitungTotalAnggaran().props.children === "Tidak Valid") ||
          hitungProfit(1).props.children === "Tidak Valid" ||
          hitungProfit(2).props.children === "Tidak Valid" ||
          hitungProfit(3).props.children === "Tidak Valid"
        ) {
          throw new Error(
            "Terjadi kesalahan: Terdapat perhitungan yang tidak valid. Silakan periksa kembali komponen biaya yang dimasukkan."
          );
        } else {
          const data = await UseFetch(
            API_LINK + "RencanaAnggaranKegiatan/EditRencanaAnggaranKegiatan",
            {
              ...formDataRef.current,
              BiayaIndirect: biayaIndirect,
              BiayaDelivery: biayaDelivery,
              BiayaWarranty: biayaWarranty,
              BiayaLainnya: biayaLainnya,
              profit1,
              profit2,
              profit3,
              diskon1,
              diskon2,
              diskon3,
            }
          );

          if (data === "ERROR") {
            throw new Error(
              "Terjadi kesalahan: Gagal menyimpan data rencana anggaran kegiatan."
            );
          }

          Swal.fire(
            "Sukses",
            "Data rencana anggaran kegiatan berhasil disimpan",
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
    } else window.scrollTo(0, 0);
  };

  function hitungTotalBiayaProdukJasa() {
    let total = dataProduk.reduce(
      (akumulasi, val) => akumulasi + clearSeparator(val["Total Biaya (Rp)"]),
      0
    );

    if (isNaN(total))
      return <span className="text-danger fst-italic">Tidak Valid</span>;
    return separator(total);
  }

  function hitungTotalBiayaTambahan() {
    let total = clearSeparator(hitungTotalBiayaProdukJasa());
    let tambahan = 0;

    tambahan = tambahan + (total * parseFloat(biayaIndirect)) / 100;
    tambahan = tambahan + (total * parseFloat(biayaDelivery)) / 100;
    tambahan = tambahan + (total * parseFloat(biayaWarranty)) / 100;
    tambahan = tambahan + (total * parseFloat(biayaLainnya)) / 100;

    if (isNaN(tambahan))
      return <span className="text-danger fst-italic">Tidak Valid</span>;
    return separator(Math.round(tambahan));
  }

  function hitungTotalAnggaran() {
    let total =
      clearSeparator(hitungTotalBiayaProdukJasa()) +
      clearSeparator(hitungTotalBiayaTambahan());

    if (isNaN(total))
      return <span className="text-danger fst-italic">Tidak Valid</span>;
    return separator(total);
  }

  function hitungProfit(alternatif) {
    let total = clearSeparator(hitungTotalAnggaran());
    let keuntungan, diskon;

    switch (alternatif) {
      case 1:
        {
          keuntungan = (total * parseFloat(profit1)) / 100;
          diskon = (keuntungan * parseFloat(diskon1)) / 100;
          total = total + keuntungan - diskon;
        }
        break;
      case 2:
        {
          keuntungan = (total * parseFloat(profit2)) / 100;
          diskon = (keuntungan * parseFloat(diskon2)) / 100;
          total = total + keuntungan - diskon;
        }
        break;
      case 3:
        {
          keuntungan = (total * parseFloat(profit3)) / 100;
          diskon = (keuntungan * parseFloat(diskon3)) / 100;
          total = total + keuntungan - diskon;
        }
        break;
    }

    if (isNaN(total))
      return <span className="text-danger fst-italic">Tidak Valid</span>;
    return (
      <>
        <span className="text-success me-2">
          + {separator(Math.round(keuntungan))}
        </span>
        <span className="text-danger me-3">
          - {separator(Math.round(diskon))}
        </span>
        =<span className="ms-3 fw-bold">{separator(Math.round(total))}</span>
      </>
    );
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
          <div className="card-header bg-primary lead fw-medium text-white">
            Ubah Data Rencana Anggaran Kegiatan
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Label
                  forLabel="nomorRegistrasiRAK"
                  title="Nomor Registrasi RAK"
                  data={formDataRef.current.nomorRegistrasiRAK}
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
                  forLabel="namaPelanggan"
                  title="Nama Pelanggan"
                  data={formDataRef.current.namaPelanggan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="textarea"
                  forInput="keterangan"
                  label="Keterangan"
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
                        <Table data={dataProduk} />
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="float-end mx-2">
                      <span className="fw-bold">
                        Total Biaya Produk/Jasa :&emsp;
                        {hitungTotalBiayaProdukJasa()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Biaya Tambahan
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-3">
                        <Input
                          type="number"
                          forInput="biayaIndirect"
                          label="Biaya Tidak Langsung (%)"
                          value={biayaIndirect}
                          onChange={(e) => setBiayaIndirect(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E")
                              e.preventDefault();
                          }}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Input
                          type="number"
                          forInput="biayaDelivery"
                          label="Biaya Pengiriman (%)"
                          value={biayaDelivery}
                          onChange={(e) => setBiayaDelivery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E")
                              e.preventDefault();
                          }}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Input
                          type="number"
                          forInput="biayaWarranty"
                          label="Biaya Garansi (%)"
                          value={biayaWarranty}
                          onChange={(e) => setBiayaWarranty(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E")
                              e.preventDefault();
                          }}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Input
                          type="number"
                          forInput="biayaLainnya"
                          label="Biaya Lainnya (%)"
                          value={biayaLainnya}
                          onChange={(e) => setBiayaLainnya(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E")
                              e.preventDefault();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="float-end mx-2">
                      <span className="fw-bold">
                        Total Biaya Tambahan :&emsp;
                        {hitungTotalBiayaTambahan()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Total Anggaran dan Perhitungan Harga Jual
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-3">
                        <Label
                          forLabel="totalAnggaran"
                          title="Total Anggaran (Rp)"
                          data={
                            <span className="h1">{hitungTotalAnggaran()}</span>
                          }
                        />
                      </div>
                      <div className="col-lg-2">
                        <Input
                          type="number"
                          forInput="profit1"
                          label="Keuntungan 1 (%)"
                          value={profit1}
                          onChange={(e) => setProfit1(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E")
                              e.preventDefault();
                          }}
                        />
                      </div>
                      <div className="col-lg-2">
                        <Input
                          type="number"
                          forInput="diskon1"
                          label="Diskon 1 (%)"
                          value={diskon1}
                          onChange={(e) => setDiskon1(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E")
                              e.preventDefault();
                          }}
                        />
                      </div>
                      <div className="col-lg-5">
                        <Label
                          forLabel="hargaJual1"
                          title="Harga Jual (Rp)"
                          data={<span className="h3">{hitungProfit(1)}</span>}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-2 offset-lg-3">
                        <Input
                          type="number"
                          forInput="profit2"
                          label="Keuntungan 2 (%)"
                          value={profit2}
                          onChange={(e) => setProfit2(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E")
                              e.preventDefault();
                          }}
                        />
                      </div>
                      <div className="col-lg-2">
                        <Input
                          type="number"
                          forInput="diskon2"
                          label="Diskon 2 (%)"
                          value={diskon2}
                          onChange={(e) => setDiskon2(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E")
                              e.preventDefault();
                          }}
                        />
                      </div>
                      <div className="col-lg-5">
                        <Label
                          forLabel="hargaJual2"
                          title="Harga Jual (Rp)"
                          data={<span className="h3">{hitungProfit(2)}</span>}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-2 offset-lg-3">
                        <Input
                          type="number"
                          forInput="profit3"
                          label="Keuntungan 3 (%)"
                          value={profit3}
                          onChange={(e) => setProfit3(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E")
                              e.preventDefault();
                          }}
                        />
                      </div>
                      <div className="col-lg-2">
                        <Input
                          type="number"
                          forInput="diskon3"
                          label="Diskon 3 (%)"
                          value={diskon3}
                          onChange={(e) => setDiskon3(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E")
                              e.preventDefault();
                          }}
                        />
                      </div>
                      <div className="col-lg-5">
                        <Label
                          forLabel="hargaJual3"
                          title="Harga Jual (Rp)"
                          data={<span className="h3">{hitungProfit(3)}</span>}
                        />
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
