import { useState } from "react";
import DetailRiwayatPreventifTEKNISI from "./Detail";
import RiwayatPreventifTEKNISI from "./Index"

export default function RiwayatPerawatanPreventifTEKNISI() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <RiwayatPreventifTEKNISI onChangePage={handleSetPageMode} />;
        case "detail":
          return (
            <DetailRiwayatPreventifTEKNISI
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
