import { useEffect, useState } from "react";
import { portalFetch } from "../lib/portalApi";
import { fmtDate } from "../lib/format";
import { useToast } from "../../hooks/useToast";
import { pushSupported, getPushSubscription, enablePush, disablePush } from "../lib/push";

export default function Notifications() {
  const showToast = useToast();
  const [state, setState] = useState({ status: "loading" });
  const [pushState, setPushState] = useState({ status: "checking" }); // checking | subscribed | unsubscribed | unavailable | working

  useEffect(() => {
    portalFetch("/volunteer-auth/notifications")
      .then((body) => setState({ status: "ok", notifications: body.notifications }))
      .catch((err) => setState({ status: "error", message: err.message }));
  }, []);

  useEffect(() => {
    if (!pushSupported()) return;
    getPushSubscription()
      .then((sub) => setPushState({ status: sub ? "subscribed" : "unsubscribed" }))
      .catch(() => setPushState({ status: "unavailable" }));
  }, []);

  function togglePush() {
    const subscribed = pushState.status === "subscribed";
    setPushState({ status: "working" });
    const action = subscribed ? disablePush() : enablePush();
    action
      .then(() => { showToast(subscribed ? "Push notifications disabled." : "Push notifications enabled."); setPushState({ status: subscribed ? "unsubscribed" : "subscribed" }); })
      .catch((err) => { showToast(err.message); setPushState({ status: subscribed ? "subscribed" : "unsubscribed" }); });
  }

  if (state.status === "loading") return <p className="text-[14px] text-[#4B5563]">Loading…</p>;
  if (state.status === "error") return <p className="text-[14px] text-[#DC2626]">{state.message}</p>;

  return (
    <>
      {pushSupported() && (
        <div className="mf-form-card mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-bold text-[15px]">Push notifications</p>
            <p className="text-[13px] text-[#4B5563] mt-1">Get an alert on this device for urgent blood requests and updates.</p>
          </div>
          <button
            className={"mf-btn " + (pushState.status === "subscribed" ? "mf-btn-red" : "mf-btn-primary")}
            disabled={pushState.status === "checking" || pushState.status === "working" || pushState.status === "unavailable"}
            onClick={togglePush}
          >
            {pushState.status === "checking" && "Checking…"}
            {pushState.status === "working" && "Working…"}
            {pushState.status === "unavailable" && "Unavailable"}
            {pushState.status === "subscribed" && "Disable"}
            {pushState.status === "unsubscribed" && "Enable Push Notifications"}
          </button>
        </div>
      )}

      {state.notifications.length ? state.notifications.map((n) => (
        <div key={n.id} className="mf-notif-item">
          <p className="title">{n.title}</p>
          <p className="meta">{fmtDate(n.createdAt)}</p>
          <p className="msg">{n.message}</p>
        </div>
      )) : <p className="text-[14px] text-[#9CA3AF]">No notifications yet.</p>}
    </>
  );
}
