import { useEffect, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterUserDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  // Use state instead of useRef for form data
  const [formData, setFormData] = useState({
    usr_id: "",
    rol_id: "",
    app_id: "",
    usr_status: "",
    usr_created_by: "",
    usr_created_date: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterUser/DetailUser",
          {
            id: withID,
          }
        );
        console.log(data);


        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data User.");
        } else {
          // Update state with the fetched data
          setFormData(data[0]); // Assuming data[0] is the correct object with the fields
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

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Detail Data User
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-3">
              <Label
                forLabel="namaKaryawan"
                title="Nama Karyawan"
                data={formData.namaKaryawan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="nik"
                title="NIK"
                data={formData.NIK}
              />
             </div>
            <div className="col-lg-6">
              <Label forLabel="tanggalLahir" title="Tanggal Lahir" data={formData.tanggalLahir} />
            </div>
            <div className="col-lg-6">
              <Label forLabel="notelp" title="NoTelp" data={formData.noTelp} />
            </div>
            <div className="col-lg-6">
              <Label forLabel="alamat" title="Alamat" data={formData.alamat} />
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
