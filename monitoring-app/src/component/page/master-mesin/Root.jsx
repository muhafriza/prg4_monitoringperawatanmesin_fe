import { useState } from "react";
import MasterMesinIndex from "./Index";
import MasterMesinAdd from "./Add";
import MasterMesinEdit from "./Edit";
import MasterMesinDetail from "./Detail";
import MasterMesinHistory from "./History";

export default function MasterMesin() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterMesinIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterMesinAdd onChangePage={handleSetPageMode} />;
      case "history":
        return (
          <MasterMesinHistory
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterMesinEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "detail":
        return (
          <MasterMesinDetail onChangePage={handleSetPageMode} withID={dataID} />
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
