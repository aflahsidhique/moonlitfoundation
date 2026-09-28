import { useEffect, useMemo, useState } from "react";
import schema from "../../../../server/src/content/schema.json";
import { loadWebsite, peekWebsite, registerImageCache, subscribeWebsite, WEBSITE_TTL } from "../../lib/websiteCache";
import { WebsiteContext } from "../../hooks/useWebsite";

const defaults = Object.assign({}, ...schema.pages.map(page=>Object.fromEntries(page.fields.map(field=>[field.key,field.default]))));
export function WebsiteProvider({children}) {
  const [data,setData] = useState(peekWebsite);
  const [loading,setLoading] = useState(!data);
  const [error,setError] = useState("");
  useEffect(()=>{
    let active = true;
    const refresh = () => {
      if(document.visibilityState === "hidden") return;
      loadWebsite().then(result=>{ if(active) {setData(result);setError("");} })
        .catch(err=>{if(active) setError(err.message);}).finally(()=>{if(active)setLoading(false);});
    };
    refresh();registerImageCache();
    const unsubscribe = subscribeWebsite(refresh);
    const interval = setInterval(refresh, Math.min(30_000, WEBSITE_TTL));
    window.addEventListener("focus",refresh);
    document.addEventListener("visibilitychange",refresh);
    return ()=>{ active=false;unsubscribe();clearInterval(interval);window.removeEventListener("focus",refresh);document.removeEventListener("visibilitychange",refresh); };
  },[]);
  const value=useMemo(()=>({ field:key=>data?.content?.[key]??defaults[key]??"", gallery:data?.gallery||[],loading,error }),[data,loading,error]);
  return <WebsiteContext.Provider value={value}>{children}</WebsiteContext.Provider>;
}
