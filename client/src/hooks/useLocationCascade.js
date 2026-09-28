import { useEffect, useState } from "react";

// Drives the volunteer form's District -> Taluk -> Panchayat/Municipality
// cascading selects from the static dataset compiled from India's
// official LGD open data (see client/public/kerala-lsg.json). Ports the
// legacy site's assets/location-cascade.js as a hook — offline, no
// external API, so it can't rate-limit or go down.
export function useLocationCascade() {
  const [data, setData] = useState(null);
  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");

  useEffect(() => {
    fetch("/kerala-lsg.json")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData({}));
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
    panchayats,
  };
}
