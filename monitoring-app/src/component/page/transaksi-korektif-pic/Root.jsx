import { useState } from "react";
import PerawatanKorektif from "./Index";
import KorektifAdd from "./Add";
import KorektifDetail from "./Detail";


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

  const upt = userInfo.upt;


  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <PerawatanKorektif onChangePage={handleSetPageMode} />;
      case "add":
        return <KorektifAdd onChangePage={handleSetPageMode} />;
        case "detail":
          return (
            <KorektifDetail
              onChangePage={handleSetPageMode}
              withID={dataID}
            />
          );
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
