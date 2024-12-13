import { useEffect, useRef, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { separator, clearSeparator } from "../../util/Formatting";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Table from "../../part/Table";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

const inisialisasiDataMaterial = [
  {
    Key: null,
    "Nama Material": null,
    Dimensi: null,
    "Harga Satuan (Rp)": null,
    Jumlah: null,
    "Total Biaya (Rp)": null,
    Count: 0,
  },
];

const inisialisasiDataProses = [
  {
    Key: null,
    "Nama Proses": null,
    "Harga Satuan (Rp)": null,
    Jumlah: null,
    "Total Biaya (Rp)": null,
    Count: 0,
  },
];

export default function RencanaAnggaranKegiatanAnalisa({
  onChangePage,
  withID,
}) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [biayaAlat, setBiayaAlat] = useState(0);
  const [biayaEngineering, setBiayaEngineering] = useState(0);
  const [biayaLainnya, setBiayaLainnya] = useState(0);
  const [dataMaterial, setDataMaterial] = useState(inisialisasiDataMaterial);
  const [dataProses, setDataProses] = useState(inisialisasiDataProses);

  const formDataRef = useRef({
    kodeProduk: "",
    namaProduk: "",
    jenisProduk: "",
    gambarProduk: "",
    spesifikasi: "",
    statusProduk: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data1 = await UseFetch(API_LINK + "MasterProduk/DetailProduk", {
          id: withID.IDProduk,
        });

        if (data1 === "ERROR" || data1.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data produk.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data1[0] };
        }

        const data3 = await UseFetch(
          API_LINK +
            (withID.IDRAK ? "RencanaAnggaranKegiatan" : "PermintaanPelanggan") +
            "/GetData" +
            (withID.IDRAK ? "RAK" : "Base") +
            "CostMaterial",
          { IDProduk: withID.IDProduk, IDRAK: withID.IDRAK }
        );

        if (data3 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data rincian biaya material."
          );
        } else if (data3.length === 0) {
          setDataMaterial(inisialisasiDataMaterial);
        } else {
          const formattedData = data3.map((value) => ({
            ...value,
            "Harga Satuan (Rp)": separator(value["Harga Satuan (Rp)"]),
            "Total Biaya (Rp)": separator(value["Total Biaya (Rp)"]),
            Alignment: ["left", "center", "right", "center", "right"],
          }));
          setDataMaterial(formattedData);
        }

        const data4 = await UseFetch(
          API_LINK +
            (withID.IDRAK ? "RencanaAnggaranKegiatan" : "PermintaanPelanggan") +
            "/GetData" +
            (withID.IDRAK ? "RAK" : "Base") +
            "CostProses",
          { IDProduk: withID.IDProduk, IDRAK: withID.IDRAK }
        );

        if (data4 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data rincian biaya proses."
          );
        } else if (data4.length === 0) {
          setDataProses(inisialisasiDataProses);
        } else {
          const formattedData = data4.map((value) => ({
            ...value,
            "Harga Satuan (Rp)": separator(value["Harga Satuan (Rp)"]),
            "Total Biaya (Rp)": separator(value["Total Biaya (Rp)"]),
            Alignment: ["left", "right", "center", "right"],
          }));
          setDataProses(formattedData);
        }

        const data5 = await UseFetch(
          API_LINK +
            (withID.IDRAK ? "RencanaAnggaranKegiatan" : "PermintaanPelanggan") +
            "/GetData" +
            (withID.IDRAK ? "RAK" : "Base") +
            "CostOther",
          { IDProduk: withID.IDProduk, IDRAK: withID.IDRAK }
        );

        if (data5 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data rincian biaya lainnya."
          );
        } else if (data5.length !== 0) {
          setBiayaAlat(data5[0]["Biaya Alat"]);
          setBiayaEngineering(data5[0]["Biaya Engineering"]);
          setBiayaLainnya(data5[0]["Biaya Lainnya"]);
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

  function hitungTotalBiayaMaterial() {
    let total = dataMaterial.reduce(
      (akumulasi, val) => akumulasi + clearSeparator(val["Total Biaya (Rp)"]),
      0
    );

    if (isNaN(total))
      return <span className="text-danger fst-italic">Tidak Valid</span>;
    return separator(total);
  }

  function hitungTotalBiayaProses() {
    let total = dataProses.reduce(
      (akumulasi, val) => akumulasi + clearSeparator(val["Total Biaya (Rp)"]),
      0
    );

    if (isNaN(total))
      return <span className="text-danger fst-italic">Tidak Valid</span>;
    return separator(total);
  }

  function hitungTotalBiayaLainnya() {
    let total =
      clearSeparator(biayaAlat === "" ? 0 : biayaAlat) +
      clearSeparator(biayaEngineering === "" ? 0 : biayaEngineering) +
      clearSeparator(biayaLainnya === "" ? 0 : biayaLainnya);

    if (isNaN(total))
      return <span className="text-danger fst-italic">Tidak Valid</span>;
    return separator(total);
  }

  function hitungTotalBiaya() {
    let total =
      clearSeparator(hitungTotalBiayaMaterial()) +
      clearSeparator(hitungTotalBiayaProses()) +
      clearSeparator(hitungTotalBiayaLainnya());
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

      <div className="position-fixed bottom-0 z-3 mx-3">
        <div className="flex-fill">
          <div
            className="bg-primary-subtle border border-primary px-3 py-1 rounded-2"
            style={{ marginBottom: "2.6rem" }}
          >
            <span className="lead fw-bold">
              Total Biaya (Rp) :&emsp;{hitungTotalBiaya()}
            </span>
          </div>
        </div>
      </div>

      <form>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Detail Biaya Proses dan Material
          </div>
          <div className="card-body p-3">
            <div className="row">
              <div className="col-lg-12">
                <div className="flex-fill">
                  <Alert
                    type="info"
                    message={
                      <>
                        <div className="lead fw-bold mb-2">Informasi!</div>
                        <div>
                          Halaman ini berisi informasi tentang biaya proses,
                          material, dan biaya lainnya yang diperlukan untuk
                          pembuatan suatu produk. Detail biaya yang tercantum di
                          halaman ini hanya berlaku{" "}
                          <span className="text-decoration-underline fw-bold">
                            untuk pembuatan 1 (satu) unit produk.
                          </span>{" "}
                          Jika pelanggan memesan lebih dari satu unit, maka
                          biaya akan disesuaikan dalam RAK.
                        </div>
                      </>
                    }
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Detail Data Produk
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-3">
                        <Label
                          forLabel="kodeProduk"
                          title="Kode Produk"
                          data={formDataRef.current.kodeProduk}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Label
                          forLabel="namaProduk"
                          title="Nama Produk"
                          data={formDataRef.current.namaProduk}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Label
                          forLabel="jenisProduk"
                          title="Jenis"
                          data={formDataRef.current.jenisProduk}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Label
                          forLabel="gambarProduk"
                          title="Gambar Produk"
                          data={
                            formDataRef.current.gambarProduk.replace(
                              "-",
                              ""
                            ) === "" ? (
                              "-"
                            ) : (
                              <a
                                href={
                                  FILE_LINK + formDataRef.current.gambarProduk
                                }
                                className="text-decoration-none"
                                target="_blank"
                              >
                                Unduh berkas
                              </a>
                            )
                          }
                        />
                      </div>
                      <div className="col-lg-12">
                        <Label
                          forLabel="spesifikasi"
                          title="Spesifikasi"
                          data={formDataRef.current.spesifikasi}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Rincian Biaya Material
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-12">
                        <Table data={dataMaterial} />
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="float-end mx-2">
                      <span className="fw-bold">
                        Total Biaya Material :&emsp;{hitungTotalBiayaMaterial()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Rincian Biaya Proses
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-12">
                        <Table data={dataProses} />
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="float-end mx-2">
                      <span className="fw-bold">
                        Total Biaya Proses :&emsp;{hitungTotalBiayaProses()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Rincian Biaya Lainnya
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-4">
                        <Label
                          forLabel="biayaAlat"
                          title="Biaya Alat (Rp)"
                          data={separator(biayaAlat)}
                        />
                      </div>
                      <div className="col-lg-4">
                        <Label
                          forLabel="biayaEngineering"
                          title="Biaya Engineering (Rp)"
                          data={separator(biayaEngineering)}
                        />
                      </div>
                      <div className="col-lg-4">
                        <Label
                          forLabel="biayaLainnya"
                          title="Biaya Lainnya (Rp)"
                          data={separator(biayaLainnya)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="float-end mx-2">
                      <span className="fw-bold">
                        Total Biaya Lainnya :&emsp;{hitungTotalBiayaLainnya()}
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
            label="KEMBALI"
            onClick={() =>
              onChangePage(
                withID.From,
                withID.From === "add"
                  ? { IDPermintaan: withID.IDPermintaan }
                  : withID.IDRAK
              )
            }
          />
        </div>
      </form>
    </>
  );
}
