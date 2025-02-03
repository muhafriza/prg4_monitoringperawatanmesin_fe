import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import { PAGE_SIZE, FILE_LINK, API_LINK } from "../../util/Constants";
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
import Icon from "../../part/Icon";
import Swal from "sweetalert2";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "No. Registrasi Penawaran": null,
    "No. Registrasi Permintaan": null,
    "Nama Pelanggan": null,
    "Persetujuan Pelanggan": null,
    "Tanggal Buat": null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  {
    Value: "[Tanggal Buat2] asc",
    Text: "No. Registrasi Penawaran [↑]",
  },
  {
    Value: "[Tanggal Buat2] desc",
    Text: "No. Registrasi Penawaran [↓]",
  },
  { Value: "[Nama Pelanggan] asc", Text: "Nama Pelanggan [↑]" },
  { Value: "[Nama Pelanggan] desc", Text: "Nama Pelanggan [↓]" },
];

const dataFilterStatus = [
  { Value: "Draft", Text: "Draft" },
  { Value: "Dalam Proses Negosiasi", Text: "Dalam Proses Negosiasi" },
  { Value: "Disetujui", Text: "Disetujui" },
  { Value: "Batal", Text: "Batal" },
];

export default function SuratPenawaranIndex({ onChangePage }) {
  const role = JSON.parse(decryptId(Cookies.get("activeUser"))).role;
  const [isError, setIsError] = useState({ error: false, message: "" });
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

  async function handlePrint(id) {
    setIsError((prevError) => ({ ...prevError, error: false }));
    setIsLoading(true);

    try {
      const data = await UseFetch(
        API_LINK + "SuratPenawaran/PrintSuratPenawaran",
        { idPenawaran: id }
      );

      if (data === "ERROR" || data.length === 0) {
        throw new Error("Terjadi kesalahan: Gagal mencetak surat penawaran.");
      } else {
        handleSetCurrentPage(currentFilter.page);
        window.open(FILE_LINK + data.Hasil, "_blank");
      }
    } catch (error) {
      window.scrollTo(0, 0);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setIsLoading(false);
    }
  }

  async function handleApprove(id) {
    setIsError((prevError) => ({ ...prevError, error: false }));
    setIsLoading(true);

    try {
      const data = await UseFetch(
        API_LINK + "SuratPenawaran/CheckPrintSuratPenawaran",
        { idPenawaran: id }
      );

      if (data === "ERROR" || data.length === 0) {
        throw new Error(
          "Terjadi kesalahan: Gagal memeriksa status cetak surat penawaran."
        );
      } else if (data[0].hasil === "OK") {
        onChangePage("konfirmasi", id);
      } else {
        throw new Error(
          "Terjadi kesalahan: Pastikan surat penawaran sudah dicetak terlebih dahulu."
        );
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

  async function handleSent(id) {
    const result = await SweetAlert(
      "Kirim Surat Penawaran ke Pelanggan",
      "Pastikan untuk meninjau surat penawaran terlebih dahulu dengan menekan tombol cetak di kolom Aksi. Surat yang sudah terkirim tidak dapat dikembalikan. Apakah Anda yakin ingin mengirim surat penawaran kepada pelanggan?",
      "info",
      "Ya, saya yakin!"
    );

    if (result) {
      setIsError((prevError) => ({ ...prevError, error: false }));
      setIsLoading(true);

      try {
        const data = await UseFetch(
          API_LINK + "SuratPenawaran/CheckPrintSuratPenawaran",
          { idPenawaran: id }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal memeriksa status cetak surat penawaran."
          );
        } else if (data[0].hasil === "OK") {
          const data2 = await UseFetch(
            API_LINK + "SuratPenawaran/SentSuratPenawaran",
            { idPenawaran: id }
          );

          if (data2 === "ERROR" || data2.length === 0) {
            throw new Error(
              "Terjadi kesalahan: Gagal mengambil data surat penawaran."
            );
          } else {
            Swal.fire(
              "Sukses",
              "Surat penawaran berhasil dikirim kepada pelanggan",
              "success"
            );
            handleSetCurrentPage(currentFilter.page);
          }
        } else {
          throw new Error(
            "Terjadi kesalahan: Pastikan surat penawaran sudah dicetak terlebih dahulu."
          );
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
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "SuratPenawaran/GetDataSuratPenawaran",
          currentFilter
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data surat penawaran."
          );
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            "Tanggal Buat": formatDate(value["Tanggal Buat"], true),
            "Persetujuan Pelanggan":
              value["Persetujuan Pelanggan"] &&
              ["Disetujui"].includes(value["Status"]) ? (
                <>
                  <Icon
                    name="hexagon-check"
                    type="Bold"
                    cssClass="text-success me-2"
                  />
                  Disetujui
                  <br />
                  Tanggal PO:{" "}
                  {formatDate(
                    value["Persetujuan Pelanggan"].split("#")[1],
                    true
                  )}
                </>
              ) : (
                "-"
              ),
            Aksi: [
              "Detail",
              ["Draft", "Dalam Proses Negosiasi"].includes(value["Status"])
                ? "Edit"
                : "",
              ["Draft", "Dalam Proses Negosiasi"].includes(value["Status"])
                ? "Print"
                : "",
              ["Dalam Proses Negosiasi"].includes(value["Status"])
                ? "Sent"
                : "",
              ["Dalam Proses Negosiasi"].includes(value["Status"])
                ? "Approve"
                : "",
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
            ],
          }));
          setCurrentData(formattedData);
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
  }, [currentFilter]);

  return (
    <>
      <div className="d-flex flex-column">
        {isError.error && (
          <div className="flex-fill">
            <Alert type="warning" message={isError.message} />
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
              forInput="pencarianSuratPenawaran"
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
                onPrint={handlePrint}
                onSent={handleSent}
                onApprove={handleApprove}
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
