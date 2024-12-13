import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import { FILE_LINK, API_LINK } from "../../util/Constants";
import { separator, formatDate } from "../../util/Formatting";
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
    Kategori: null,
    Catatan: null,
    Jumlah: null,
    "Gambar Validasi": null,
    Count: 0,
  },
];

export default function SuratPerintahKerjaDetail({ onChangePage, withID }) {
  const role = JSON.parse(decryptId(Cookies.get("activeUser"))).role;
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [dataProduk, setDataProduk] = useState(inisialisasiDataProduk);

  const formDataRef = useRef({
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
    statusSPK: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data1 = await UseFetch(
          API_LINK + "SuratPerintahKerja/DetailSuratPerintahKerja",
          { id: withID, role: role }
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
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Detail Surat Perintah Kerja
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
              <Label
                forLabel="targetPengiriman"
                title="Target Pengiriman"
                data={formatDate(formDataRef.current.targetPengiriman, true)}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="catatanPengiriman"
                title="Catatan Pengiriman"
                data={formDataRef.current.catatanPengiriman}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="statusSPK"
                title="Status"
                data={formDataRef.current.statusSPK}
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
                              {separator(formDataRef.current.biayaEngineering)}
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
                            <td colSpan={2} style={{ verticalAlign: "middle" }}>
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
          classType="secondary px-4 py-2"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />
      </div>
    </>
  );
}
