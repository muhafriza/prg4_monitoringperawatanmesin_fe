import { useState } from "react";
import JadwalPerawatan from "./Index";
import JadwalEdit from "./Edit";
import DetailJadwal from "./Detail";
import Add from "./Add";

export default function MasterProses() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <JadwalPerawatan onChangePage={handleSetPageMode} />;
      case "add":
        return <Add onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <JadwalEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
        case "detail":
          return (
            <DetailJadwal
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
