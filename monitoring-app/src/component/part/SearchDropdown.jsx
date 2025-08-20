import { forwardRef, useState, useEffect, useRef } from "react";
import Icon from "./Icon";

const SearchDropdown = forwardRef(function SearchDropdown(
  {
    arrData,
    label = "",
    placeHolder = "",
    forInput,
    isRequired = false,
    isRound = false,
    errorMessage,
    showLabel = true,
    value,
    onChange,
    readOnly = false,
    isDisabled = false,
    selectedValued = null,
    isPlaceHolder = false,
    triggerOnChange = false,
    ...props
  },
  ref
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [runnedTriger, setRunnedTriger] = useState(0);
  const wrapperRef = useRef(null);

  const [isFirstLoad, setIsFirstLoad] = useState(true);

useEffect(() => {
  // Kalau selectedValued berubah, berarti tab ganti → reset ke first load
  setIsFirstLoad(true);
}, [selectedValued]);

useEffect(() => {
  if (isFirstLoad && selectedValued != null && selectedValued.Value !== value) {
    // Load pertama atau tab ganti → ambil dari selectedValued
    setSearchTerm(
      selectedValued.Text.length > 75
        ? selectedValued.Text.substring(0, 75) + "... "
        : selectedValued.Text
    );
    onChange({ target: { name: forInput, value: selectedValued.Value } });
    setIsFirstLoad(false); // Supaya nggak override lagi setelah user pilih
  } else {
    // Kalau bukan first load → cuma sinkron dengan value
    const matchedData = arrData.find((data) => data.Value === value);
    setSearchTerm(
      matchedData
        ? matchedData.Text.length > 75
          ? matchedData.Text.substring(0, 75) + "... "
          : matchedData.Text
        : ""
    );
  }
}, [value, arrData, selectedValued, isFirstLoad]);

  const handleOptionClick = (selectedValue, text) => {
    onChange({ target: { name: forInput, value: selectedValue } });
    setSearchTerm(text);
    setDropdownOpen(false);
  };

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredData =
    Array.isArray(arrData) && arrData.length > 0
      ? searchTerm === "" || !dropdownOpen
        ? arrData
        : arrData.filter((item) =>
            item.Text.toLowerCase().includes(searchTerm.toLowerCase())
          )
      : [];

  const renderDropdown = () =>
    dropdownOpen &&
    filteredData.length > 0 && (
      <ul
        className="dropdown-menu py-1 show"
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          width: "100%",
          zIndex: 10,
          maxHeight: "200px",
          overflowY: "auto",
          background: "white",
          border: "1px solid #ddd",
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {filteredData.map((data) => (
          <li
            key={data.Value}
            className="dropdown-item"
            onClick={() => handleOptionClick(data.Value, data.Text)}
            style={{
              padding: "10px",
              cursor: "pointer",
              borderBottom: "1px solid #f1f1f1",
            }}
          >
            {data.Text}
          </li>
        ))}
      </ul>
    );

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setDropdownOpen(true);
  };

  const inputElement = (
    <div
      className="dropdown-wrapper"
      style={{ position: "relative" }}
      ref={wrapperRef}
    >
      <input
        ref={ref}
        type="text"
        id={forInput}
        name={forInput}
        autoComplete="off"
        className={`form-control ${isRound ? "rounded-5" : ""} ${
          errorMessage ? "-is-invalid" : ""
        } ${isDisabled ? "bg-light" : ""}`}
        placeholder={`-- Select ${placeHolder} --`}
        value={searchTerm}
        readOnly={readOnly}
        onChange={handleInputChange}
        onFocus={() => {
          if (!isDisabled) {
            setDropdownOpen(true);
            setSearchTerm(""); // reset pencarian
          }
        }}
        disabled={isDisabled}
        style={{
          textAlign: "left",
          paddingRight: "12px",
          ...props.style, // agar style eksternal tetap masuk
        }}
        {...props}
      />

      {/* Icon hanya muncul jika dropdown tidak disabled */}
      {!isDisabled && (
        <Icon
          name="angle-small-down me-2"
          style={{
            position: "absolute",
            top: "50%",
            right: "10px",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
          onClick={() => {
            if (!isDisabled) {
              setDropdownOpen(true);
              setSearchTerm(""); // reset pencarian
            }
          }}
        />
      )}

      {renderDropdown()}
    </div>
  );

  return (
    <>
      {label !== "" && (
        <div className="mb-3 position-relative">
          <label htmlFor={forInput} className="form-label fw-bold">
            {label}
            {isRequired && <span className="text-danger"> *</span>}
            {errorMessage && (
              <span className="fw-normal text-danger"> {errorMessage}</span>
            )}
          </label>
          {inputElement}
        </div>
      )}
      {label === "" && (
        <>
          {inputElement}
          {errorMessage && (
            <span className="small ms-1 text-danger">
              {placeHolder.charAt(0).toUpperCase() +
                placeHolder.slice(1).toLowerCase() +
                " " +
                errorMessage}
            </span>
          )}
        </>
      )}
    </>
  );
});

export default SearchDropdown;
