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
    Nama_Depan: "",
    Nama_Belakang: "",
    Email: "",
    Nomor_HP: "",
    Alamat: "",
    Username: "",
    Jenis_Kelamin: "",
    Tempat_Lahir: "",
    Tanggal_Lahir: "",
    Status: "",
    Role: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));
      const key = withID;

      const username = key.split("_")[0];

      try {
        const data = await UseFetch(API_LINK + "MasterUser/DetailUser", {
          id: username,
        });
        console.log(formData);

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data User.");
        } else {
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
        <div className="card-header bg-primary lead fw-medium text-white">
          Detail Data User
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-3">
              <Label
                forLabel="Nama_Depan"
                title="Nama Depan"
                data={formData.Nama_Depan}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="Nama_Belakang"
                title="Nama Belakang"
                data={formData.Nama_Belakang}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="Username"
                title="Username"
                data={formData.Username}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="tempat_lahir"
                title="Tempat Lahir"
                data={formData.tempat_lahir}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="Tanggal_Lahir"
                title="Tanggal Lahir"
                data={formData.Tanggal_Lahir}
              />
            </div>
            <div className="col-lg-6">
              <Label forLabel="Alamat" title="Alamat" data={formData.Alamat} />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="Nomor_HP"
                title="Nomor HP"
                data={formData.Nomor_HP}
              />
            </div>
            <div className="col-lg-3">
              <Label forLabel="Email" title="Email" data={formData.Email} />
            </div>
            <div className="col-lg-3">
              <Label forLabel="Role" title="Peran" data={formData.Role} />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="Jenis_Kelamin"
                title="Jenis Kelamin"
                data={formData.Jenis_Kelamin}
              />
            </div>
            <div className="col-lg-3">
              <Label forLabel="Status" title="Status" data={formData.Status} />
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
