import { useRef, useState, useEffect } from "react";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Label from "../../part/Label";
import Button from "../../part/Button";
import Icon from "../../part/Icon";
import { formatDate } from "../../util/Formatting";

export default function MasterPeriodDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    perId: "",
    perAwal: "",
    perAkhir: "",
    perPeriode: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(API_LINK + "MasterPeriod/GetPeriodById", {
          id: withID,
        });

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data periode."
          );
        } else {
          // Format data dengan tanggal yang sudah diformat
          const formattedData = {
            ...data[0],
            perAwal: data[0].perAwal 
              ? formatDate(data[0].perAwal.split("T")[0], true) 
              : data[0].perAwal,
            perAkhir: data[0].perAkhir 
              ? formatDate(data[0].perAkhir.split("T")[0], true) 
              : data[0].perAkhir
          };
          
          formDataRef.current = { ...formDataRef.current, ...formattedData };
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
  }, [withID]);

  return (
    <>

      <div className="mt-3">
        {isError.error && (
          <div className="flex-fill ">
            <Alert
              type="danger"
              message={isError.message}
              handleClose={() => setIsError({ error: false, message: "" })}
            />
          </div>
        )}
        <div className="card">
          <div className="card-header bg-primary lead fw-medium text-white">
          Detail Data Periode
        </div>

          <div className="card-body p-4">
            {isLoading ? (
              <Loading />
            ) : (
              <div className="row">
                <div className="col-lg-4">
                  <Label
                    forLabel="perAwal"
                    title="Activity Start Date"
                    data={formDataRef.current.perAwal}
                  />
                </div>
                <div className="col-lg-4">
                  <Label
                    forLabel="perAkhir"
                    title="Activity End Date"
                    data={formDataRef.current.perAkhir}
                  />
                </div>
                <div className="col-lg-4">
                  <Label
                    forLabel="perPeriode"
                    title="Period"
                    data={formDataRef.current.perPeriode}
                  />
                </div>
              </div>
            )}
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