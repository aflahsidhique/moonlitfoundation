import { useEffect, useState } from "react";
export function useLocationCascade() {
  const [data, setData] = useState(null);
  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");
  useEffect(() => {
    fetch("/kerala-lsg.json").then((res) => res.ok ? res.json() : Promise.reject()).then(setData).catch(() => setData({}));
  }, []);
  function onDistrictChange(e) {
    setDistrict(e.target.value);
    setTaluk("");
  }
  const taluks = data && district && data[district] ? Object.keys(data[district]).sort() : [];
  const panchayats = data && district && taluk && data[district]?.[taluk] ? data[district][taluk] : [];
  return {
    loading: data === null,
    district,
    taluk,
    onDistrictChange,
    onTalukChange: (e) => setTaluk(e.target.value),
    taluks,
    panchayats
  };
}
