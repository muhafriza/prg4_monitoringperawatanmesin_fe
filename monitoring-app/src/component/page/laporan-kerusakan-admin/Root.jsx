import { useState } from "react";
import IndexLaporanKerusakan from "./Index";
import Detail from "./Detail";

export default function LaporanKerusakanAdmin() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();
  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <IndexLaporanKerusakan onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <Detail onChangePage={handleSetPageMode} withID={dataID} />
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
