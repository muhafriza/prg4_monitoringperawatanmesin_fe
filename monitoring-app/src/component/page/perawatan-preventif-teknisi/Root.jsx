import { useState } from "react";
import PerawatanPreventifTeknisiIndex from "./Index";
import PerawatanPreventifTeknisiDetail from "./Detail";
import PerawatanPreventifTeknisiEdit from "./Edit";

export default function PerawatanPreventifTeknisi() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <PerawatanPreventifTeknisiIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <PerawatanPreventifTeknisiIndex onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <PerawatanPreventifTeknisiEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
        case "detail":
          return (
            <PerawatanPreventifTeknisiDetail
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
