import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import { formatDate } from "../../util/Formatting";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import SweetAlert from "../../util/SweetAlert";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "No. Registrasi SPK": null,
    "No. Registrasi Permintaan": null,
    "Nama Pelanggan": null,
    "Target Pengiriman": null,
    "Tanggal Buat": null,
    "Waktu Lihat PPIC": null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  {
    Value: "[Tanggal Buat2] asc",
    Text: "No. Registrasi SPK [↑]",
  },
  {
    Value: "[Tanggal Buat2] desc",
    Text: "No. Registrasi SPK [↓]",
  },
  { Value: "[Nama Pelanggan] asc", Text: "Nama Pelanggan [↑]" },
  { Value: "[Nama Pelanggan] desc", Text: "Nama Pelanggan [↓]" },
  { Value: "[Target Pengiriman] asc", Text: "Target Pengiriman [↑]" },
  { Value: "[Target Pengiriman] desc", Text: "Target Pengiriman [↓]" },
];

const dataFilterStatus = [
  { Value: "Draft", Text: "Draft" },
  { Value: "Terkirim", Text: "Terkirim" },
  { Value: "Dalam Proses Produksi", Text: "Dalam Proses Produksi" },
  { Value: "Selesai", Text: "Selesai" },
];

export default function SuratPerintahKerjaIndex({ onChangePage }) {
  const role = JSON.parse(decryptId(Cookies.get("activeUser"))).role;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Tanggal Buat2] desc",
    status: "",
    role: role,
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
        status: searchFilterStatus.current.value,
      };
    });
  }

  async function handleSent(id) {
    const result = await SweetAlert(
      "Kirim Surat Perintah Kerja ke bagian Engineering, PPIC, dan Direktur Produksi",
      "Nomor registrasi surat perintah kerja akan dibentuk dan data surat perintah kerja ini tidak dapat diubah lagi oleh bagian Marketing. Apakah Anda yakin ingin mengirim data surat perintah kerja ini ke bagian engineering, PPIC, dan direktur produksi?",
      "info",
      "Ya, saya yakin!"
    );

    if (result) {
      setIsLoading(true);
      setIsError(false);
      UseFetch(API_LINK + "SuratPerintahKerja/SentSuratPerintahKerja", {
        idSPK: id,
      })
        .then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          else {
            SweetAlert(
              "Sukses",
              "Data surat perintah kerja berhasil dikirim",
              "success"
            );
            handleSetCurrentPage(currentFilter.page);
          }
        })
        .then(() => setIsLoading(false));
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "SuratPerintahKerja/GetDataSuratPerintahKerja",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            "Target Pengiriman": formatDate(value["Target Pengiriman"], true),
            "Waktu Lihat PPIC": value["Waktu Lihat PPIC"]
              ? formatDate(value["Waktu Lihat PPIC"], false)
              : "-",
            "Tanggal Buat": formatDate(value["Tanggal Buat"], true),
            Aksi: [
              "Detail",
              ["Draft"].includes(value["Status"]) ? "Edit" : "",
              ["Draft"].includes(value["Status"]) ? "Sent" : "",
            ],
            Alignment: [
              "center",
              "center",
              "center",
              "left",
              "center",
              "center",
              "center",
              "center",
              "center",
            ],
          }));
          setCurrentData(formattedData);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data surat perintah kerja."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            {role === "ROL17" && (
              <Button
                iconName="add"
                classType="success"
                label="Tambah"
                onClick={() => onChangePage("add")}
              />
            )}
            <Input
              ref={searchQuery}
              forInput="pencarianSuratPerintahKerja"
              placeholder="Cari"
            />
            <Button
              iconName="search"
              classType="primary px-4"
              title="Cari"
              onClick={handleSearch}
            />
            <Filter>
              <DropDown
                ref={searchFilterSort}
                forInput="ddUrut"
                label="Urut Berdasarkan"
                type="none"
                arrData={dataFilterSort}
                defaultValue="[Tanggal Buat2] desc"
              />
              <DropDown
                ref={searchFilterStatus}
                forInput="ddStatus"
                label="Status"
                type="semua"
                arrData={dataFilterStatus}
                defaultValue=""
              />
            </Filter>
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table
                data={currentData}
                onDetail={onChangePage}
                onEdit={onChangePage}
                onSent={handleSent}
              />
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData[0]["Count"]}
                navigation={handleSetCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
