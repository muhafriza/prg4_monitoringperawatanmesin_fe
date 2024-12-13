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
import Icon from "../../part/Icon";
import SweetAlert from "../../util/SweetAlert";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "No. Registrasi RAK": null,
    "No. Registrasi Permintaan": null,
    "Nama Pelanggan": null,
    "Persetujuan Marketing": null,
    "Persetujuan Dir. Produksi": null,
    "Tanggal Buat": null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  {
    Value: "[Tanggal Buat2] asc",
    Text: "No. Registrasi RAK [↑]",
  },
  {
    Value: "[Tanggal Buat2] desc",
    Text: "No. Registrasi RAK [↓]",
  },
  { Value: "[Nama Pelanggan] asc", Text: "Nama Pelanggan [↑]" },
  { Value: "[Nama Pelanggan] desc", Text: "Nama Pelanggan [↓]" },
];

const dataFilterStatus = [
  { Value: "Draft", Text: "Draft" },
  {
    Value: "Menunggu Persetujuan Marketing",
    Text: "Menunggu Persetujuan Marketing",
  },
  {
    Value: "Menunggu Persetujuan Dir. Produksi",
    Text: "Menunggu Persetujuan Dir. Produksi",
  },
  { Value: "Disetujui", Text: "Disetujui" },
  { Value: "Revisi", Text: "Revisi" },
  { Value: "Batal", Text: "Batal" },
];

