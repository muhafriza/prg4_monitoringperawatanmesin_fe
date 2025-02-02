import { useState } from "react";
import RiwayatPreventif from "./Index";
import DetailRiwayatPreventif from "./Detail";

import MasterSparepartAdd from "./Add";
import MasterSparepartEdit from "./Edit";
import DetailRiwayatKorektif from "./Detail";

export default function RiwayatPerawatanKorektif() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <RiwayatPreventif onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterSparepartAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterSparepartEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
        case "detail":
          return (
            <DetailRiwayatKorektif
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
