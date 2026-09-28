import { useEffect, useState } from "react";
import { portalFetch } from "../lib/portalApi";
import IdCardCard from "../components/IdCardCard";

export default function IdCard() {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    portalFetch("/volunteer-auth/me")
      .then((body) => setState({ status: "ok", v: body.volunteer }))
      .catch((err) => setState({ status: "error", message: err.message }));
  }, []);

  if (state.status === "loading") return <p className="text-[14px] text-[#4B5563]">Loading…</p>;
  if (state.status === "error") return <p className="text-[14px] text-[#DC2626]">{state.message}</p>;

  return (
    <>
      <IdCardCard v={state.v} />
      <div className="text-center mt-5">
        <button id="mfDownloadIdBtn" className="mf-btn mf-btn-primary" onClick={() => window.print()}><i className="fa-solid fa-download"></i> Download / Print</button>
      </div>
    </>
  );
}
