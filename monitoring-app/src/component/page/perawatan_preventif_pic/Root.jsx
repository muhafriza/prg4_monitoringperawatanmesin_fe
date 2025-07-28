import { useState } from "react";
import RiwayatPreventif from "./Index";
import DetailPreventif from "./Detail";

export default function PerawatanPreventifPIC() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <RiwayatPreventif onChangePage={handleSetPageMode} />;
        case "detail":
          return (
            <DetailPreventif
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
