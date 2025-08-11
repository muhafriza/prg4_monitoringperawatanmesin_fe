import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    kor_id_perawatan_korektif: null,
    mes_id_mesin: null,
    kor_tanggal_penjadwalan: null,
    kor_tanggal_aktual: null,
    kor_tanggal_pengajuan: null,
    kor_deskripsi_kerusakan: null,
    kor_tindakan_perbaikan: null,
    kor_sparepart_diganti: null,
    kor_status_pemeliharaan: 0,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[kor_tanggal_pengajuan] asc", Text: "Tanggal Pengajuan [↑]" },
  { Value: "[kor_tanggal_pengajuan] desc", Text: "Tanggal Pengajuan [↓]" },
  { Value: "[kor_tanggal_aktual] asc", Text: "Tanggal Aktual [↑]" },
  { Value: "[kor_tanggal_aktual] desc", Text: "Tanggal Aktual [↓]" },
];

const dataFilterStatus = [
  { Value: "0", Text: "Belum Selesai" },
  { Value: "1", Text: "Selesai" },
];

export default function KorektifTeknisi({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[kor_status_pemeliharaan] asc",
    status: "", // Default ke status "Belum Selesai"
    itemPerPage: 10,
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
      sort: searchFilterSort.current.value,
      status: searchFilterStatus.current.value,
    }));
  }

  function handleSetStatus(id) {
    setIsLoading(true);
    setIsError(false);
    UseFetch(API_LINK + "Korektif/GetDetailKorektif", {
      kor_id_perawatan_korektif: id,
    })
      .then((data) => {
        if (data === "ERROR" || data.length === 0) setIsError(true);
        else {
          SweetAlert(
            "Sukses",
            "Status berhasil diubah menjadi " +
              (data[0].kor_status_pemeliharaan === 1 ? "Selesai" : "Belum Selesai"),
            "success"
          );
          handleSetCurrentPage(currentFilter.page);
        }
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(
          API_LINK + "Korektif/DetailPerawatanKorektif",
          currentFilter
        );
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          console.log("Data from backend:", data);
          const formattedData = data.map((value, index) => {
            console.log(`Row ${index + 1} - Original status fields:`, {
              Status_Pemeliharaan: value.Status_Pemeliharaan,
              Status: value.Status,
              kor_status_pemeliharaan: value.kor_status_pemeliharaan,
              fullValue: value
            });
            
            let statusString = "Pending"; // Default
            if (value.Status_Pemeliharaan) {
              statusString = value.Status_Pemeliharaan;
            } else if (value.Status) {
              statusString = value.Status;
            } else if (value.kor_status_pemeliharaan === 1) {
              statusString = "Selesai";
            } else if (value.kor_status_pemeliharaan === 0) {
              statusString = "Pending";
            }
            
            console.log(`Row ${index + 1} - Final status:`, statusString);
            
            return {
              ...value,
              Status: statusString,
              Aksi: [ "Detail", "Edit"],
              Alignment: [
                "center",
                "center",
                "center",
                "center",
                "left",
                "left",
                "left",
                "left",
                "center",
                "center",
                "center",
              ],
              rowStyle: (() => {
                if (statusString === "Selesai") {
                  return { border: "3px solid #198754" };
                } else if (statusString === "Dalam Pengerjaan" || statusString === "Menunggu Perbaikan") {
                  return { border: "3px solid #ffc107" };
                } else if (statusString === "Tertunda" || statusString === "Batal" || statusString === "Pending") {
                  return { border: "3px solid #dc3545" };
                }
                return {};
              })(),
            };
          });
          console.log("Formatted data:", formattedData);
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
              message="Terjadi kesalahan: Gagal mengambil data Perawatan Korektif."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            <Input
              ref={searchQuery}
              forInput="pencarianPerawatan"
              placeholder="Cari Deskripsi Kerusakan"
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
                defaultValue="[kor_tanggal_penjadwalan] asc"
              />
              <DropDown
                ref={searchFilterStatus}
                forInput="ddStatus"
                label="Status"
                type="none"
                arrData={dataFilterStatus}
                defaultValue="0"
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
                onToggle={handleSetStatus}
                onDetail={onChangePage}
                onEdit={onChangePage}
                data={currentData.map(({ rowStyle, ...rest }) => rest)}
                rowStyles={(row, index) => currentData[index]?.rowStyle || {}}
                showStatusLegend={true}
                statusLegendContent={
                  <div className="mt-3">
                    <strong>Legend Status:</strong>
                    <ul className="mb-0">
                      <li><span className="badge bg-success">Selesai</span>: Perawatan sudah selesai dilakukan</li>
                      <li><span className="badge bg-warning text-dark">Dalam Pengerjaan</span>: Perawatan sedang berlangsung</li>
                      <li><span className="badge bg-danger">Tertunda</span>: Perawatan ditunda atau belum dimulai</li>
                      <li><span className="badge bg-secondary">Batal</span>: Perawatan dibatalkan</li>
                    </ul>
                    <div className="text-muted mt-2" style={{fontSize: '0.95em'}}>
                      * Klik ikon <i className="bi bi-pencil"></i> untuk mengedit data. <br/>
                      * Klik ikon <i className="bi bi-eye"></i> untuk melihat detail data. <br/>
                      * Status dan outline warna baris akan berubah otomatis sesuai progres perawatan.
                    </div>
                  </div>
                }
              />
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData[0]["Count"]}
                navigation={handleSetCurrentPage}
              />
              {/* Legend Status Manual */}
              <div className="mt-3">
                <strong>Legend Status:</strong>
                <ul className="mb-0">
                  <li><span className="badge bg-success">Selesai</span>: Perawatan sudah selesai dilakukan</li>
                  <li><span className="badge bg-warning text-dark">Dalam Pengerjaan</span>: Perawatan sedang berlangsung</li>
                  <li><span className="badge bg-danger">Tertunda</span>: Perawatan ditunda atau belum dimulai</li>
                  <li><span className="badge bg-secondary">Batal</span>: Perawatan dibatalkan</li>
                </ul>
                <div className="text-muted mt-2" style={{fontSize: '0.95em'}}>
                  * Klik ikon <i className="bi bi-pencil"></i> untuk mengedit data. <br/>
                  * Klik ikon <i className="bi bi-eye"></i> untuk melihat detail data. <br/>
                  * Status dan outline warna baris akan berubah otomatis sesuai progres perawatan.
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="d-flex flex-column">
            <Table
              onToggle={handleSetStatus}
              onDetail={onChangePage}
              onEdit={onChangePage}
              data={currentData.map(({ rowStyle, ...rest }) => rest)}
              rowStyles={(row, index) => currentData[index]?.rowStyle || {}}
              showStatusLegend={true}
              statusLegendContent={
                <div className="mt-3">
                  <strong>Legend Status:</strong>
                  <ul className="mb-0">
                    <li><span className="badge bg-success">Selesai</span>: Perawatan sudah selesai dilakukan</li>
                    <li><span className="badge bg-warning text-dark">Dalam Pengerjaan</span>: Perawatan sedang berlangsung</li>
                    <li><span className="badge bg-danger">Tertunda</span>: Perawatan ditunda atau belum dimulai</li>
                    <li><span className="badge bg-secondary">Batal</span>: Perawatan dibatalkan</li>
                  </ul>
                  <div className="text-muted mt-2" style={{fontSize: '0.95em'}}>
                    * Klik ikon <i className="bi bi-pencil"></i> untuk mengedit data. <br/>
                    * Klik ikon <i className="bi bi-eye"></i> untuk melihat detail data. <br/>
                    * Status dan outline warna baris akan berubah otomatis sesuai progres perawatan.
                  </div>
                </div>
              }
              />
            <Paging
              pageSize={PAGE_SIZE}
              pageCurrent={currentFilter.page}
              totalData={currentData[0]["Count"]}
              navigation={handleSetCurrentPage}
            />
            {/* Legend Status Manual untuk Tabel Kedua */}
            <div className="mt-3">
              <strong>Legend Status:</strong>
              <ul className="mb-0">
                <li><span className="badge bg-success">Selesai</span>: Perawatan sudah selesai dilakukan</li>
                <li><span className="badge bg-warning text-dark">Dalam Pengerjaan</span>: Perawatan sedang berlangsung</li>
                <li><span className="badge bg-danger">Tertunda</span>: Perawatan ditunda atau belum dimulai</li>
                <li><span className="badge bg-secondary">Batal</span>: Perawatan dibatalkan</li>
              </ul>
              <div className="text-muted mt-2" style={{fontSize: '0.95em'}}>
                * Klik ikon <i className="bi bi-pencil"></i> untuk mengedit data. <br/>
                * Klik ikon <i className="bi bi-eye"></i> untuk melihat detail data. <br/>
                * Status dan outline warna baris akan berubah otomatis sesuai progres perawatan.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
