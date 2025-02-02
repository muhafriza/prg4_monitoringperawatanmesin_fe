import { useState } from "react";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import KorektifPicPerawatan from "../transaksi-korektif-pic-perawatan/Root";
import KorektifPicOtomotif from "../transaksi-korektif-pic-otomotif/Root";
import KorektifPicOtomasi from "../transaksi-korektif-pic-otomasi/Root";
import KorektifPicDesainMetrologi from "../transaksi-korektif-pic-dmetrologi/Root";
import KorektifPicManufaktur from "../transaksi-korektif-pic-manufaktur/Root";
import KorektifPicPemesinan from "../transaksi-korektif-pic-pemesinan/Root";
import KorektifPicAlatBerat from "../transaksi-korektif-pic-aberat/Root";
import KorektifPicSipil from "../transaksi-korektif-pic-sipil/Root";
import KorektifPicLPT3 from "../transaksi-korektif-pic-lpt3/Root";
import KorektifPicProduksi from "../transaksi-korektif-pic-produksi/Root";

export default function KorektifPic() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

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
  console.log(upt);

  function getPageMode() {
    switch (upt) {
      case "PERAWATAN":
        return <KorektifPicPerawatan onChangePage={handleSetPageMode} />;
      case "OTOMOTIF":
        return <KorektifPicOtomotif onChangePage={handleSetPageMode} />;
      case "OTOMASI":
        return <KorektifPicOtomasi onChangePage={handleSetPageMode} />;
      case "DESAIN DAN METROLOGI":
        return <KorektifPicDesainMetrologi onChangePage={handleSetPageMode} />;
      case "MANUFAKTUR":
        return <KorektifPicManufaktur onChangePage={handleSetPageMode} />;
      case "PEMESINAN":
        return <KorektifPicPemesinan onChangePage={handleSetPageMode} />;
      case "SIPIL":
        return <KorektifPicSipil onChangePage={handleSetPageMode} />;
      case "ALAT BERAT":
        return <KorektifPicAlatBerat onChangePage={handleSetPageMode} />;
      case "PRODUKSI":
        return <KorektifPicProduksi onChangePage={handleSetPageMode} />;
      case "LPT3":
        return <KorektifPicLPT3 onChangePage={handleSetPageMode} />;
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}
