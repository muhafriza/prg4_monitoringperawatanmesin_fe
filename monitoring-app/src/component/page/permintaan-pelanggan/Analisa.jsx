import { useEffect, useRef, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { separator, clearSeparator } from "../../util/Formatting";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Label from "../../part/Label";
import Input from "../../part/Input";
import Table from "../../part/Table";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Modal from "../../part/Modal";

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

export default function PermintaanPelangganAnalisa({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listProses, setListProses] = useState({});
  const [listProduk, setListProduk] = useState({});
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

  const modalRef = useRef();
  const namaMaterialRef = useRef(null);
  const dimensiMaterialRef = useRef(null);
  const jumlahMaterialRef = useRef(null);
  const hargaMaterialRef = useRef(null);
  const namaProsesRef = useRef(null);
  const hargaProsesRef = useRef(0);
  const jumlahProsesRef = useRef(null);
  const fileImporRef = useRef(null);
  const idProdukRef = useRef(null);
  const modeBiayaRef = useRef(null);
  const salinProdukRef = useRef();

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

        const data2 = await UseFetch(
          API_LINK + "MasterProses/GetListProses",
          {}
        );

        if (data2 === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar proses.");
        } else {
          setListProses(data2);
        }

        const data3 = await UseFetch(
          API_LINK + "PermintaanPelanggan/GetDataBaseCostMaterial",
          { IDProduk: withID.IDProduk }
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
            Aksi: ["Delete"],
            Alignment: ["left", "center", "right", "center", "right", "center"],
          }));
          setDataMaterial(formattedData);
        }

        const data4 = await UseFetch(
          API_LINK + "PermintaanPelanggan/GetDataBaseCostProses",
          { IDProduk: withID.IDProduk }
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
            Aksi: ["Delete"],
            Alignment: ["left", "right", "center", "right", "center"],
          }));
          setDataProses(formattedData);
        }

        const data5 = await UseFetch(
          API_LINK + "PermintaanPelanggan/GetDataBaseCostOther",
          { IDProduk: withID.IDProduk }
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

        const data6 = await UseFetch(
          API_LINK + "MasterProduk/GetListProduk",
          {}
        );

        if (data6 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar produk/jasa."
          );
        } else {
          setListProduk(data6);
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

  const handleAdd = async (e) => {
    e.preventDefault();

    const result = await SweetAlert(
      "Simpan Rincian Basis Biaya Proses dan Material",
      "Rincian biaya ini akan berlaku pada Rencana Anggaran Kegiatan (RAK) berikutnya. RAK yang sudah dibuat sebelumnya tidak akan terpengaruh. Apakah Anda yakin ingin menyimpan data ini?",
      "warning",
      "Ya, saya yakin!"
    );

    if (result) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const totalBiaya = clearSeparator(hitungTotalBiaya());

        if (isNaN(totalBiaya)) {
          throw new Error(
            "Terjadi kesalahan: Total biaya tidak valid. Silakan periksa kembali komponen biaya yang dimasukkan."
          );
        } else {
          const data = await UseFetch(
            API_LINK + "PermintaanPelanggan/ResetBaseCostProduk",
            {
              ID: withID.IDProduk,
            }
          );

          if (data === "ERROR") {
            throw new Error(
              "Terjadi kesalahan: Gagal menyimpan data rincian biaya."
            );
          } else {
            await Promise.all(
              dataMaterial.map(async (material) => {
                if (material.Key) {
                  const {
                    "Nama Material": NamaMaterial,
                    Dimensi,
                    "Harga Satuan (Rp)": HargaSatuan,
                    Jumlah,
                  } = material;
                  const materialToSent = {
                    ID: withID.IDProduk,
                    NamaMaterial,
                    Dimensi,
                    HargaSatuan: clearSeparator(HargaSatuan),
                    Jumlah,
                  };
                  const materialHasil = await UseFetch(
                    API_LINK + "PermintaanPelanggan/CreateBaseCostMaterial",
                    materialToSent
                  );
                  if (materialHasil === "ERROR") {
                    throw new Error(
                      "Terjadi kesalahan: Gagal menyimpan rincian biaya material."
                    );
                  }
                }
              })
            );

            await Promise.all(
              dataProses.map(async (proses) => {
                if (proses.Key) {
                  const { Key, Jumlah } = proses;
                  const prosesToSent = {
                    ID: withID.IDProduk,
                    Key,
                    Jumlah,
                  };
                  const prosesHasil = await UseFetch(
                    API_LINK + "PermintaanPelanggan/CreateBaseCostProses",
                    prosesToSent
                  );
                  if (prosesHasil === "ERROR") {
                    throw new Error(
                      "Terjadi kesalahan: Gagal menyimpan rincian biaya proses."
                    );
                  }
                }
              })
            );

            const otherToSent = {
              ID: withID.IDProduk,
              biayaAlat: clearSeparator(biayaAlat),
              biayaEngineering: clearSeparator(biayaEngineering),
              biayaLainnya: clearSeparator(biayaLainnya),
            };
            const otherHasil = await UseFetch(
              API_LINK + "PermintaanPelanggan/CreateBaseCostOther",
              otherToSent
            );
            if (otherHasil === "ERROR") {
              throw new Error(
                "Terjadi kesalahan: Gagal menyimpan rincian biaya lainnya."
              );
            }

            SweetAlert(
              "Sukses",
              "Data rincian basis biaya proses dan material berhasil disimpan",
              "success"
            );
            onChangePage("edit", withID.IDPermintaan);
          }
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
    }
  };

  async function handleProsesChange() {
    try {
      if (namaProsesRef.current.value === "") hargaProsesRef.current = "0";
      else {
        const data = await UseFetch(
          API_LINK + "MasterKursProses/GetHargaLamaByProses",
          { namaProses: namaProsesRef.current.value }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error();
        } else {
          hargaProsesRef.current = separator(data[0].hargaLama);
        }
      }
    } catch {
      hargaProsesRef.current = (
        <span className="text-danger fw-bold fst-italic">
          Error/Belum Ditentukan
        </span>
      );
    } finally {
      setIsError((prevError) => ({ ...prevError, error: false }));
    }
  }

  async function handleCopyProduk() {
    const result = await SweetAlert(
      "Salin Daftar Biaya Proses dan Material",
      "Biaya material, proses, dan biaya lainnya akan ditimpa dan disalin dari produk/jasa yang dipilih. Apakah Anda yakin ingin menyalin dari produk/jasa ini?",
      "warning",
      "Ya, saya yakin!"
    );

    if (result) {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data1 = await UseFetch(
          API_LINK + "PermintaanPelanggan/GetDataBaseCostMaterial",
          { IDProduk: salinProdukRef.current.value }
        );

        if (data1 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data rincian biaya material."
          );
        } else if (data1.length === 0) {
          setDataMaterial(inisialisasiDataMaterial);
        } else {
          const formattedData = data1.map((value) => ({
            ...value,
            "Harga Satuan (Rp)": separator(value["Harga Satuan (Rp)"]),
            "Total Biaya (Rp)": separator(value["Total Biaya (Rp)"]),
            Aksi: ["Delete"],
            Alignment: ["left", "center", "right", "center", "right", "center"],
          }));
          setDataMaterial(formattedData);
        }

        const data2 = await UseFetch(
          API_LINK + "PermintaanPelanggan/GetDataBaseCostProses",
          { IDProduk: salinProdukRef.current.value }
        );

        if (data2 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data rincian biaya proses."
          );
        } else if (data2.length === 0) {
          setDataProses(inisialisasiDataProses);
        } else {
          const formattedData = data2.map((value) => ({
            ...value,
            "Harga Satuan (Rp)": separator(value["Harga Satuan (Rp)"]),
            "Total Biaya (Rp)": separator(value["Total Biaya (Rp)"]),
            Aksi: ["Delete"],
            Alignment: ["left", "right", "center", "right", "center"],
          }));
          setDataProses(formattedData);
        }

        const data3 = await UseFetch(
          API_LINK + "PermintaanPelanggan/GetDataBaseCostOther",
          { IDProduk: salinProdukRef.current.value }
        );

        if (data3 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data rincian biaya lainnya."
          );
        } else if (data3.length !== 0) {
          setBiayaAlat(data3[0]["Biaya Alat"]);
          setBiayaEngineering(data3[0]["Biaya Engineering"]);
          setBiayaLainnya(data3[0]["Biaya Lainnya"]);
        }

        SweetAlert(
          "Sukses",
          "Data rincian biaya proses dan material berhasil disalin",
          "success"
        );
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      }
    }
  }

  function handleAddProses() {
    if (
      namaProsesRef.current.value !== "" &&
      !hargaProsesRef.current.includes("Error/Belum Ditentukan") &&
      jumlahProsesRef.current.value !== "" &&
      !isNaN(jumlahProsesRef.current.value)
    ) {
      const idProses = namaProsesRef.current.value;
      const namaProses = namaProsesRef.current.selectedOptions[0].textContent;
      const jumlahProses = jumlahProsesRef.current.value;
      const hargaProses = clearSeparator(hargaProsesRef.current);
      namaProsesRef.current.selectedIndex = 0;
      jumlahProsesRef.current.value = "";
      hargaProsesRef.current = "0";
      const existingProsesIndex = dataProses.findIndex(
        (item) => item.Key === parseInt(idProses)
      );
      if (existingProsesIndex !== -1) {
        setDataProses((prevData) => {
          const newData = [...prevData];
          newData[existingProsesIndex] = {
            ...newData[existingProsesIndex],
            Jumlah: parseFloat(
              (
                parseFloat(newData[existingProsesIndex].Jumlah) +
                parseFloat(jumlahProses)
              ).toFixed(2)
            ),
            "Total Biaya (Rp)": separator(
              Math.round(
                parseFloat(
                  (
                    parseFloat(newData[existingProsesIndex].Jumlah) +
                    parseFloat(jumlahProses)
                  ).toFixed(2)
                ) * parseFloat(hargaProses)
              )
            ),
          };
          return newData;
        });
      } else {
        const count = dataProses[0].Key === null ? 1 : dataProses.length + 1;
        const prosesBaru = {
          Key: parseInt(idProses),
          "Nama Proses": namaProses,
          "Harga Satuan (Rp)": separator(hargaProses),
          Jumlah: parseFloat(parseFloat(jumlahProses).toFixed(2)),
          "Total Biaya (Rp)": separator(
            Math.round(
              parseFloat(parseFloat(jumlahProses).toFixed(2)) * hargaProses
            )
          ),
          Count: count,
          Aksi: ["Delete"],
          Alignment: ["left", "right", "center", "right", "center"],
        };
        setDataProses((prevData) => {
          if (prevData[0].Key === null) prevData = [];
          return [...prevData, prosesBaru];
        });
      }
    }
  }

  function handleDeleteProses(id) {
    setDataProses((prevData) => {
      const newData = prevData
        .filter((proses) => proses.Key !== id)
        .map((proses) => {
          return { ...proses };
        });
      if (newData.length === 0) return inisialisasiDataProses;
      else return newData;
    });
  }

  function handleAddMaterial() {
    if (
      namaMaterialRef.current.value !== "" &&
      dimensiMaterialRef.current.value !== "" &&
      hargaMaterialRef.current.value !== "" &&
      jumlahMaterialRef.current.value !== "" &&
      !isNaN(hargaMaterialRef.current.value) &&
      !isNaN(jumlahMaterialRef.current.value)
    ) {
      const namaMaterial = namaMaterialRef.current.value;
      const dimensiMaterial = dimensiMaterialRef.current.value;
      const jumlahMaterial = jumlahMaterialRef.current.value;
      const hargaMaterial = hargaMaterialRef.current.value;
      namaMaterialRef.current.value = "";
      dimensiMaterialRef.current.value = "";
      jumlahMaterialRef.current.value = "";
      hargaMaterialRef.current.value = "";

      const count = dataMaterial[0].Key === null ? 1 : dataMaterial.length + 1;
      const materialBaru = {
        Key: Math.round(Math.random() * 1000000),
        "Nama Material": namaMaterial,
        Dimensi: dimensiMaterial,
        "Harga Satuan (Rp)": separator(hargaMaterial),
        Jumlah: parseFloat(parseFloat(jumlahMaterial).toFixed(2)),
        "Total Biaya (Rp)": separator(
          Math.round(
            parseFloat(parseFloat(jumlahMaterial).toFixed(2)) * hargaMaterial
          )
        ),
        Count: count,
        Aksi: ["Delete"],
        Alignment: ["left", "center", "right", "center", "right", "center"],
      };
      setDataMaterial((prevData) => {
        if (prevData[0].Key === null) prevData = [];
        return [...prevData, materialBaru];
      });
    }
  }

  function handleDeleteMaterial(id) {
    setDataMaterial((prevData) => {
      const newData = prevData
        .filter((material) => material.Key !== id)
        .map((material) => {
          return { ...material };
        });
      if (newData.length === 0) return inisialisasiDataMaterial;
      else return newData;
    });
  }

  async function handleDownloadTemplate() {
    setIsError((prevError) => ({ ...prevError, error: false }));

    try {
      switch (modeBiayaRef.current) {
        case "Material":
          window.open("./public/Template_List_Material.xlsx", "_blank");
          break;
        case "Proses":
          {
            const data = await UseFetch(
              API_LINK + "PermintaanPelanggan/CreateTemplateProses",
              {}
            );

            if (data === "ERROR" || data.length === 0) {
              throw new Error(
                "Terjadi kesalahan: Gagal membuat template daftar proses."
              );
            } else {
              window.open(FILE_LINK + "Template_List_Proses.xlsx", "_blank");
            }
          }
          break;
      }
    } catch (error) {
      window.scrollTo(0, 0);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      modalRef.current.close();
    }
  }

  function handleUploadBerkasImpor(id, mode) {
    idProdukRef.current = id;
    modeBiayaRef.current = mode;
    modalRef.current.open();
  }

  async function handleUploadBerkasImporExecute(ref, extAllowed) {
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop().toLowerCase();
    let error = "";
    let result = "";
    modalRef.current.close();

    if (fileSize / 1024576 > 10)
      error = "Berkas terlalu besar, maksimum adalah 10 MB";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "Format berkas tidak valid";

    if (error) {
      ref.current.value = "";
      SweetAlert("Unggah Berkas Gagal", error, "error");
    } else {
      const confirmation = await SweetAlert(
        "Konfirmasi Impor Data " + modeBiayaRef.current,
        "Data " +
          modeBiayaRef.current.toLowerCase() +
          " akan ditimpa. Apakah Anda yakin ingin mengimpor data ini?",
        "warning",
        "Ya, saya yakin!"
      );

      if (confirmation) {
        await UploadFile(ref.current).then((data) => (result = data.Hasil));

        const data = await UseFetch(
          API_LINK + "PermintaanPelanggan/ImporBaseCost" + modeBiayaRef.current,
          {
            fileName: result,
          }
        );

        if (data === "ERROR" || data.length === 0) {
          SweetAlert(
            "Simpan Data Gagal",
            "Gagal menyimpan daftar " +
              modeBiayaRef.current.toString().toLowerCase(),
            "error"
          );
        } else {
          if (modeBiayaRef.current === "Material") {
            const formattedData = data.map((value) => ({
              ...value,
              "Harga Satuan (Rp)": separator(value["Harga Satuan (Rp)"]),
              "Total Biaya (Rp)": separator(value["Total Biaya (Rp)"]),
              Aksi: ["Delete"],
              Alignment: [
                "left",
                "center",
                "right",
                "center",
                "right",
                "center",
              ],
            }));
            setDataMaterial(formattedData);
          } else if (modeBiayaRef.current === "Proses") {
            const formattedData = data.map((value) => ({
              ...value,
              Key: parseInt(value["Key"]),
              Jumlah: parseFloat(
                parseFloat(value["Jumlah"].replace(",", ".")).toFixed(2)
              ),
              "Harga Satuan (Rp)": separator(value["Harga Satuan (Rp)"]),
              "Total Biaya (Rp)": separator(value["Total Biaya (Rp)"]),
              Aksi: ["Delete"],
              Alignment: ["left", "right", "center", "right", "center"],
            }));
            setDataProses(formattedData);
          }

          SweetAlert(
            "Simpan Data Berhasil",
            "Daftar " +
              modeBiayaRef.current.toString().toLowerCase() +
              " berhasil disimpan",
            "success"
          );
        }
      }
      ref.current.value = "";
    }
  }

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

      <div className="visually-hidden">
        <FileUpload
          forInput="berkasImpor"
          formatFile=".xlsx"
          ref={fileImporRef}
          onChange={() => handleUploadBerkasImporExecute(fileImporRef, "xlsx")}
        />
      </div>
      <Modal title="Unggah Berkas" ref={modalRef} size="small">
        <div className="row">
          <div className="col-lg-12">
            <div className="flex-fill">
              <Alert
                type="danger"
                message={
                  <>
                    <div className="lead fw-bold mb-1">Penting!</div>
                    <div>Data akan langsung ditimpa setelah unggah berkas.</div>
                  </>
                }
              />
            </div>
          </div>
          <div className="col-lg-12 pe-3">
            <ol>
              <li className="mt-2 mb-3">
                Silakan unduh berkas template terlebih dahulu,{" "}
                <a
                  className="text-decoration-none fw-bold"
                  href="#"
                  onClick={handleDownloadTemplate}
                >
                  klik disini.
                </a>
              </li>
              <li className="mb-3">
                Pastikan pengisian data sesuai dengan template yang sudah
                ditentukan.
              </li>
              <li className="mb-3">
                Unggah berkas yang telah diisi,{" "}
                <a
                  className="text-decoration-none fw-bold"
                  href="#"
                  onClick={() => {
                    fileImporRef.current.click();
                  }}
                >
                  klik disini.
                </a>
              </li>
            </ol>
          </div>
        </div>
      </Modal>

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

      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Atur Basis Biaya Proses dan Material
          </div>
          <div className="card-body p-3">
            <div className="row">
              <div className="col-lg-12">
                <div className="flex-fill">
                  <Alert
                    type="info"
                    message={
                      <>
                        <div className="lead fw-bold mb-2">Penting!</div>
                        <div>
                          Halaman ini berfungsi untuk menetapkan biaya proses,
                          material, dan biaya lainnya yang diperlukan untuk
                          pembuatan suatu produk. Biaya-biaya ini akan menjadi
                          dasar perhitungan dalam Rencana Anggaran Kegiatan
                          (RAK), dan detail biaya yang tercantum di halaman ini
                          hanya berlaku{" "}
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
                  <div className="card-body p-4 pb-2">
                    <div className="row">
                      <div className="col-lg-4 mt-1">
                        <Label
                          forLabel="salinProdukLabel"
                          title="Salin daftar material, proses, dan biaya lainnya dari
                          produk/jasa lain:"
                        />
                      </div>
                      <div className="col-lg-4">
                        <DropDown
                          forInput="salinProduk"
                          label="Produk/Jasa"
                          showLabel={false}
                          arrData={listProduk}
                          ref={salinProdukRef}
                        />
                      </div>
                      <div className="col-lg-2 mb-4">
                        <Button
                          classType="success w-100"
                          iconName="duplicate"
                          label="Salin"
                          onClick={handleCopyProduk}
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
                      <div className="col-lg-4 pb-2">
                        <Input
                          forInput="namaMaterial"
                          ref={namaMaterialRef}
                          placeholder="Nama Material"
                        />
                      </div>
                      <div className="col-lg-2 pb-2">
                        <Input
                          forInput="dimensiMaterial"
                          ref={dimensiMaterialRef}
                          placeholder="Dimensi"
                        />
                      </div>
                      <div className="col-lg-2 pb-2">
                        <Input
                          type="number"
                          forInput="hargaMaterial"
                          ref={hargaMaterialRef}
                          placeholder="Harga Satuan (Rp)"
                          onKeyDown={(e) => {
                            if (
                              e.key === "." ||
                              e.key === "," ||
                              e.key === "e" ||
                              e.key === "E"
                            )
                              e.preventDefault();
                          }}
                        />
                      </div>
                      <div className="col-lg-2 pb-3">
                        <Input
                          type="number"
                          forInput="jumlahMaterial"
                          ref={jumlahMaterialRef}
                          placeholder="Jumlah"
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E")
                              e.preventDefault();
                          }}
                        />
                        <sub>
                          Gunakan tanda "," (koma) jika terdapat desimal.
                          Contoh: 10,4
                        </sub>
                      </div>
                      <div className="col-lg-1 pb-2 px-2">
                        <Button
                          classType="success w-100"
                          iconName="add"
                          label="Simpan"
                          onClick={handleAddMaterial}
                        />
                      </div>
                      <div className="col-lg-1 pb-4 px-2">
                        <Button
                          classType="primary w-100"
                          iconName="file-upload"
                          label="Impor"
                          onClick={() =>
                            handleUploadBerkasImpor(withID.IDProduk, "Material")
                          }
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12">
                        <Table
                          data={dataMaterial}
                          onDelete={handleDeleteMaterial}
                        />
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
                      <div className="col-lg-4">
                        <DropDown
                          forInput="namaProses"
                          label="Nama Proses"
                          showLabel={false}
                          arrData={listProses}
                          ref={namaProsesRef}
                          onChange={handleProsesChange}
                        />
                      </div>
                      <div className="col-lg-3 pb-1">
                        <div
                          className="mb-3 px-3 border border-1 rounded-2"
                          style={{ paddingTop: "6px", paddingBottom: "6px" }}
                        >
                          <span className="fw-bold ">Harga Satuan (Rp):</span>
                          &emsp;{hargaProsesRef.current}
                        </div>
                      </div>
                      <div className="col-lg-3 pb-3">
                        <Input
                          type="number"
                          forInput="jumlahProses"
                          ref={jumlahProsesRef}
                          placeholder="Jumlah"
                          onKeyDown={(e) => {
                            if (e.key === "e" || e.key === "E")
                              e.preventDefault();
                          }}
                        />
                        <sub>
                          Gunakan tanda "," (koma) jika terdapat desimal.
                          Contoh: 10,4
                        </sub>
                      </div>
                      <div className="col-lg-1 pb-2 px-2">
                        <Button
                          classType="success w-100"
                          iconName="add"
                          label="Simpan"
                          onClick={handleAddProses}
                        />
                      </div>
                      <div className="col-lg-1 pb-4 px-2">
                        <Button
                          classType="primary w-100"
                          iconName="file-upload"
                          label="Impor"
                          onClick={() =>
                            handleUploadBerkasImpor(withID.IDProduk, "Proses")
                          }
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12">
                        <Table
                          data={dataProses}
                          onDelete={handleDeleteProses}
                        />
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
                        <Input
                          type="text"
                          forInput="biayaAlat"
                          label="Biaya Alat (Rp)"
                          value={separator(biayaAlat)}
                          onChange={(e) => setBiayaAlat(e.target.value)}
                        />
                      </div>
                      <div className="col-lg-4">
                        <Input
                          type="text"
                          forInput="biayaEngineering"
                          label="Biaya Engineering (Rp)"
                          value={separator(biayaEngineering)}
                          onChange={(e) => setBiayaEngineering(e.target.value)}
                        />
                      </div>
                      <div className="col-lg-4">
                        <Input
                          type="text"
                          forInput="biayaLainnya"
                          label="Biaya Lainnya (Rp)"
                          value={separator(biayaLainnya)}
                          onChange={(e) => setBiayaLainnya(e.target.value)}
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
            label="BATAL"
            onClick={() => onChangePage("edit", withID.IDPermintaan)}
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
