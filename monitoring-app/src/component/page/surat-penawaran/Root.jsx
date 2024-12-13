import { useState } from "react";
import SuratPenawaranIndex from "./Index";
import SuratPenawaranAdd from "./Add";
import SuratPenawaranDetail from "./Detail";
import SuratPenawaranEdit from "./Edit";
import SuratPenawaranKonfirmasi from "./Konfirmasi";

export default function SuratPenawaran() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <SuratPenawaranIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <SuratPenawaranAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <SuratPenawaranDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <SuratPenawaranEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "konfirmasi":
        return (
          <SuratPenawaranKonfirmasi
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
