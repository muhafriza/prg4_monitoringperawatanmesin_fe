import { useState } from "react";
import MasterMesinIndex from "./Index";
import MasterMesinAdd from "./Add";
import MasterMesinEdit from "./Edit";
import MasterMesinDetail from "./Detail";
import MasterPeriodIndex from "./Index";
import MasterPeriodAdd from "./Add";
import MasterPeriodDetail from "./Detail";
import MasterPeriodEdit from "./Edit";

export default function MasterMesin() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterPeriodIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterPeriodAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterPeriodEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
        case "detail":
          return (
            <MasterPeriodDetail
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
