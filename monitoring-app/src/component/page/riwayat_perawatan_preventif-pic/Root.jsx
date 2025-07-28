import { useState } from "react";
import RiwayatPreventif from "./Index";
import DetailRiwayatPreventifPIC from "./Detail";

export default function RiwayatPerawatanPreventifPIC() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <RiwayatPreventif onChangePage={handleSetPageMode} />;
        case "detail":
          return (
            <DetailRiwayatPreventifPIC
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
