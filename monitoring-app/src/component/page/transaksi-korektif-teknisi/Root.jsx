import { useState } from "react";
import Index from "./Index";
import KorektifTekEdit from "./Edit";
import KorektifTeknisiDetail from "./Detail";

export default function KorektifTeknisi() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <Index onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <KorektifTekEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
        case "detail":
          return (
            <KorektifTeknisiDetail
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
