import { useEffect, useRef, useState } from "react";
import { object, string, date } from "yup";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { formatDate } from "../../util/Formatting";
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
import Icon from "../../part/Icon";

const inisialisasiDataProduk = [
  {
    Key: null,
    No: null,
    "Nama Produk/Jasa": null,
    Catatan: null,
    Jumlah: null,
    "Gambar Validasi": null,
    "Persetujuan Engineering": null,
    "Persetujuan PPIC": null,
    Count: 0,
  },
];

const listJenisPermintaan = [{ Value: "Eksternal", Text: "Eksternal" }];

const listJenisKomersial = [
  { Value: "Komersial", Text: "Komersial" },
  { Value: "Non-Komersial", Text: "Non-Komersial" },
];

export default function PermintaanPelangganEdit({ onChangePage, withID }) {
  const role = JSON.parse(decryptId(Cookies.get("activeUser"))).role;
  const isDisabled = role !== "ROL17";
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listPelanggan, setListPelanggan] = useState({});
  const [listProduk, setListProduk] = useState({});
  const [dataProduk, setDataProduk] = useState(inisialisasiDataProduk);

  const formDataRef = useRef({
    idPermintaan: "",
    nomorRegister: "",
    nomorPermintaan: "",
    namaPelanggan: "",
    tanggalPermintaan: "",
    jenisPermintaan: "",
    jenisKomersial: "",
    kontakPelanggan: "",
    noHPPelanggan: "",
    emailPelanggan: "",
    berkasPenawaran: "",
    berkasGambar: "",
    berkasLainnya: "",
    estimasiPenawaran: "",
    keterangan: "",
  });

  const filePenawaranRef = useRef(null);
  const fileGambarRef = useRef(null);
  const fileLainRef = useRef(null);
  const fileValidasiRef = useRef(null);
  const idProdukRef = useRef(null);
  const namaProdukRef = useRef(null);
  const jumlahProdukRef = useRef(null);
  const catatanProdukRef = useRef(null);

  const userSchema = object({
    idPermintaan: string(),
    nomorRegister: string(),
    nomorPermintaan: string()
      .max(50, "maksimum 50 karakter")
      .required("harus diisi"),
    namaPelanggan: string().required("harus dipilih"),
    tanggalPermintaan: date()
      .max(new Date().toISOString().split("T")[0], "tanggal tidak valid")
      .typeError("harus diisi")
      .required("harus diisi"),
    jenisPermintaan: string().required("harus dipilih"),
    jenisKomersial: string().required("harus dipilih"),
    kontakPelanggan: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    noHPPelanggan: string()
      .max(15, "maksimum 15 karakter")
      .required("harus diisi"),
    emailPelanggan: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi")
      .email("format email tidak valid"),
    berkasPenawaran: string(),
    berkasGambar: string(),
    berkasLainnya: string(),
    estimasiPenawaran: date()
      .max(
        new Date(new Date().setDate(new Date().getDate() + 7))
          .toISOString()
          .split("T")[0],
        "tanggal tidak valid"
      )
      .typeError("harus diisi")
      .required("harus diisi"),
    keterangan: string(),
  });

  const fetchDataByEndpointAndParams = async (
    endpoint,
    params,
    setter,
    errorMessage
  ) => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      const data = await UseFetch(endpoint, params);
      if (data === "ERROR") {
        throw new Error(errorMessage);
      } else {
        setter(data);
      }
    } catch (error) {
      window.scrollTo(0, 0);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setter({});
    }
  };

  // MENGAMBIL DAFTAR PELANGGAN -- BEGIN
  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "MasterPelanggan/GetListPelanggan",
      {},
      setListPelanggan,
      "Terjadi kesalahan: Gagal mengambil daftar pelanggan."
    );
  }, []);
  // MENGAMBIL DAFTAR PELANGGAN -- END

  // MENGAMBIL DAFTAR PRODUK -- BEGIN
  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "MasterProduk/GetListProduk",
      {},
      setListProduk,
      "Terjadi kesalahan: Gagal mengambil daftar produk."
    );
  }, []);
  // MENGAMBIL DAFTAR PRODUK -- END

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        await handleLoadDetailPelanggan();
        await handleLoadDetailProduk();
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

    if (name === "jenisPermintaan") {
      if (value === "Eksternal" || value === "") {
        formDataRef.current["jenisKomersial"] = "Komersial";
        document
          .getElementById("divJenisKomersial")
          .classList.add("visually-hidden");
      } else {
        formDataRef.current["jenisKomersial"] = "";
        document
          .getElementById("divJenisKomersial")
          .classList.remove("visually-hidden");
      }
    }

    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleFileChange = (ref, extAllowed) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const validationError = validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024576 > 10) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
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

      const uploadPromises = [];

      const fileInputs = [
        { ref: filePenawaranRef, key: "berkasPenawaran" },
        { ref: fileGambarRef, key: "berkasGambar" },
        { ref: fileLainRef, key: "berkasLainnya" },
      ];

      if (role === "ROL17") {
        fileInputs.forEach((fileInput) => {
          if (fileInput.ref.current.files.length > 0) {
            uploadPromises.push(
              UploadFile(fileInput.ref.current).then(
                (data) => (formDataRef.current[fileInput.key] = data.Hasil)
              )
            );
          }
        });
      }

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "PermintaanPelanggan/EditPermintaanPelanggan",
          { ...formDataRef.current, role: role }
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data permintaan pelanggan."
          );
        } else {
          if (role === "ROL17") {
            const currentID = data[0].hasil;

            await Promise.all(
              dataProduk.map(async (produk) => {
                if (produk.Key) {
                  const { Key, Jumlah, Catatan } = produk;
                  const produkToSent = { ID: currentID, Key, Jumlah, Catatan };
                  const produkHasil = await UseFetch(
                    API_LINK +
                      "PermintaanPelanggan/CreatePermintaanPelangganProduk",
                    produkToSent
                  );
                  if (produkHasil === "ERROR") {
                    throw new Error(
                      "Terjadi kesalahan: Gagal menyimpan data produk."
                    );
                  }
                }
              })
            );
          }

          SweetAlert(
            "Sukses",
            "Data permintaan pelanggan berhasil disimpan",
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

  function handleAddProduk() {
    if (
      namaProdukRef.current.value !== "" &&
      jumlahProdukRef.current.value !== "" &&
      !isNaN(jumlahProdukRef.current.value && role === "ROL17")
    ) {
      const idProduk = namaProdukRef.current.value;
      const namaProduk = namaProdukRef.current.selectedOptions[0].textContent;
      const jumlahProduk = jumlahProdukRef.current.value;
      const catatanProduk = catatanProdukRef.current.value;
      namaProdukRef.current.selectedIndex = 0;
      jumlahProdukRef.current.value = "";
      catatanProdukRef.current.value = "";

      const existingProdukIndex = dataProduk.findIndex(
        (item) => item.Key === parseInt(idProduk)
      );

      if (existingProdukIndex !== -1) {
        setDataProduk((prevData) => {
          const newData = [...prevData];
          newData[existingProdukIndex] = {
            ...newData[existingProdukIndex],
            Jumlah:
              newData[existingProdukIndex].Jumlah + parseInt(jumlahProduk),
            Catatan:
              catatanProduk === ""
                ? newData[existingProdukIndex].Catatan
                : catatanProduk,
          };
          return newData;
        });
      } else {
        const count = dataProduk[0].Key === null ? 1 : dataProduk.length + 1;
        const produkBaru = {
          Key: parseInt(idProduk),
          No: count,
          "Nama Produk/Jasa": namaProduk,
          Catatan: catatanProduk === "" ? "-" : catatanProduk,
          Jumlah: parseInt(jumlahProduk),
          "Gambar Validasi": "-",
          "Persetujuan Engineering": "-",
          "Persetujuan PPIC": "-",
          Count: count,
          Aksi: role === "ROL17" ? ["Delete"] : [],
          Alignment: [
            "center",
            "left",
            "left",
            "center",
            "center",
            "center",
            "center",
            "center",
          ],
        };

        setDataProduk((prevData) => {
          if (prevData[0].Key === null) prevData = [];
          return [...prevData, produkBaru];
        });
      }
    }
  }

  function handleDeleteProduk(id) {
    setDataProduk((prevData) => {
      const newData = prevData
        .filter((produk) => produk.Key !== id)
        .map((produk, idx) => {
          return { ...produk, No: idx + 1, Count: idx + 1 };
        });
      if (newData.length === 0) return inisialisasiDataProduk;
      else return newData;
    });
  }

  function handleUploadGambarValidasi(id) {
    idProdukRef.current = id;
    fileValidasiRef.current.click();
  }

  async function handleUploadGambarValidasiExecute(ref, extAllowed) {
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop().toLowerCase();
    let error = "";
    let result = "";

    if (fileSize / 1024576 > 10)
      error = "Berkas terlalu besar, maksimum adalah 10 MB";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "Format berkas tidak valid";

    if (error) {
      ref.current.value = "";
      SweetAlert("Unggah Berkas Gagal", error, "error");
    } else {
      await UploadFile(ref.current).then((data) => (result = data.Hasil));

      const data = await UseFetch(
        API_LINK + "PermintaanPelanggan/SetGambarValidasi",
        {
          idPermintaan: withID,
          idProduk: idProdukRef.current,
          fileName: result,
        }
      );

      if (data === "ERROR") {
        SweetAlert(
          "Unggah Berkas Gagal",
          "Gagal menyimpan data permintaan pelanggan",
          "error"
        );
      } else {
        ref.current.value = "";
        await handleLoadDetailProduk();
      }
    }
  }

  async function handleApproveProduk(id) {
    const result = await SweetAlert(
      "Setujui Permintaan Produk/Jasa",
      "Pastikan bahwa permintaan produk/jasa ini telah dianalisis dengan baik dan telah menyatakan kesanggupannya. Apakah Anda yakin ingin menyetujui permintaan produk/jasa ini?",
      "info",
      "Ya, saya yakin!",
      "textarea",
      "Tuliskan catatan disini... (opsional)"
    );

    try {
      if (result) {
        setIsLoading(true);
        setIsError(false);

        const data = await UseFetch(
          API_LINK + "PermintaanPelanggan/ApprovePermintaanPelangganProduk",
          {
            idPermintaan: withID,
            idProduk: id,
            role: role,
            catatan: result,
          }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal menyetujui permintaan produk/jasa."
          );
        } else if (data[0].Hasil === "NEED BASE RAK") {
          SweetAlert(
            "Setujui Produk/Jasa Gagal",
            "Permintaan produk/jasa ini tidak dapat disetujui karena Anda belum membuat basis biaya proses atau material yang dibutuhkan",
            "error"
          );
        } else {
          SweetAlert(
            "Sukses",
            "Permintaan produk/jasa berhasil disetujui",
            "success"
          );
          if (data[0].Hasil === "CONTINUE") {
            await handleLoadDetailProduk();
          } else if (data[0].Hasil === "END") {
            onChangePage("index");
          }
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

  async function handleRejectProduk(id) {
    const result = await SweetAlert(
      "Tolak Permintaan Produk/Jasa",
      "Apakah Anda yakin ingin menolak permintaan produk/jasa ini?",
      "warning",
      "Ya, saya yakin!",
      "textarea",
      "Tuliskan alasan tolak disini..."
    );

    try {
      if (result) {
        setIsLoading(true);
        setIsError(false);

        const data = await UseFetch(
          API_LINK + "PermintaanPelanggan/RejectPermintaanPelangganProduk",
          {
            idPermintaan: withID,
            idProduk: id,
            alasanTolak: result,
            role: role,
          }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal menolak permintaan produk/jasa."
          );
        } else {
          SweetAlert(
            "Sukses",
            "Permintaan produk/jasa berhasil ditolak",
            "success"
          );
          if (data[0].Hasil === "CONTINUE") {
            await handleLoadDetailProduk();
          } else if (data[0].Hasil === "END") {
            onChangePage("index");
          }
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

  async function handleLoadDetailPelanggan() {
    const data = await UseFetch(
      API_LINK + "PermintaanPelanggan/GetDataPermintaanPelangganById",
      { id: withID }
    );

    if (data === "ERROR" || data.length === 0) {
      throw new Error(
        "Terjadi kesalahan: Gagal mengambil data permintaan pelanggan."
      );
    } else {
      formDataRef.current = { ...formDataRef.current, ...data[0] };
    }
  }

  async function handleLoadDetailProduk() {
    const data = await UseFetch(
      API_LINK + "PermintaanPelanggan/DetailPermintaanPelangganProduk",
      { id: withID }
    );

    if (data === "ERROR") {
      throw new Error(
        "Terjadi kesalahan: Gagal mengambil daftar permintaan produk."
      );
    } else if (data.length === 0) {
      setDataProduk(inisialisasiDataProduk);
    } else {
      const formattedData = data.map((value) => ({
        ...value,
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
        "Persetujuan Engineering": value["Persetujuan Engineering"] ? (
          <>
            {value["Persetujuan Engineering"].split("#")[2] === "[KOSONG]" ? (
              <>
                <Icon
                  name="hexagon-check"
                  type="Bold"
                  cssClass="text-success me-2"
                />
                Disetujui
                {value["Persetujuan Engineering"].split("#")[3] !== "-" &&
                  value["Persetujuan Engineering"].split("#")[3] !==
                    "[KOSONG]" && (
                    <>
                      <br />
                      <span
                        className="fst-italic"
                        style={{ fontWeight: "500" }}
                      >
                        "{value["Persetujuan Engineering"].split("#")[3]}"
                      </span>
                    </>
                  )}
              </>
            ) : (
              <>
                <Icon
                  name="times-hexagon"
                  type="Bold"
                  cssClass="text-danger me-2"
                />
                Ditolak
                <br />
                <span className="fst-italic" style={{ fontWeight: "500" }}>
                  "{value["Persetujuan Engineering"].split("#")[2]}"
                </span>
              </>
            )}
            <br />
            {value["Persetujuan Engineering"].split("#")[0]}
            <br />
            {formatDate(value["Persetujuan Engineering"].split("#")[1])}
          </>
        ) : (
          "-"
        ),
        "Persetujuan PPIC": value["Persetujuan PPIC"] ? (
          <>
            {value["Persetujuan PPIC"].split("#")[2] === "[KOSONG]" ? (
              <>
                <Icon
                  name="hexagon-check"
                  type="Bold"
                  cssClass="text-success me-2"
                />
                Disetujui
                {value["Persetujuan PPIC"].split("#")[3] !== "-" &&
                  value["Persetujuan PPIC"].split("#")[3] !== "[KOSONG]" && (
                    <>
                      <br />
                      <span
                        className="fst-italic"
                        style={{ fontWeight: "500" }}
                      >
                        "{value["Persetujuan PPIC"].split("#")[3]}"
                      </span>
                    </>
                  )}
              </>
            ) : (
              <>
                <Icon
                  name="times-hexagon"
                  type="Bold"
                  cssClass="text-danger me-2"
                />
                Ditolak
                <br />
                <span className="fst-italic" style={{ fontWeight: "500" }}>
                  "{value["Persetujuan PPIC"].split("#")[2]}"
                </span>
              </>
            )}
            <br />
            {value["Persetujuan PPIC"].split("#")[0]}
            <br />
            {formatDate(value["Persetujuan PPIC"].split("#")[1])}
          </>
        ) : (
          "-"
        ),
        Aksi:
          role === "ROL17"
            ? ["Delete"]
            : role === "ROL50" || role === "ROL18"
            ? [
                ...(role === "ROL50"
                  ? [
                      "Upload",
                      {
                        IconName: "calculator",
                        Title: "Atur Basis Biaya Proses dan Material",
                        Function: () => {
                          onChangePage("analisa", {
                            IDPermintaan: withID,
                            IDProduk: value["Key"],
                          });
                        },
                      },
                    ]
                  : []),
                ...((role === "ROL50" && value["Persetujuan Engineering"]) ||
                (role === "ROL18" && value["Persetujuan PPIC"])
                  ? []
                  : ["Approve", "Reject"]),
              ]
            : [],
        Alignment: [
          "center",
          "left",
          "left",
          "center",
          "center",
          "center",
          "center",
          "center",
        ],
      }));
      setDataProduk(formattedData);
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

      <div className="visually-hidden">
        <FileUpload
          forInput="berkasValidasi"
          formatFile=".jpg,.png,.pdf,.zip"
          ref={fileValidasiRef}
          onChange={() =>
            handleUploadGambarValidasiExecute(
              fileValidasiRef,
              "jpg,png,pdf,zip"
            )
          }
        />
      </div>

      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Ubah Data Permintaan Pelanggan
          </div>
          <div className="card-body p-3">
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Data Permintaan Pelanggan
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-3">
                        <Label
                          forLabel="nomorRegister"
                          title="Nomor Registrasi"
                          data={formDataRef.current.nomorRegister}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Input
                          type="text"
                          forInput="nomorPermintaan"
                          label="Nomor Permintaan"
                          isRequired
                          isDisabled={isDisabled}
                          value={formDataRef.current.nomorPermintaan}
                          onChange={handleInputChange}
                          errorMessage={errors.nomorPermintaan}
                        />
                      </div>
                      <div className="col-lg-3">
                        <DropDown
                          forInput="namaPelanggan"
                          label="Nama Pelanggan"
                          arrData={listPelanggan}
                          isRequired
                          isDisabled={isDisabled}
                          value={formDataRef.current.namaPelanggan}
                          onChange={handleInputChange}
                          errorMessage={errors.namaPelanggan}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Input
                          type="date"
                          forInput="tanggalPermintaan"
                          label="Tanggal Permintaan"
                          isRequired
                          isDisabled={isDisabled}
                          value={formDataRef.current.tanggalPermintaan}
                          onChange={handleInputChange}
                          errorMessage={errors.tanggalPermintaan}
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Input
                          type="date"
                          forInput="estimasiPenawaran"
                          label="Estimasi Penawaran"
                          isRequired
                          isDisabled={isDisabled}
                          value={formDataRef.current.estimasiPenawaran}
                          onChange={handleInputChange}
                          errorMessage={errors.estimasiPenawaran}
                          max={
                            new Date(
                              new Date().setDate(new Date().getDate() + 7)
                            )
                              .toISOString()
                              .split("T")[0]
                          }
                        />
                      </div>
                      <div className="col-lg-3">
                        <DropDown
                          forInput="jenisPermintaan"
                          label="Jenis Permintaan"
                          arrData={listJenisPermintaan}
                          isRequired
                          isDisabled={isDisabled}
                          value={formDataRef.current.jenisPermintaan}
                          onChange={handleInputChange}
                          errorMessage={errors.jenisPermintaan}
                        />
                      </div>
                      <div
                        className="col-lg-3 visually-hidden"
                        id="divJenisKomersial"
                      >
                        <DropDown
                          forInput="jenisKomersial"
                          label="Jenis Komersial"
                          arrData={listJenisKomersial}
                          isRequired
                          isDisabled={isDisabled}
                          value={formDataRef.current.jenisKomersial}
                          onChange={handleInputChange}
                          errorMessage={errors.jenisKomersial}
                        />
                      </div>
                      <div className="col-lg-6">
                        <Input
                          type="textarea"
                          forInput="keterangan"
                          label="Keterangan/Deskripsi Pekerjaan"
                          isDisabled={isDisabled}
                          value={formDataRef.current.keterangan}
                          onChange={handleInputChange}
                          errorMessage={errors.keterangan}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3">
                        <Input
                          type="text"
                          forInput="kontakPelanggan"
                          label="Kontak Pelanggan (PIC)"
                          isRequired
                          isDisabled={isDisabled}
                          value={formDataRef.current.kontakPelanggan}
                          onChange={handleInputChange}
                          errorMessage={errors.kontakPelanggan}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Input
                          type="text"
                          forInput="noHPPelanggan"
                          label="Nomor HP Pelanggan (PIC)"
                          isRequired
                          isDisabled={isDisabled}
                          value={formDataRef.current.noHPPelanggan}
                          onChange={handleInputChange}
                          errorMessage={errors.noHPPelanggan}
                        />
                      </div>
                      <div className="col-lg-3">
                        <Input
                          type="text"
                          forInput="emailPelanggan"
                          label="Email Pelanggan (PIC)"
                          isRequired
                          isDisabled={isDisabled}
                          value={formDataRef.current.emailPelanggan}
                          onChange={handleInputChange}
                          errorMessage={errors.emailPelanggan}
                          placeholder="Untuk pengiriman dokumen penawaran"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Data Berkas Pendukung
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-4">
                        <FileUpload
                          forInput="berkasPenawaran"
                          label="Berkas Permintaan (.jpg, .png, .pdf, .zip)"
                          isDisabled={isDisabled}
                          formatFile=".jpg,.png,.pdf,.zip"
                          ref={filePenawaranRef}
                          onChange={() =>
                            handleFileChange(
                              filePenawaranRef,
                              "jpg,png,pdf,zip"
                            )
                          }
                          errorMessage={errors.berkasPenawaran}
                          hasExisting={formDataRef.current.berkasPenawaran}
                        />
                      </div>
                      <div className="col-lg-4">
                        <FileUpload
                          forInput="berkasGambar"
                          label="Berkas Gambar (.jpg, .png, .pdf, .zip)"
                          isDisabled={isDisabled}
                          formatFile=".jpg,.png,.pdf,.zip"
                          ref={fileGambarRef}
                          onChange={() =>
                            handleFileChange(fileGambarRef, "jpg,png,pdf,zip")
                          }
                          errorMessage={errors.berkasGambar}
                          hasExisting={formDataRef.current.berkasGambar}
                        />
                      </div>
                      <div className="col-lg-4">
                        <FileUpload
                          forInput="berkasLainnya"
                          label="Berkas Lainnya (.jpg, .png, .pdf, .zip)"
                          isDisabled={isDisabled}
                          formatFile=".jpg,.png,.pdf,.zip"
                          ref={fileLainRef}
                          onChange={() =>
                            handleFileChange(fileLainRef, "jpg,png,pdf,zip")
                          }
                          errorMessage={errors.berkasLainnya}
                          hasExisting={formDataRef.current.berkasLainnya}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Daftar Permintaan Produk/Jasa
                  </div>
                  <div className="card-body p-4">
                    <div
                      className={"row" + (isDisabled ? " visually-hidden" : "")}
                    >
                      <div className="col-lg-4">
                        <DropDown
                          forInput="namaProduk"
                          label="Nama Produk/Jasa"
                          isDisabled={isDisabled}
                          showLabel={false}
                          arrData={listProduk}
                          ref={namaProdukRef}
                        />
                      </div>
                      <div className="col-lg-4 pb-2">
                        <Input
                          forInput="catatanProduk"
                          isDisabled={isDisabled}
                          ref={catatanProdukRef}
                          placeholder="Catatan atau revisi minor"
                        />
                      </div>
                      <div className="col-lg-2 pb-2">
                        <Input
                          type="number"
                          forInput="jumlahProduk"
                          isDisabled={isDisabled}
                          ref={jumlahProdukRef}
                          placeholder="Jumlah"
                        />
                      </div>
                      <div className="col-lg-2 pb-2">
                        <Button
                          classType="success w-100"
                          iconName="add"
                          label="TAMBAH"
                          isDisabled={isDisabled}
                          onClick={handleAddProduk}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div
                        className={
                          "col-lg-12" + (!isDisabled ? " visually-hidden" : "")
                        }
                      >
                        <div className="px-3 py-2 bg-info-subtle border-start border-5 border-info mb-3 fw-bold">
                          Segala diskusi terkait persetujuan atau penolakan
                          terhadap permintaan pelanggan ini dilakukan di luar
                          sistem. Sistem hanya menerima keputusan yang bersifat
                          final.
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <Table
                          data={dataProduk}
                          onDelete={handleDeleteProduk}
                          onUpload={handleUploadGambarValidasi}
                          onApprove={handleApproveProduk}
                          onReject={handleRejectProduk}
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
