import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import Swal from "sweetalert2";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
<<<<<<< HEAD
<<<<<<<< HEAD:monitoring-app/src/component/page/transaksi-korektif-pic/Index.jsx
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
========
import Swal from "sweetalert2";
>>>>>>>> Commit-All:monitoring-app/src/component/page/laporan-kerusakan-admin/Index.jsx
=======
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
>>>>>>> Commit-All

const inisialisasiData = [
  {
    Key: null,
    No: null,
    // "Nama Mesin": null,
    "Tanggal Pengajuan": null,
    Tindakan: null,
    "Dibuat Oleh": null,
    Status: null,
    Aksi: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[kor_tanggal_pengajuan] asc", Text: "Tanggal Pengajuan [↑]" },
  { Value: "[kor_tanggal_pengajuan] desc", Text: "Tanggal Pengajuan [↓]" },
];

const dataFilterStatus = [
  { Value: "Pending", Text: "Pending" },
  { Value: "dikerjakan", Text: "Dalam Pengerjaan" },
  { Value: "selesai", Text: "Selesai" },
  { Value: "batal", Text: "Batal" },
];

<<<<<<< HEAD
<<<<<<<< HEAD:monitoring-app/src/component/page/transaksi-korektif-pic/Index.jsx
=======
>>>>>>> Commit-All
export default function JadwalPerawatan({ onChangePage }) {
  const getUserInfo = () => {
    const encryptedUser = Cookies.get("activeUser");
    if (encryptedUser) {
      try {
        const userInfo = JSON.parse(decryptId(encryptedUser));
        return userInfo;
      } catch (error) {
        console.error("Failed to decrypt user info:", error);
        return null;
      }
    }
    return null;
  };
  const userInfo = getUserInfo();
  const upt = userInfo.upt;
<<<<<<< HEAD
========
export default function IndexLaporanKerusakan({ onChangePage }) {
>>>>>>>> Commit-All:monitoring-app/src/component/page/laporan-kerusakan-admin/Index.jsx
=======

>>>>>>> Commit-All
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
<<<<<<< HEAD
    query: upt,
    sort: "[kor_tanggal_pengajuan] asc",
    status: "Pending",
    itemPerPage: 10,
=======
    query: '',
    sort: "[kor_tanggal_pengajuan] asc",
    status: "",
    itemPerPage: 10,
    p6: upt
>>>>>>> Commit-All
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

  function formatDate(dateString, format) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    switch (format) {
      case "DD/MM/YYYY":
        return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(
          2,
          "0"
        )}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
      case "D MMMM YYYY":
        return `${day} ${months[month]} ${year}`;
      default:
        return dateString;
    }
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

  function handleSetStatus(id) {
    setIsLoading(true);
    setIsError(false);
    UseFetch(API_LINK + "MasterSparepart/SetStatusSparepart", {
      idSparepart: id,
    })
      .then((data) => {
        if (data === "ERROR" || data.length === 0) setIsError(true);
        else {
          Swal.fire(
            "Sukses",
            "Status data Sparepart berhasil diubah menjadi " + data[0].Status,
            "success"
          );
          handleSetCurrentPage(currentFilter.page);
        }
      })
      .then(() => setIsLoading(false));
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
<<<<<<< HEAD
          API_LINK + "Korektif/GetDataPerawatanKorektif",
=======
          API_LINK + "Korektif/GetDataPerawatanKorektifPIC",
>>>>>>> Commit-All
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
<<<<<<< HEAD
          console.log(data);
          const formattedData = data.map((value) => {
<<<<<<<< HEAD:monitoring-app/src/component/page/transaksi-korektif-pic/Index.jsx
=======
          const formattedData = data.map((value) => {
>>>>>>> Commit-All
            const {
              ["Tanggal Perawatan"]: jadwal,
              ["Tanggal Pengajuan"]: pengajuan,
              ["Status Pemeliharaan"]: status,
              ...rest
            } = value;
            return {
              ...rest,
              "Tanggal Penjadwalan": jadwal
                ? formatDate(jadwal, "D MMMM YYYY")
                : "Jadwal belum di buat",
              "Tanggal Pengajuan": pengajuan
                ? formatDate(pengajuan, "D MMMM YYYY")
                : "-",
              "Status Pemeliharaan": status ? status : "-",
              Aksi: ["Detail"], // Tombol aksi, bisa disesuaikan dengan tombol yang ada
              Alignment: [
                "center",
                "center",
                "left",
                "left",
                "left",
                "center",
                "center",
                "center",
                "center",
<<<<<<< HEAD
              ],
========
            const { ["Tanggal Pengajuan"]: kor_tanggal_pengajuan, ["Status Pemeliharaan"]:Status, Dibuat, TindakanPerbaikan, kor_sparepart_diganti, mes_id_mesin,["Tanggal Perawatan"]: Tanggal_Perawatan, ...rest } = value;
            return {
              ...rest,
              "Tanggal Pengajuan": kor_tanggal_pengajuan != "" ? formatDate(kor_tanggal_pengajuan, "D MMMM YYYY") : "-",
              "Dibuat Oleh": Dibuat || "-",  // Pembuat data
              "Status Pemeliharaan": Status,
              Aksi: ["Detail"],  // Tombol aksi, bisa disesuaikan dengan tombol yang ada
              Alignment: ["center", "center", "center", "left", "left", "LEFT", "center", "left","center","center"]
>>>>>>>> Commit-All:monitoring-app/src/component/page/laporan-kerusakan-admin/Index.jsx
            };
          });
          setCurrentData(formattedData);
          console.log("noih",formattedData);
        }
      } catch (error) {
        setIsError(true);
        console.log("Format Data Error: " + error);
=======
                "center",
                "center",
              ],
            };
          });
          setCurrentData(formattedData);
        }
      } catch (error) {
        setIsError(true);
>>>>>>> Commit-All
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  return (
    <div className="d-flex flex-column">
      {isError && (
        <div className="flex-fill">
          <Alert
            type="warning"
            message="Terjadi kesalahan: Gagal mengambil data Perawatan Korektif."
          />
        </div>
      )}
<<<<<<< HEAD
      <div className="flex-fill">
        <div className="input-group">
<<<<<<<< HEAD:monitoring-app/src/component/page/transaksi-korektif-pic/Index.jsx
          <Button
            iconName="add"
            classType="success"
            label="Buat Laporan Kerusakan"
            onClick={() => onChangePage("add")}
          />
========
>>>>>>>> Commit-All:monitoring-app/src/component/page/laporan-kerusakan-admin/Index.jsx
          <Input
            ref={searchQuery}
            forInput="pencarianPerawatanKorektif"
            placeholder="Cari berdasarkan Nama Mesin, Tanggal Pengajuan format ( YYYY-MM-DD ), atau Kerusakan"
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
              defaultValue="[kor_tanggal_pengajuan] asc"
            />
            <DropDown
              ref={searchFilterStatus}
              forInput="ddStatus"
              label="Status"
              type="none"
              arrData={dataFilterStatus}
              defaultValue="Pending"
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
              onToggle={handleSetStatus}
              onDetail={onChangePage}
              onEdit={onChangePage}
            />
            <Paging
              pageSize={PAGE_SIZE}
              pageCurrent={currentFilter.page}
              totalData={currentData[0]["Count"]}
              navigation={handleSetCurrentPage}
            />
          </div>
        )}
=======
      <div className="card">
        <div className="card-header bg-primary lead fw-medium text-white">
          Perawatan Korektif
        </div>
        <div className="card-body p-4">
          <div className="flex-fill">
            <div className="input-group">
              <Button
                iconName="add"
                classType="success"
                label="Buat Laporan Kerusakan"
                onClick={() => onChangePage("add")}
              />
              <Input
                ref={searchQuery}
                forInput="pencarianPerawatanKorektif"
                placeholder="Cari berdasarkan Nama Mesin, Tanggal Pengajuan format ( YYYY-MM-DD ), atau Kerusakan"
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
                  defaultValue="[kor_tanggal_pengajuan] asc"
                />
                <DropDown
                  ref={searchFilterStatus}
                  forInput="ddStatus"
                  label="Status"
                  type="none"
                  arrData={dataFilterStatus}
                  defaultValue="Pending"
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
                  onToggle={handleSetStatus}
                  onDetail={onChangePage}
                  onEdit={onChangePage}
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
>>>>>>> Commit-All
      </div>
    </div>
  );
}
