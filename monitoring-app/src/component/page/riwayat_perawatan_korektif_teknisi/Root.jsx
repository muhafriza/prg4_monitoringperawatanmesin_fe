import { useState } from "react";
import RiwayatPreventifTEKNISI from "./Index";
import DetailRiwayatKorektifTEKNISI from "./Detail";

export default function RiwayatPerawatanKorektifTEKNISI() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <RiwayatPreventifTEKNISI onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <DetailRiwayatKorektifTEKNISI
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
