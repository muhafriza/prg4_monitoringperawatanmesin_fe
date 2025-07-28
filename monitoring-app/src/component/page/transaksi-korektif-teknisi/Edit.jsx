import { useEffect, useState } from "react";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import DropDown from "../../part/Dropdown";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function PerawatanPreventifTeknisiEdit({
  onChangePage,
  withID,
}) {
  const [formData, setFormData] = useState({
    ID_Perawatan_Korektif: withID,
    Tanggal_Penjadwalan: "",
    Tanggal_Aktual: "",
    Tindakan_Perbaikan: "",
    Sparepart_Diganti: "",
    Status_Pemeliharaan: "",
    Sparepart_Kode: "",
    Qty_Sparepart: "",
    Nama_Mesin: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [sparepartOptions, setSparepartOptions] = useState([]);
  const [spareparts, setSpareparts] = useState([{ sparepart: "", qty: "" }]);

  const statusOptions = [
    { Value: "Menunggu Perbaikan", Text: "Menunggu Perbaikan" },
    { Value: "Dalam Pengerjaan", Text: "Dalam Pengerjaan" },
    { Value: "Pending", Text: "Pending" },
    { Value: "Selesai", Text: "Selesai" },
    { Value: "Batal", Text: "Batal" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError({ error: false, message: "" });

      try {
        const dataKorektif = await UseFetch(
          `${API_LINK}Korektif/DetailPerawatanMesin`,
          { id: withID }
        );
        if (!dataKorektif || dataKorektif === "ERROR") {
          throw new Error("Gagal mengambil data korektif.");
        }
        setFormData(dataKorektif[0]);
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDataSparepart = async () => {
      try {
        const data = await UseFetch(
          `${API_LINK}TransaksiPreventif/getNamaSparepart`,
          { status: "Aktif" }
        );
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Sparepart.");
        }
        setSparepartOptions(data);
      } catch (error) {
        setIsError({ error: true, message: error.message });
      }
    };

    if (withID) fetchData();
    fetchDataSparepart();
  }, [withID]);

  const handleInputChange = (e, fieldName) => {
    setFormData((prevData) => ({ ...prevData, [fieldName]: e.target.value }));
  };

  const handleSparepartChange = (index, field, value) => {
    const updatedSpareparts = [...spareparts];
    updatedSpareparts[index][field] = value;
    setSpareparts(updatedSpareparts);
  };

  const addSparepartField = () => {
    setSpareparts([...spareparts, { sparepart: "", qty: "" }]);
  };

  const removeSparepartField = (index) => {
    setSpareparts(spareparts.filter((_, i) => i !== index));
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    const sparepartString = spareparts.map((item) => item.sparepart).join(",");
    const qtyString = spareparts.map((item) => item.qty).join(",");

    const payload = {
      ...formData,
      Sparepart_Kode: sparepartString,
      Qty_Sparepart: qtyString,
    };

    try {
      const data = await UseFetch(`${API_LINK}Korektif/UpdateKorektif`, {
        ID_Perawatan_Korektif: withID,
        Tanggal_Penjadwalan: payload.Tanggal_Penjadwalan,
        Tanggal_Aktual: payload.Tanggal_Aktual,
        Tanggal_Pengajuan: payload.Tanggal_Pengajuan,
        Deskripsi_Kerusakan: payload.Deskripsi_Kerusakan,
        Tindakan_Perbaikan: payload.Tindakan_Perbaikan,
        Sparepart_Diganti: payload.Sparepart_Diganti,
        Status_Pemeliharaan: payload.Status_Pemeliharaan,
        Sparepart_Kode: payload.Sparepart_Kode,
        Qty_Sparepart: payload.Qty_Sparepart,
      });
      if (!data) throw new Error("Gagal menyimpan data.");
      alert("Data berhasil disimpan!");
      onChangePage("index");
    } catch (error) {
      setIsError({
        error: true,
        message: error.message || "Terjadi kesalahan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && <Alert type="danger" message={isError.message} />}
      <form onSubmit={handleEdit}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Ubah Status Perawatan Mesin
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Label
                  forLabel="ID_Perawatan_Korektif"
                  title="ID Perawatan"
                  data={formData.ID_Perawatan_Korektif}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="ID_Mesin"
                  title="ID Mesin"
                  data={formData.ID_Mesin}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="Nama_Mesin"
                  title="Nama Mesin"
                  data={formData.Nama_Mesin}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="date"
                  forInput="Tanggal_Penjadwalan"
                  label="Tanggal Penjadwalan"
                  value={formData.Tanggal_Penjadwalan}
                  onChange={(e) => handleInputChange(e, "Tanggal_Penjadwalan")}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="date"
                  forInput="Tanggal_Aktual"
                  label="Tanggal Aktual"
                  value={formData.Tanggal_Aktual}
                  onChange={(e) => handleInputChange(e, "Tanggal_Aktual")}
                />
                <Input
                  type="text"
                  forInput="Tindakan_Perbaikan"
                  label="Tindakan Perbaikan"
                  value={formData.Tindakan_Perbaikan}
                  onChange={(e) => handleInputChange(e, "Tindakan_Perbaikan")}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="Created_By"
                  title="Dibuat Oleh"
                  data={formData.Created_By}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="Created_Date"
                  title="Tanggal Dibuat"
                  data={formData.Created_Date}
                />
              </div>
              {spareparts.map((sparepart, index) => (
                <div key={index} className="row mb-3">
                  <div className="col-lg-3">
                    <label
                      htmlFor={`sparepart-${index}`}
                      className="form-label fw-bold"
                    >
                      {`Sparepart ${index + 1}`}{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                      id={`sparepart-${index}`}
                      className="form-select"
                      value={sparepart.sparepart}
                      onChange={(e) =>
                        handleSparepartChange(
                          index,
                          "sparepart",
                          e.target.value
                        )
                      }
                    >
                      <option value="">-- Pilih Sparepart --</option>
                      {sparepartOptions.map((option) => (
                        <option
                          key={option.kode_sparepart}
                          value={option.kode_sparepart}
                        >
                          {option.nama_sparepart}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-lg-3">
                    <Input
                      type="text"
                      forInput={`qty-${index}`}
                      label="Jumlah Sparepart"
                      isRequired
                      onChange={(e) =>
                        handleSparepartChange(index, "qty", e.target.value)
                      }
                      value={sparepart.qty}
                    />
                  </div>
                  <div className="col-lg-2 d-flex align-items-center">
                    <Button
                      classType="danger"
                      label="-"
                      onClick={() => removeSparepartField(index)}
                    />
                  </div>
                </div>
              ))}
              <Button
                classType="success me-2 px-4 py-2"
                label="Tambah Sparepart"
                onClick={addSparepartField}
              />
              <Input
                type="text"
                forInput="Sparepart_Diganti"
                label="Sparepart Diganti"
                value={formData.Sparepart_Diganti}
                onChange={(e) => handleInputChange(e, "Sparepart_Diganti")}
              />
              <DropDown
                arrData={statusOptions}
                type="select"
                label="Status Pemeliharaan"
                forInput="Status_Pemeliharaan"
                isRequired
                value={formData.Status_Pemeliharaan || ""}
                onChange={(e) => handleInputChange(e, "Status_Pemeliharaan")}
              />
            </div>
            <div className="float-end my-4 mx-1">
              <Button
                classType="secondary px-4 py-2"
                label="KEMBALI"
                onClick={() => onChangePage("index")}
              />
              <Button
                classType="primary ms-2 px-4 py-2"
                type="submit"
                label="SIMPAN"
              />
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
