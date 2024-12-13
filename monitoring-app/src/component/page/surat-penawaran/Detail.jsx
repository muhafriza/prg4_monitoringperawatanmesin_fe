import { useEffect, useRef, useState } from "react";
import { FILE_LINK, API_LINK } from "../../util/Constants";
import { separator, clearSeparator } from "../../util/Formatting";
import { formatDate } from "../../util/Formatting";
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

export default function SuratPenawaranDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [dataProduk, setDataProduk] = useState(inisialisasiDataProduk);

  const formDataRef = useRef({
    idPermintaan: "",
    nomorRegistrasiPenawaran: "",
    nomorRegistrasiPermintaan: "",
    nomorRegistrasiRAK: "",
    namaPelanggan: "",
    nomorRekening: "",
    alternatifRAK: "",
    keterangan: "",
    statusPenawaran: "",
    nomorPO: "",
    nominalPO: "",
    catatanPO: "",
    tanggalPO: "",
    berkasPO: "",
    berkasPenawaran: "",
    berkasSPK: "",
    berkasLainnya: "",
    tanggalKonfirmasi: "",
    nomorSurat: "",
    dikirimOleh: "",
    tanggalKirim: "",
    totalHarga: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data1 = await UseFetch(
          API_LINK + "SuratPenawaran/DetailSuratPenawaran",
          { id: withID }
        );

        if (data1 === "ERROR" || data1.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data surat penawaran."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data1[0] };
        }

        const data2 = await UseFetch(
          API_LINK + "SuratPenawaran/GetDataProdukByPermintaan",
          {
            idPermintaan: formDataRef.current["idPermintaan"],
          }
        );

        if (data2 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data surat penawaran."
          );
        } else if (data2.length === 0) {
          setDataProduk(inisialisasiDataProduk);
        } else {
          const formattedData = data2.map((value) => ({
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Detail Surat Penawaran
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
              <Label
                forLabel="alternatifRAK"
                title="Alternatif Keuntungan dan Diskon"
                data={
                  "Keuntungan: " +
                  parseFloat(formDataRef.current.alternatifRAK.split("#")[0]) +
                  "%\nDiskon: " +
                  parseFloat(formDataRef.current.alternatifRAK.split("#")[1]) +
                  "%"
                }
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="nomorRekening"
                title="Rekening pada Surat Penawaran"
                data={formDataRef.current.nomorRekening}
              />
            </div>
            <div className="col-lg-6">
              <Label
                forLabel="keterangan"
                title="Keterangan atau Kondisi Penawaran"
                data={formDataRef.current.keterangan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="nomorSurat"
                title="Nomor Surat Penawaran"
                data={formDataRef.current.nomorSurat}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="dikirimOleh"
                title="Dikirim Oleh"
                data={formDataRef.current.dikirimOleh}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="tanggalKirim"
                title="Waktu Kirim Surat Penawaran"
                data={
                  formDataRef.current.tanggalKirim === "-"
                    ? "-"
                    : formatDate(formDataRef.current.tanggalKirim)
                }
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="statusPenawaran"
                title="Status"
                data={formDataRef.current.statusPenawaran}
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
          {formDataRef.current.tanggalPO !== "-" && (
            <div className="row">
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Data Konfirmasi Persetujuan Pelanggan
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-3">
                        <Label
                          forLabel="nomorPO"
                          title="Nomor Purchase Order"
                          data={formDataRef.current.nomorPO}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Label
                          forLabel="nominalPO"
                          title="Nominal Purchase Order (Rp)"
                          data={separator(formDataRef.current.nominalPO)}
                        />
                        <div className="mb-4 small fst-italic">
                          <span className="me-1">
                            Selisih dengan Penawaran:{" "}
                          </span>
                          <span
                            id="selisihNominal"
                            className="text-danger fw-bold me-2"
                          >
                            {separator(
                              formDataRef.current.totalHarga -
                                formDataRef.current.nominalPO
                            )}
                          </span>
                          <span
                            id="selisihPersen"
                            className="text-danger fw-bold"
                          >
                            (-
                            {(
                              ((formDataRef.current.totalHarga -
                                formDataRef.current.nominalPO) *
                                100) /
                              formDataRef.current.totalHarga
                            ).toFixed(2)}
                            %)
                          </span>
                        </div>
                      </div>
                      <div className="col-lg-3">
                        <Label
                          forLabel="tanggalPO"
                          title="Tanggal Purchase Order"
                          data={formatDate(formDataRef.current.tanggalPO, true)}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Label
                          forLabel="catatanPO"
                          title="Catatan/Keterangan"
                          data={formDataRef.current.catatanPO}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Label
                          forLabel="berkasPO"
                          title="Berkas Purchase Order"
                          data={
                            formDataRef.current.berkasPO.replace("-", "") ===
                            "" ? (
                              "-"
                            ) : (
                              <a
                                href={FILE_LINK + formDataRef.current.berkasPO}
                                className="text-decoration-none"
                                target="_blank"
                              >
                                Unduh berkas
                              </a>
                            )
                          }
                        />
                      </div>
                      <div className="col-lg-3">
                        <Label
                          forLabel="berkasPenawaran"
                          title="Berkas Konfirmasi Penawaran"
                          data={
                            formDataRef.current.berkasPenawaran.replace(
                              "-",
                              ""
                            ) === "" ? (
                              "-"
                            ) : (
                              <a
                                href={
                                  FILE_LINK +
                                  formDataRef.current.berkasPenawaran
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
                      <div className="col-lg-3">
                        <Label
                          forLabel="berkasSPK"
                          title="Berkas Surat Perintah Kerja"
                          data={
                            formDataRef.current.berkasSPK.replace("-", "") ===
                            "" ? (
                              "-"
                            ) : (
                              <a
                                href={FILE_LINK + formDataRef.current.berkasSPK}
                                className="text-decoration-none"
                                target="_blank"
                              >
                                Unduh berkas
                              </a>
                            )
                          }
                        />
                      </div>
                      <div className="col-lg-3">
                        <Label
                          forLabel="berkasLainnya"
                          title="Berkas Lainnya"
                          data={
                            formDataRef.current.berkasLainnya.replace(
                              "-",
                              ""
                            ) === "" ? (
                              "-"
                            ) : (
                              <a
                                href={
                                  FILE_LINK + formDataRef.current.berkasLainnya
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
                      <div className="col-lg-3">
                        <Label
                          forLabel="tanggalKonfirmasi"
                          title="Waktu Input Konfirmasi Persetujuan"
                          data={formatDate(
                            formDataRef.current.tanggalKonfirmasi
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
