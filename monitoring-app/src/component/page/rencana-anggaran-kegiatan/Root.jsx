import { useState } from "react";
import RencanaAnggaranKegiatanIndex from "./Index";
import RencanaAnggaranKegiatanAdd from "./Add";
import RencanaAnggaranKegiatanDetail from "./Detail";
import RencanaAnggaranKegiatanEdit from "./Edit";
import RencanaAnggaranKegiatanAnalisa from "./Analisa";

export default function RencanaAnggaranKegiatan() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return (
          <RencanaAnggaranKegiatanIndex onChangePage={handleSetPageMode} />
        );
      case "add":
        return (
          <RencanaAnggaranKegiatanAdd
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "detail":
        return (
          <RencanaAnggaranKegiatanDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <RencanaAnggaranKegiatanEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "analisa":
        return (
          <RencanaAnggaranKegiatanAnalisa
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
