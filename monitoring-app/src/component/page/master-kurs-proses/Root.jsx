import { useState } from "react";
import MasterKursProsesIndex from "./Index";
import MasterKursProsesAdd from "./Add";
import MasterKursProsesDetail from "./Detail";

export default function MasterKursProses() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterKursProsesIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterKursProsesAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterKursProsesDetail
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