export default function RencanaAnggaranKegiatanIndex({ onChangePage }) {
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
      "Kirim Rencana Anggaran Kegiatan ke Marketing/Direktur Produksi (Tergantung Nominal)",
      "Nomor registrasi rencana anggaran kegiatan akan dibentuk dan data rencana anggaran kegiatan ini tidak dapat diubah lagi oleh bagian Marketing. Apakah Anda yakin ingin mengirim data rencana anggaran kegiatan ini ke bagian marketing atau direktur produksi (tergantung nominal) untuk dilakukan persetujuan?",
      "info",
      "Ya, saya yakin!"
    );

    if (result) {
      setIsLoading(true);
      setIsError(false);
      UseFetch(
        API_LINK + "RencanaAnggaranKegiatan/SentRencanaAnggaranKegiatan",
        {
          idRAK: id,
        }
      )
        .then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          else {
            SweetAlert(
              "Sukses",
              "Data rencana anggaran kegiatan berhasil dikirim",
              "success"
            );
            handleSetCurrentPage(currentFilter.page);
          }
        })
        .then(() => setIsLoading(false));
    }
  }

  async function handleApprove(id) {
    const result = await SweetAlert(
      "Setujui Rencana Anggaran Kegiatan",
      "Pastikan bahwa rencana anggaran kegiatan ini telah dianalisis dengan baik dan telah menyatakan kesanggupannya. Apakah Anda yakin ingin menyetujui rencana anggaran kegiatan ini?",
      "info",
      "Ya, saya yakin!"
    );

    try {
      if (result) {
        setIsLoading(true);
        setIsError(false);

        const data = await UseFetch(
          API_LINK + "RencanaAnggaranKegiatan/ApproveRencanaAnggaranKegiatan",
          {
            idRAK: id,
          }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal menyetujui rencana anggaran kegiatan."
          );
        } else {
          SweetAlert(
            "Sukses",
            "Rencana anggaran kegiatan berhasil disetujui",
            "success"
          );
          handleSetCurrentPage(currentFilter.page);
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

  async function handleReject(id) {
    const result = await SweetAlert(
      "Tolak Rencana Anggaran Kegiatan",
      "Rencana anggaran kegiatan yang ditolak akan dikirimkan kembali ke bagian Marketing untuk direvisi. Apakah Anda yakin ingin menolak rencana anggaran kegiatan ini?",
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
          API_LINK + "RencanaAnggaranKegiatan/RejectRencanaAnggaranKegiatan",
          {
            idRAK: id,
            alasanTolak: result,
          }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal menolak rencana anggaran kegiatan."
          );
        } else {
          SweetAlert(
            "Sukses",
            "Rencana anggaran kegiatan berhasil ditolak",
            "success"
          );
          handleSetCurrentPage(currentFilter.page);
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

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "RencanaAnggaranKegiatan/GetDataRencanaAnggaranKegiatan",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            "Tanggal Buat": formatDate(value["Tanggal Buat"], true),
            "Persetujuan Marketing":
              value["Persetujuan Marketing"] &&
              ["Disetujui", "Revisi"].includes(value["Status"]) ? (
                <>
                  {value["Status"] === "Disetujui" &&
                  !value["Persetujuan Marketing"]
                    .split("#")[0]
                    .includes("DIR$$") ? (
                    <>
                      <Icon
                        name="hexagon-check"
                        type="Bold"
                        cssClass="text-success me-2"
                      />
                      Disetujui
                    </>
                  ) : value["Persetujuan Marketing"]
                      .split("#")[0]
                      .includes("MARKETING$$") ? (
                    <>
                      <Icon
                        name="times-hexagon"
                        type="Bold"
                        cssClass="text-danger me-2"
                      />
                      Ditolak
                      <br />
                      <span className="fst-italic">
                        "
                        {value["Persetujuan Marketing"]
                          .split("#")[0]
                          .replace("MARKETING$$", "")}
                        "
                      </span>
                    </>
                  ) : (
                    "-"
                  )}
                  {value["Status"] === "Disetujui" &&
                  !value["Persetujuan Marketing"]
                    .split("#")[0]
                    .includes("DIR$$") ? (
                    <>
                      <br />
                      {value["Persetujuan Marketing"].split("#")[0]}
                      <br />
                      {formatDate(value["Persetujuan Marketing"].split("#")[1])}
                    </>
                  ) : (
                    ""
                  )}
                </>
              ) : (
                "-"
              ),
            "Persetujuan Dir. Produksi":
              value["Persetujuan Dir. Produksi"] &&
              ["Disetujui", "Revisi"].includes(value["Status"]) ? (
                <>
                  {value["Status"] === "Disetujui" &&
                  !value["Persetujuan Dir. Produksi"]
                    .split("#")[0]
                    .includes("MARKETING$$") ? (
                    <>
                      <Icon
                        name="hexagon-check"
                        type="Bold"
                        cssClass="text-success me-2"
                      />
                      Disetujui
                    </>
                  ) : value["Persetujuan Dir. Produksi"]
                      .split("#")[0]
                      .includes("DIR$$") ? (
                    <>
                      <Icon
                        name="times-hexagon"
                        type="Bold"
                        cssClass="text-danger me-2"
                      />
                      Ditolak
                      <br />
                      <span className="fst-italic">
                        "
                        {value["Persetujuan Dir. Produksi"]
                          .split("#")[0]
                          .replace("DIR$$", "")}
                        "
                      </span>
                    </>
                  ) : (
                    "-"
                  )}
                  {value["Status"] === "Disetujui" &&
                  !value["Persetujuan Dir. Produksi"]
                    .split("#")[0]
                    .includes("MARKETING$$") ? (
                    <>
                      <br />
                      {value["Persetujuan Dir. Produksi"].split("#")[0]}
                      <br />
                      {formatDate(
                        value["Persetujuan Dir. Produksi"].split("#")[1]
                      )}
                    </>
                  ) : (
                    ""
                  )}
                </>
              ) : (
                "-"
              ),
            Aksi: [
              "Detail",
              ["Draft", "Revisi"].includes(value["Status"]) ? "Edit" : "",
              ["Draft", "Revisi"].includes(value["Status"]) ? "Sent" : "",
              role === "ROL17" &&
              ["Menunggu Persetujuan Marketing"].includes(value["Status"])
                ? "Approve"
                : "",
              role === "ROL17" &&
              ["Menunggu Persetujuan Marketing"].includes(value["Status"])
                ? "Reject"
                : "",
              role === "ROL51" &&
              ["Menunggu Persetujuan Dir. Produksi"].includes(value["Status"])
                ? "Approve"
                : "",
              role === "ROL51" &&
              ["Menunggu Persetujuan Dir. Produksi"].includes(value["Status"])
                ? "Reject"
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
              message="Terjadi kesalahan: Gagal mengambil data rencana anggaran kegiatan."
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
                onClick={() => onChangePage("add", { IDPermintaan: null })}
              />
            )}
            <Input
              ref={searchQuery}
              forInput="pencarianRencanaAnggaranKegiatan"
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
                onApprove={handleApprove}
                onReject={handleReject}
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
