import { useState } from "react";
import MasterkorektifIndex from "./Index";
import MasterkorektifAdd from "./Add";
import MasterkorektifEdit from "./Edit";
import MasterkorektifDetail from "./Detail";

export default function MasterProses() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterkorektifIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterkorektifAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterkorektifEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
        case "detail":
          return (
            <MasterkorektifDetail
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
