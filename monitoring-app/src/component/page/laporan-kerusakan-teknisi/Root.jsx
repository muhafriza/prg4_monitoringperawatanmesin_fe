import { useState } from "react";
import LaporanKerusakan from "./Index";
import PerawatanKorektifTeknisiEdit from "./Edit";
import Detail from "./Detail";

export default function MasterProses() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <LaporanKerusakan onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <PerawatanKorektifTeknisiEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
        case "detail":
          return (
            <Detail
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
