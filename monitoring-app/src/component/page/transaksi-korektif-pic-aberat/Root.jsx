import { useState } from "react";
import PerawatanKorektif from "./Index";
import KorektifAdd from "./Add";
import KorektifDetail from "./Detail";


export default function KorektifPicAlatBerat() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

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
