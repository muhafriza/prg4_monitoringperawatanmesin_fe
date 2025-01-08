import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function BerandaIndex() {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    countTotalPermintaan: 0,
    countTerlambat: 0,
    countBatal: 0,
    countSelesai: 0,
    countMenungguAnalisa: 0,
    countBelumDibuatRAK: 0,
    countBelumDibuatPenawaran: 0,
    countDalamProsesNegosiasi: 0,
    countBelumDibuatSPK: 0,
    countDalamProsesProduksi: 0,
    countDalamProsesQC: 0,
    countDalamProsesDelivery: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "Utilities/GetDataCountingDashboard",
          {}
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data dashboard.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
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

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card">
        <div className="card-header bg-warning text-white p-4">
          <span className="lead fw-medium">
            Selamat Datang di Sistem Monitoring Proses Perawatan Mesin
          </span>
        </div>
        <div className="card-body lead p-4">
          Sistem Informasi Produksi ini akan membantu Anda dalam mengelola
          proses produksi dengan lebih efisien.
          <br />
          Mari mulai dengan mengeksplorasi fitur-fitur yang ada dengan mengakses
          menu yang tersedia.
        </div>
      </div>
      <div className="row mx-0 my-2">
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Total Permintaan Pelanggan</div>
              <div className="h1">
                {formDataRef.current.countTotalPermintaan}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-dark-subtle bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Terlambat (In Progress)</div>
              <div className="h1">{formDataRef.current.countTerlambat}</div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-danger bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Batal</div>
              <div className="h1">{formDataRef.current.countBatal}</div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-dark-subtle bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Selesai (In Progress)</div>
              <div className="h1">{formDataRef.current.countSelesai}</div>
            </div>
          </div>
        </div>
        <div className="col-lg-12">
          <div className="pt-3">
            <hr />
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">
                Menunggu Analisa Engineering/PPIC
              </div>
              <div className="h1">
                {formDataRef.current.countMenungguAnalisa}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Belum Dibuat RAK</div>
              <div className="h1">
                {formDataRef.current.countBelumDibuatRAK}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Belum Dibuat Penawaran</div>
              <div className="h1">
                {formDataRef.current.countBelumDibuatPenawaran}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Dalam Proses Negosiasi</div>
              <div className="h1">
                {formDataRef.current.countDalamProsesNegosiasi}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Belum Dibuat SPK</div>
              <div className="h1">
                {formDataRef.current.countBelumDibuatSPK}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-primary bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">Dalam Proses Produksi</div>
              <div className="h1">
                {formDataRef.current.countDalamProsesProduksi}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-dark-subtle bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">
                Dalam Proses QC (In Progress)
              </div>
              <div className="h1">{formDataRef.current.countDalamProsesQC}</div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card mt-3 border-0">
            <div className="card-body bg-dark-subtle bg-gradient rounded-2 text-white">
              <div className="lead fw-medium">
                Dalam Proses Delivery (In Progress)
              </div>
              <div className="h1">
                {formDataRef.current.countDalamProsesDelivery}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
