import { useState } from "react";
import MasterSparepartIndex from "./Index";
import MasterSparepartAdd from "./Add";
import MasterSparepartEdit from "./Edit";
import MasterSparepartDetail from "./Detail";

export default function MasterProses() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterSparepartIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterSparepartAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterSparepartEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
        case "detail":
          return (
            <MasterSparepartDetail
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
