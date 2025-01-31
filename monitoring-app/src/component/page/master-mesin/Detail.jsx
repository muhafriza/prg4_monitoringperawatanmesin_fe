import { useEffect, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterMesinDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  // Use state for the form data corresponding to pro_msmesin fields
  const [formData, setFormData] = useState({
    mes_id_mesin: "",
    mes_kondisi_operasional: "",
    mes_no_panel: "",
    mes_lab: "",
    mes_nama_mesin: "",
    mes_upt: "",
    mes_daya_mesin: 0,
    mes_jumlah: 0,
    mes_kapasitas: "",
    mes_tipe: "",
    mes_status: "",
    mes_created_by: "",
    mes_created_date: "",
    mes_modi_by: "",
    mes_modi_date: "",
    mes_gambar: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        // Call API to fetch the details of the machine
        const data = await UseFetch(API_LINK + "MasterMesin/DetailMesin", {
          id: withID, // Pass the machine ID to the API
        });

        if (data === "ERROR" || !data || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Mesin.");
        } else {
          // Update the formData state with the fetched data
          setFormData(data[0]); // Assuming data[0] contains the correct object with the machine details
        }
      } catch (error) {
        window.scrollTo(0, 0); // Scroll to top in case of error
        setIsError({
          error: true,
          message: error.message,
        });
      } finally {
        setIsLoading(false); // Set loading state to false once data is fetched
      }
    };

    fetchData(); // Call the fetchData function when component mounts or withID changes
  }, [withID]);

  if (isLoading) return <Loading />; // Show loading component while fetching data

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card">
        <div className="card-header bg-primary lead fw-medium text-white">
          Detail Data Mesin
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-md-4 mb-3">
              <Label
                forLabel="mes_gambar"
                title="Gambar Mesin"
                data={
                  formData.mes_gambar && formData.mes_gambar !== "" ? (
                    <img
                      src={FILE_LINK + formData.mes_gambar}
                      alt="Gambar Mesin"
                      className="img-fluid"
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "300px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      }}
                    />
                  ) : (
                    "-"
                  )
                }
              />
            </div>
            <div className="col-lg-8">
              <div className="row">
                <div className="col-lg-3">
                  <Label
                    forLabel="mes_id_mesin"
                    title="ID Mesin"
                    data={formData.mes_id_mesin}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="mes_kondisi_operasional"
                    title="Kondisi Operasional"
                    data={formData.mes_kondisi_operasional}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="mes_no_panel"
                    title="No. Panel"
                    data={formData.mes_no_panel}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="mes_lab"
                    title="Lab"
                    data={formData.mes_lab}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="mes_nama_mesin"
                    title="Nama Mesin"
                    data={formData.mes_nama_mesin}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="mes_upt"
                    title="UPT"
                    data={formData.mes_upt}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="mes_daya_mesin"
                    title="Daya Mesin"
                    data={formData.mes_daya_mesin}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="mes_jumlah"
                    title="Jumlah"
                    data={formData.mes_jumlah}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="mes_kapasitas"
                    title="Kapasitas"
                    data={formData.mes_kapasitas}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="mes_tipe"
                    title="Tipe"
                    data={formData.mes_tipe}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="mes_status"
                    title="Status"
                    data={formData.mes_status}
                  />
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
