import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";
import { separator, clearSeparator } from "../../util/Formatting";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Table from "../../part/Table";

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

export default function RencanaAnggaranKegiatanDetail({
  onChangePage,
  withID,
}) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [dataProduk, setDataProduk] = useState(inisialisasiDataProduk);

  const formDataRef = useRef({
    nomorRegisterRAK: "",
    nomorRegisterPermintaan: "",
    namaPelanggan: "",
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
    statusRAK: "",
    alasanTolak: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data1 = await UseFetch(
          API_LINK + "RencanaAnggaranKegiatan/DetailRencanaAnggaranKegiatan",
          { id: withID }
        );

        if (data1 === "ERROR" || data1.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data rencana anggaran kegiatan."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data1[0] };
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
            "Terjadi kesalahan: Gagal mengambil daftar produk/jasa."
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
                    From: "detail",
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

    tambahan =
      tambahan + (total * parseFloat(formDataRef.current.biayaIndirect)) / 100;
    tambahan =
      tambahan + (total * parseFloat(formDataRef.current.biayaDelivery)) / 100;
    tambahan =
      tambahan + (total * parseFloat(formDataRef.current.biayaWarranty)) / 100;
    tambahan =
      tambahan + (total * parseFloat(formDataRef.current.biayaLainnya)) / 100;

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
          keuntungan = (total * parseFloat(formDataRef.current.profit1)) / 100;
          diskon = (keuntungan * parseFloat(formDataRef.current.diskon1)) / 100;
          total = total + keuntungan - diskon;
        }
        break;
      case 2:
        {
          keuntungan = (total * parseFloat(formDataRef.current.profit2)) / 100;
          diskon = (keuntungan * parseFloat(formDataRef.current.diskon2)) / 100;
          total = total + keuntungan - diskon;
        }
        break;
      case 3:
        {
          keuntungan = (total * parseFloat(formDataRef.current.profit3)) / 100;
          diskon = (keuntungan * parseFloat(formDataRef.current.diskon3)) / 100;
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
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Detail Rencana Anggaran Kegiatan
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-3">
              <Label
                forLabel="nomorRegisterRAK"
                title="Nomor Registrasi RAK"
                data={formDataRef.current.nomorRegisterRAK}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="nomorRegisterPermintaan"
                title="Nomor Registrasi Permintaan"
                data={formDataRef.current.nomorRegisterPermintaan}
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
                forLabel="keterangan"
                title="Keterangan"
                data={formDataRef.current.keterangan}
              />
            </div>
            <div className="col-lg-6">
              <Label
                forLabel="statusRAK"
                title="Status"
                data={
                  formDataRef.current.statusRAK === "Revisi"
                    ? formDataRef.current.statusRAK +
                      ". Alasan: " +
                      formDataRef.current.alasanTolak
                    : formDataRef.current.statusRAK
                }
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
                      <Label
                        forLabel="biayaIndirect"
                        title="Biaya Tidak Langsung"
                        data={formDataRef.current.biayaIndirect + "%"}
                      />
                    </div>
                    <div className="col-lg-3">
                      <Label
                        forLabel="biayaDelivery"
                        title="Biaya Pengiriman"
                        data={formDataRef.current.biayaDelivery + "%"}
                      />
                    </div>
                    <div className="col-lg-3">
                      <Label
                        forLabel="biayaWarranty"
                        title="Biaya Garansi"
                        data={formDataRef.current.biayaWarranty + "%"}
                      />
                    </div>
                    <div className="col-lg-3">
                      <Label
                        forLabel="biayaLainnya"
                        title="Biaya Lainnya"
                        data={formDataRef.current.biayaLainnya + "%"}
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
                      <Label
                        forLabel="profit1"
                        title="Keuntungan 1"
                        data={
                          <span className="h3">
                            {formDataRef.current.profit1 + "%"}
                          </span>
                        }
                      />
                    </div>
                    <div className="col-lg-2">
                      <Label
                        forLabel="diskon1"
                        title="Diskon 1"
                        data={
                          <span className="h3">
                            {formDataRef.current.diskon1 + "%"}
                          </span>
                        }
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
                      <Label
                        forLabel="profit2"
                        title="Keuntungan 2"
                        data={
                          <span className="h3">
                            {formDataRef.current.profit2 + "%"}
                          </span>
                        }
                      />
                    </div>
                    <div className="col-lg-2">
                      <Label
                        forLabel="diskon2"
                        title="Diskon 2"
                        data={
                          <span className="h3">
                            {formDataRef.current.diskon2 + "%"}
                          </span>
                        }
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
                      <Label
                        forLabel="profit3"
                        title="Keuntungan 3"
                        data={
                          <span className="h3">
                            {formDataRef.current.profit3 + "%"}
                          </span>
                        }
                      />
                    </div>
                    <div className="col-lg-2">
                      <Label
                        forLabel="diskon3"
                        title="Diskon 3"
                        data={
                          <span className="h3">
                            {formDataRef.current.diskon3 + "%"}
                          </span>
                        }
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
          classType="secondary px-4 py-2"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />
      </div>
    </>
  );
}
