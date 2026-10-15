import { useEffect, useState } from "react";
import { adminFetch } from "../lib/adminApi";
import { invalidateWebsite } from "../../lib/websiteCache";
import { useToast } from "../../hooks/useToast";
import AdminModal from "../components/AdminModal";
import { checkImage, checkImageUrl, uploadWebsiteImage, uploadWebsiteImageUrl } from "../lib/websiteImages";
import { useAdminList } from "../hooks/useAdminList";
import AdminPagination from "../components/AdminPagination";
import "../../styles/content-management.css";
const categories = { blood: "Blood donation", welfare: "Community welfare", relief: "Disaster relief", environment: "Environment", youth: "Youth development" };
function PhotoEditor({ image, onClose, onSaved }) {
  const [values, setValues] = useState(image ? { title: image.title, alt: image.alt, caption: image.caption, category: image.category, status: image.status, sortOrder: image.sortOrder, inGallery: image.inGallery } : { title: "", alt: "", caption: "", category: "welfare", status: "draft", sortOrder: 0, inGallery: true });
  const [files, setFiles] = useState([]), [source, setSource] = useState("file"), [imageUrl, setImageUrl] = useState(""), [previews, setPreviews] = useState(image?.imageUrl ? [image.imageUrl] : []), [busy, setBusy] = useState(false), [progress, setProgress] = useState(null), [error, setError] = useState("");
  useEffect(() => {
    if (!files.length) return;
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);
  const field = (name) => ({ value: values[name], onChange: (event) => setValues((current) => ({ ...current, [name]: name === "sortOrder" ? Number(event.target.value) : event.target.value })) });
  async function save(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      let result;
      if (image) result = await adminFetch(`/website/images/${image.id}`, { method: "PATCH", body: JSON.stringify({ ...values, revision: image.revision }) });
      else {
        if (source === "file") {
          if (!files.length) throw new Error("Choose one or more photos to upload.");
          let uploaded = 0, deduplicated = 0;
          setProgress({ current: 0, total: files.length });
          for (const [index, file] of files.entries()) {
            result = await uploadWebsiteImage(file, { ...values, status: "draft" });
            if (result.deduplicated) deduplicated++;
            else {
              if (values.status === "published" || values.sortOrder) await adminFetch(`/website/images/${result.image.id}`, { method: "PATCH", body: JSON.stringify({ ...values, revision: result.image.revision }) });
              uploaded++;
            }
            setProgress({ current: index + 1, total: files.length });
          }
          invalidateWebsite();
          if (!uploaded) onSaved(files.length === 1 ? "This photo is already in your library." : "All selected photos are already in your library.");
          else {
            const destination = values.status === "published" && values.inGallery ? "published to the website gallery" : "saved to your library";
            onSaved(`${uploaded} ${uploaded === 1 ? "photo" : "photos"} ${destination}.${deduplicated ? ` ${deduplicated} duplicate ${deduplicated === 1 ? "was" : "were"} reused.` : ""}`);
          }
          return;
        } else {
          result = await uploadWebsiteImageUrl(imageUrl, { ...values, status: "draft" });
        }
        if (result.deduplicated) {
          onSaved("This photo is already in your library. The existing file was reused.");
          return;
        }
        if (values.status === "published" || values.sortOrder) result = await adminFetch(`/website/images/${result.image.id}`, { method: "PATCH", body: JSON.stringify({ ...values, revision: result.image.revision }) });
      }
      invalidateWebsite();
      onSaved(values.status === "published" && values.inGallery ? "Photo published to the website gallery." : "Photo saved to your library.");
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(null);
      setBusy(false);
    }
  }
  return <AdminModal open onClose={onClose} title={image ? "Edit photo" : "Add photos"} busy={busy} wide><form onSubmit={save} className="cms-photo-form"><fieldset disabled={busy}>
    {!!previews.length && <div className="cms-photo-previews" aria-label={`${previews.length} selected ${previews.length === 1 ? "photo" : "photos"}`}>{previews.map((preview, index) => <figure key={preview}><img src={preview} alt="" /><figcaption>{files[index]?.name || "Current photo"}</figcaption></figure>)}</div>}
    {!image && <><div className="cms-source-tabs" role="group" aria-label="Photo source"><button type="button" aria-pressed={source === "file"} onClick={() => {
    setSource("file");
    setImageUrl("");
    setPreviews([]);
    setError("");
  }}><i className="fa-solid fa-upload" aria-hidden="true" /> Upload file</button><button type="button" aria-pressed={source === "url"} onClick={() => {
    setSource("url");
    setFiles([]);
    setPreviews([]);
    setError("");
  }}><i className="fa-solid fa-link" aria-hidden="true" /> Use image URL</button></div>{source === "file" ? <label className="cms-dropzone">Choose one or more photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple required onChange={(event) => {
    setError("");
    const chosen = [...event.target.files];
    if (!chosen.length) return;
    try {
      chosen.forEach(checkImage);
      setFiles(chosen);
    } catch (err) {
      setError(err.message);
      event.target.value = "";
      setFiles([]);
      setPreviews([]);
    }
  }} /><small>JPG, PNG or WebP · up to 5 MB each. All selected photos will use the details below.</small></label> : <label className="cms-dropzone">Image URL<input className="mf-input" type="url" inputMode="url" placeholder="https://example.com/photo.jpg" required value={imageUrl} onChange={(event) => {
    const value = event.target.value;
    setImageUrl(value);
    setError("");
    try {
      setPreviews([checkImageUrl(value)]);
    } catch {
      setPreviews([]);
    }
  }} /><small>Paste a complete HTTPS image URL. The gallery will use the image from that address.</small></label>}</>}
    <div className="cms-field-grid">{!image && source === "file" && files.length > 1 && <p className="cms-batch-note">The same title, category, alt text, caption, visibility and display order will be applied to all {files.length} photos.</p>}<label className="cms-field"><span className="mf-label">Photo title</span><input className="mf-input" required maxLength={150} {...field("title")} /></label><label className="cms-field"><span className="mf-label">Category</span><select className="mf-input" {...field("category")}>{Object.entries(categories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="cms-field cms-field-wide"><span className="mf-label">Image description (alt text)</span><input className="mf-input" required maxLength={300} {...field("alt")} /><small>Describe what is in the photo for people using screen readers.</small></label><label className="cms-field cms-field-wide"><span className="mf-label">Caption</span><textarea className="mf-input" rows={3} maxLength={1e3} {...field("caption")} /></label><label className="cms-field"><span className="mf-label">Visibility</span><select className="mf-input" {...field("status")}><option value="draft">Draft — hidden from the gallery</option><option value="published">Published — visible in the gallery</option></select></label><label className="cms-field"><span className="mf-label">Display order</span><input className="mf-input" type="number" min={0} max={1e5} step={1} {...field("sortOrder")} /><small>Lower numbers appear first.</small></label></div><label className="cms-checkbox"><input type="checkbox" checked={values.inGallery} onChange={(event) => setValues((current) => ({ ...current, inGallery: event.target.checked }))} /> Include this photo in the website gallery</label>
    </fieldset>{error && <p role="alert" className="ws-error">{error}</p>}<div className="cms-modal-actions"><button type="button" className="mf-btn mf-btn-outline" disabled={busy} onClick={onClose}>Cancel</button><button type="submit" className="mf-btn mf-btn-primary" disabled={busy}>{busy ? progress ? `Uploading ${progress.current} of ${progress.total}\u2026` : "Saving photo\u2026" : image ? "Save changes" : source === "url" ? "Add from URL" : files.length > 1 ? `Upload ${files.length} photos` : "Upload photo"}</button></div></form></AdminModal>;
}
export default function GalleryManagement() {
  const [editing, setEditing] = useState(void 0), [query, setQuery] = useState(""), [debouncedQuery, setDebouncedQuery] = useState(""), [filter, setFilter] = useState("gallery"), [busy, setBusy] = useState(null);
  const toast = useToast();
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [query]);
  const imagePath = `/website/images?filter=${encodeURIComponent(filter)}${debouncedQuery ? `&q=${encodeURIComponent(debouncedQuery)}` : ""}`;
  const { rows: images, loading, fetching, error, refresh, pagination, pageSize, setPage, setPageSize } = useAdminList(imagePath, "images", { pageSize: 20 });
  async function mutate(image, remove = false) {
    setBusy(image.id);
    try {
      await adminFetch(`/website/images/${image.id}`, { method: remove ? "DELETE" : "PATCH", body: JSON.stringify({ revision: image.revision, ...!remove && { status: image.status === "published" ? "draft" : "published" } }) });
      invalidateWebsite();
      await refresh();
      toast(remove ? "Photo removed from the library and gallery." : "Gallery visibility updated.");
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(null);
    }
  }
  return <><div className="cms-intro"><span className="cms-intro-icon"><i className="fa-regular fa-images" aria-hidden="true" /></span><div><h2>Moments worth sharing.</h2><p>Upload photos, write captions and choose what appears in your public gallery.</p></div><a className="mf-admin-btn mf-admin-btn-neutral" href="/gallery" target="_blank" rel="noopener noreferrer">View gallery ↗</a></div><div className="ws-toolbar"><div className="ws-toolbar-filters"><input type="search" className="mf-input" aria-label="Search photos" placeholder="Search photos or categories…" value={query} onChange={(e) => setQuery(e.target.value)} /><select aria-label="Filter photos" className="mf-input" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="gallery">Gallery photos</option><option value="published">Published</option><option value="draft">Drafts</option><option value="library">All website images</option></select></div><button className="mf-btn mf-btn-primary" onClick={() => setEditing(null)}><i className="fa-solid fa-plus" aria-hidden="true" />Upload photos</button></div>
    {error && <p className="ws-error" role="alert">{error.message} <button onClick={refresh}>Retry</button></p>}{loading ? <p className="ws-empty" role="status">Loading your image library…</p> : !images.length ? <p className="ws-empty">{debouncedQuery || filter !== "library" ? "No photos match this view." : "Your gallery starts here. Upload the first moment."}</p> : <><div className="cms-gallery-grid">{images.map((image) => <article className="cms-photo-card" key={image.id}><div className="cms-photo-cover"><img src={image.imageUrl} alt={image.alt} loading="lazy" /><span className={`cms-status ${image.status === "published" && image.inGallery ? "is-live" : ""}`}>{!image.inGallery ? "Website image" : image.status === "published" ? "Published" : "Draft"}</span></div><div className="cms-photo-copy"><p className="ws-eyebrow">{categories[image.category]}</p><h2>{image.title}</h2><p>{image.caption || image.alt}</p><small>{image.format === "webp" ? `WEBP \xB7 ${image.width} \xD7 ${image.height} \xB7 ${Math.round((image.bytes || 0) / 1024)} KB` : "External image URL"} · Order {image.sortOrder}</small></div><div className="cms-photo-actions"><button className="mf-admin-btn mf-admin-btn-neutral" disabled={busy === image.id} onClick={() => setEditing(image)}>Edit</button>{image.inGallery && <button className="mf-admin-btn mf-admin-btn-neutral" disabled={busy === image.id} onClick={() => mutate(image)}>{image.status === "published" ? "Hide" : "Publish"}</button>}<button className="ws-icon-button ws-delete" aria-label={`Remove ${image.title}`} disabled={busy === image.id} onClick={() => {
    if (window.confirm(`Remove \u201C${image.title}\u201D from the library and gallery? Pages already using this image will keep it.`)) mutate(image, true);
  }}><i className="fa-regular fa-trash-can" aria-hidden="true" /></button></div></article>)}</div><AdminPagination pagination={pagination} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={setPageSize} busy={fetching} /></>}{editing !== void 0 && <PhotoEditor key={editing?.id || "new"} image={editing} onClose={() => setEditing(void 0)} onSaved={(message) => {
    setEditing(void 0);
    toast(message);
    invalidateWebsite();
    refresh();
  }} />}</>;
}
