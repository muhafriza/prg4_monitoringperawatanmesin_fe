import { useState } from "react";
import SuratPerintahKerjaIndex from "./Index";
import SuratPerintahKerjaAdd from "./Add";
import SuratPerintahKerjaDetail from "./Detail";
import SuratPerintahKerjaEdit from "./Edit";

export default function SuratPenawaran() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <SuratPerintahKerjaIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <SuratPerintahKerjaAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <SuratPerintahKerjaDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <SuratPerintahKerjaEdit
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
