import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../baseurl";

const TOAST_ID = "trend-form-toast";
const api = axios.create({ baseURL: BASE_URL });

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

const STATUS_OPTIONS = ["detected", "trending", "peaked", "dead", "never_took_off"];
const RFCI_TYPES = ["impact", "acceleration", "widespread"];
const PURPOSE_OPTIONS = ["seo", "business_idea", "content_creation", "keyword_research"]; // ← ADD

const EMPTY = {
  title: "", slug: "", description: "",
  category: "", tags: "",
  rfciScore: "", rfciType: "",
  growthRate: 0, status: "detected",
  purpose: "",          
  isHidden: false, isPublished: false,
};


const EMPTY_EVIDENCE = { platform: "tiktok", screenshotUrl: "", pageUrl: "", capturedAt: "" };
const EMPTY_VIDEO = { videoUrl: "", creatorHandle: "", viewCount: 0, commentCount: 0, capturedAt: "" };
const EMPTY_COMMENT = { platform: "tiktok", authorHandle: "", commentText: "", likeCount: 0, sourceVideoUrl: "", capturedAt: "" };



function ProofSection({ trendId }) {
  const [tab, setTab] = useState("evidence");
  const [evidence, setEvidence] = useState([]);
  const [comments, setComments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loadingProof, setLoadingProof] = useState(true);

 
  const [newEvidence, setNewEvidence] = useState(EMPTY_EVIDENCE);
  const [newComment, setNewComment] = useState(EMPTY_COMMENT);
  const [newVideo, setNewVideo] = useState(EMPTY_VIDEO);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProof();
  }, []);

  const fetchProof = async () => {
    setLoadingProof(true);
    try {
      const [evRes, coRes, viRes] = await Promise.allSettled([
        api.get(`/admin/trends/${trendId}/evidence`, authHeader()),
        api.get(`/admin/trends/${trendId}/comments`, authHeader()),
        api.get(`/admin/trends/${trendId}/videos`, authHeader()),
      ]);
      if (evRes.status === "fulfilled") setEvidence(evRes.value.data.evidence || []);
      if (coRes.status === "fulfilled") setComments(coRes.value.data.comments || []);
      if (viRes.status === "fulfilled") setVideos(viRes.value.data.videos || []);
    } catch {
      toast.error("Failed to load proof data.", { containerId: TOAST_ID });
    } finally {
      setLoadingProof(false);
    }
  };

  const addEvidence = async () => {
    if (!newEvidence.capturedAt) {
      toast.error("Captured date is required.", { containerId: TOAST_ID }); return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("platform", newEvidence.platform);
      formData.append("capturedAt", newEvidence.capturedAt);
      formData.append("pageUrl", newEvidence.pageUrl);
      if (newEvidence._file) {
        formData.append("screenshotFile", newEvidence._file);
      } else {
        formData.append("screenshotUrl", newEvidence.screenshotUrl);
      }
      const { data } = await api.post(
        `/admin/trends/${trendId}/evidence`,
        formData,
        { headers: { ...authHeader().headers, "Content-Type": "multipart/form-data" } }
      );
      setEvidence((p) => [...p, data.evidence]);
      setNewEvidence(EMPTY_EVIDENCE);
      toast.success("Evidence added.", { containerId: TOAST_ID });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.", { containerId: TOAST_ID });
    } finally { setSaving(false); }
  };



  const deleteEvidence = async (eid) => {
    if (!confirm("Delete this evidence?")) return;
    try {
      await api.delete(`/admin/trends/${trendId}/evidence/${eid}`, authHeader());
      setEvidence((p) => p.filter((e) => e._id !== eid));
      toast.success("Deleted.", { containerId: TOAST_ID });
    } catch { toast.error("Failed to delete.", { containerId: TOAST_ID }); }
  };


  const addComment = async () => {
    if (!newComment.commentText) {
      toast.error("Comment text is required.", { containerId: TOAST_ID }); return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("platform", newComment.platform);
      formData.append("authorHandle", newComment.authorHandle);
      formData.append("commentText", newComment.commentText);
      formData.append("likeCount", newComment.likeCount);
      formData.append("capturedAt", newComment.capturedAt);
      if (newComment._file) {
        formData.append("commentVideoFile", newComment._file);
      } else {
        formData.append("sourceVideoUrl", newComment.sourceVideoUrl);
      }
      const { data } = await api.post(
        `/admin/trends/${trendId}/comments`,
        formData,
        { headers: { ...authHeader().headers, "Content-Type": "multipart/form-data" } }
      );
      setComments((p) => [...p, data.comment]);
      setNewComment(EMPTY_COMMENT);
      toast.success("Comment added.", { containerId: TOAST_ID });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.", { containerId: TOAST_ID });
    } finally { setSaving(false); }
  };



  const deleteComment = async (cid) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/admin/trends/${trendId}/comments/${cid}`, authHeader());
      setComments((p) => p.filter((c) => c._id !== cid));
      toast.success("Deleted.", { containerId: TOAST_ID });
    } catch { toast.error("Failed to delete.", { containerId: TOAST_ID }); }
  };

  
  const addVideo = async () => {
    if (!newVideo._file && !newVideo.videoUrl) {
      toast.error("Upload a video file or paste a URL.", { containerId: TOAST_ID }); return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("creatorHandle", newVideo.creatorHandle);
      formData.append("viewCount", newVideo.viewCount);
      formData.append("commentCount", newVideo.commentCount);
      formData.append("capturedAt", newVideo.capturedAt);
      if (newVideo._file) {
        formData.append("videoFile", newVideo._file);
      } else {
        formData.append("videoUrl", newVideo.videoUrl);
      }
      const { data } = await api.post(
        `/admin/trends/${trendId}/videos`,
        formData,
        { headers: { ...authHeader().headers, "Content-Type": "multipart/form-data" } }
      );
      setVideos((p) => [...p, data.video]);
      setNewVideo(EMPTY_VIDEO);
      toast.success("Video added.", { containerId: TOAST_ID });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.", { containerId: TOAST_ID });
    } finally { setSaving(false); }
  };


  const deleteVideo = async (vid) => {
    if (!confirm("Delete this video?")) return;
    try {
      await api.delete(`/admin/trends/${trendId}/videos/${vid}`, authHeader());
      setVideos((p) => p.filter((v) => v._id !== vid));
      toast.success("Deleted.", { containerId: TOAST_ID });
    } catch { toast.error("Failed to delete.", { containerId: TOAST_ID }); }
  };

  const TABS = [
    { key: "evidence", label: `Screenshots (${evidence.length})` },
    { key: "comments", label: `Comments (${comments.length})` },
    { key: "videos",   label: `Videos (${videos.length})` },
  ];

  return (
    <div className="mt-10 border-t border-zinc-800 pt-8">
      <h3 className="text-base font-black text-white mb-1">Proof of Detection</h3>
      <p className="text-xs text-zinc-500 mb-5">
        Add evidence that proves this trend was detected early — screenshots, comments, and video links.
      </p>

   
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              tab === t.key ? "text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
            style={tab === t.key ? { background: "#D4F244" } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loadingProof ? (
        <p className="text-zinc-600 text-sm">Loading…</p>
      ) : (
        <>
         
          {tab === "evidence" && (
            <div className="space-y-4">
             
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Add Screenshot</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Platform</label>
                    <select
                      value={newEvidence.platform}
                      onChange={(e) => setNewEvidence((p) => ({ ...p, platform: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
                    >
                      {["tiktok", "reddit", "google", "youtube", "other"].map((pl) => (
                        <option key={pl} value={pl}>{pl}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Captured Date *</label>
                    <input
                      type="date"
                      value={newEvidence.capturedAt}
                      onChange={(e) => setNewEvidence((p) => ({ ...p, capturedAt: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>

              
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Screenshot</label>
                  {newEvidence._file ? (
                    <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
                      <span className="text-xs text-[#D4F244] truncate flex-1">{newEvidence._file.name}</span>
                      <button
                        onClick={() => setNewEvidence((p) => ({ ...p, _file: null }))}
                        className="text-xs text-zinc-500 hover:text-red-400"
                      >✕</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Paste image URL (https://…)"
                        value={newEvidence.screenshotUrl}
                        onChange={(e) => setNewEvidence((p) => ({ ...p, screenshotUrl: e.target.value }))}
                        className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm outline-none"
                      />
                      <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <span className="text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-xl px-3 py-2 transition">
                          📁 Upload Image
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) setNewEvidence((p) => ({ ...p, _file: file, screenshotUrl: "" }));
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Page URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newEvidence.pageUrl}
                    onChange={(e) => setNewEvidence((p) => ({ ...p, pageUrl: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <button
                  onClick={addEvidence}
                  disabled={saving}
                  className="text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50"
                  style={{ background: "#D4F244", color: "#000" }}
                >
                  {saving ? "Adding…" : "+ Add Evidence"}
                </button>
              </div>

           
              {evidence.length === 0 ? (
                <p className="text-zinc-600 text-sm">No evidence yet.</p>
              ) : (
                <div className="space-y-2">
                  {evidence.map((e) => (
                    <div key={e._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-xs font-bold capitalize text-zinc-400">{e.platform}</span>
                        <span className="text-zinc-600 text-xs ml-2">{e.capturedAt?.slice(0, 10)}</span>
                        {e.screenshotUrl && (
                          <a href={e.screenshotUrl} target="_blank" rel="noreferrer"
                            className="block text-xs text-[#D4F244] hover:underline truncate mt-0.5">
                            {e.screenshotUrl}
                          </a>
                        )}
                        {e.pageUrl && (
                          <a href={e.pageUrl} target="_blank" rel="noreferrer"
                            className="block text-xs text-zinc-500 hover:underline truncate">
                            {e.pageUrl}
                          </a>
                        )}
                      </div>
                      <button onClick={() => deleteEvidence(e._id)}
                        className="text-xs text-zinc-600 hover:text-red-400 transition flex-shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

         
          {tab === "comments" && (
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Add Comment</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Platform</label>
                    <select
                      value={newComment.platform}
                      onChange={(e) => setNewComment((p) => ({ ...p, platform: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
                    >
                      {["tiktok", "youtube", "reddit", "other"].map((pl) => (
                        <option key={pl} value={pl}>{pl}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Author Handle</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={newComment.authorHandle}
                      onChange={(e) => setNewComment((p) => ({ ...p, authorHandle: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Comment Text *</label>
                  <textarea
                    rows={2}
                    placeholder="Paste the comment here..."
                    value={newComment.commentText}
                    onChange={(e) => setNewComment((p) => ({ ...p, commentText: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Like Count</label>
                    <input
                      type="number"
                      value={newComment.likeCount}
                      onChange={(e) => setNewComment((p) => ({ ...p, likeCount: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Captured Date *</label>
                    <input
                      type="date"
                      value={newComment.capturedAt}
                      onChange={(e) => setNewComment((p) => ({ ...p, capturedAt: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Source Video</label>
                  {newComment._file ? (
                    <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
                      <span className="text-xs text-[#D4F244] truncate flex-1">{newComment._file.name}</span>
                      <button
                        onClick={() => setNewComment((p) => ({ ...p, _file: null }))}
                        className="text-xs text-zinc-500 hover:text-red-400"
                      >✕</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Paste video URL (https://tiktok.com/…)"
                        value={newComment.sourceVideoUrl}
                        onChange={(e) => setNewComment((p) => ({ ...p, sourceVideoUrl: e.target.value }))}
                        className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm outline-none"
                      />
                      <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <span className="text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-xl px-3 py-2 transition">
                          📁 Upload Video
                        </span>
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) setNewComment((p) => ({ ...p, _file: file, sourceVideoUrl: "" }));
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <button
                  onClick={addComment}
                  disabled={saving}
                  className="text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50"
                  style={{ background: "#D4F244", color: "#000" }}
                >
                  {saving ? "Adding…" : "+ Add Comment"}
                </button>
              </div>

              {comments.length === 0 ? (
                <p className="text-zinc-600 text-sm">No comments yet.</p>
              ) : (
                <div className="space-y-2">
                  {comments.map((c) => (
                    <div key={c._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-zinc-400">@{c.authorHandle || "unknown"}</span>
                          <span className="text-xs text-zinc-600 capitalize">{c.platform}</span>
                          {c.likeCount > 0 && <span className="text-xs text-zinc-600">♥ {c.likeCount}</span>}
                          <span className="text-xs text-zinc-700">{c.capturedAt?.slice(0, 10)}</span>
                        </div>
                        <p className="text-sm text-zinc-300">{c.commentText}</p>
                        {c.sourceVideoUrl && (
                          <a href={c.sourceVideoUrl} target="_blank" rel="noreferrer"
                            className="text-xs text-[#D4F244] hover:underline mt-0.5 block truncate">
                            {c.sourceVideoUrl}
                          </a>
                        )}
                      </div>
                      <button onClick={() => deleteComment(c._id)}
                        className="text-xs text-zinc-600 hover:text-red-400 transition flex-shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        
          {tab === "videos" && (
            <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Add Video</p>

              
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Video *</label>
                  {newVideo._file ? (
                    <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
                      <span className="text-xs text-[#D4F244] truncate flex-1">{newVideo._file.name}</span>
                      <button
                        onClick={() => setNewVideo((p) => ({ ...p, _file: null }))}
                        className="text-xs text-zinc-500 hover:text-red-400"
                      >✕</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Paste video URL (https://tiktok.com/…)"
                        value={newVideo.videoUrl}
                        onChange={(e) => setNewVideo((p) => ({ ...p, videoUrl: e.target.value }))}
                        className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm outline-none"
                      />
                      <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <span className="text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-xl px-3 py-2 transition">
                          📁 Upload Video
                        </span>
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) setNewVideo((p) => ({ ...p, _file: file, videoUrl: "" }));
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Creator Handle</label>
                    <input
                      type="text"
                      placeholder="@creator"
                      value={newVideo.creatorHandle}
                      onChange={(e) => setNewVideo((p) => ({ ...p, creatorHandle: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">View Count</label>
                    <input
                      type="number"
                      value={newVideo.viewCount}
                      onChange={(e) => setNewVideo((p) => ({ ...p, viewCount: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Comment Count</label>
                    <input
                      type="number"
                      value={newVideo.commentCount}
                      onChange={(e) => setNewVideo((p) => ({ ...p, commentCount: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Captured Date</label>
                    <input
                      type="date"
                      value={newVideo.capturedAt}
                      onChange={(e) => setNewVideo((p) => ({ ...p, capturedAt: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={addVideo}
                  disabled={saving}
                  className="text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50"
                  style={{ background: "#D4F244", color: "#000" }}
                >
                  {saving ? "Adding…" : "+ Add Video"}
                </button>
              </div>

              {videos.length === 0 ? (
                <p className="text-zinc-600 text-sm">No videos yet.</p>
              ) : (
                <div className="space-y-2">
                  {videos.map((v) => (
                    <div key={v._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-400 mb-0.5">@{v.creatorHandle || "unknown"}</p>
                        <div className="flex gap-3 text-xs text-zinc-600 mb-1">
                          {v.viewCount > 0 && <span>👁 {v.viewCount.toLocaleString()}</span>}
                          {v.commentCount > 0 && <span>💬 {v.commentCount.toLocaleString()}</span>}
                        </div>
                        <a href={v.videoUrl} target="_blank" rel="noreferrer"
                          className="text-xs text-[#D4F244] hover:underline truncate block">
                          {v.videoUrl}
                        </a>
                      </div>
                      <button onClick={() => deleteVideo(v._id)}
                        className="text-xs text-zinc-600 hover:text-red-400 transition flex-shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}


export default function TrendForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [createdId, setCreatedId] = useState(null);

  useEffect(() => {
    fetchMeta();
    if (isEdit) fetchTrend();
  }, []);

  const fetchMeta = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        api.get("/admin/categories", authHeader()),
        api.get("/admin/tags", authHeader()),
      ]);
      setCategories(catRes.data.categories || []);
      setAllTags(tagRes.data.tags || []);
    } catch {
      toast.error("Failed to load categories/tags.", { containerId: TOAST_ID });
    }
  };

  const fetchTrend = async () => {
    try {
      const { data } = await api.get(`/admin/trend/${id}`, authHeader());
      const t = data.trend;
      setForm({
        title:       t.title || "",
        slug:        t.slug || "",
        description: t.description || "",
        category:    t.category?._id || t.category || "",
        tags:        (t.tags || []).map((tg) => tg._id || tg).join(", "),
        rfciScore:   t.rfciScore ?? "",
        rfciType:    t.rfciType || "",
        growthRate:  t.growthRate ?? 0,
        status:      t.status || "detected",
        purpose:     t.purpose || "",   
        isHidden:    t.isHidden || false,
        isPublished: t.isPublished || false,
      });
    } catch {
      toast.error("Failed to load trend.", { containerId: TOAST_ID });
    } finally {
      setFetching(false);
    }
  };

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleTitleChange = (val) => {
    set("title", val);
    if (!isEdit) {
      set("slug", val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug || !form.category) {
      toast.error("Title, slug, and category are required.", { containerId: TOAST_ID });
      return;
    }
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
      rfciScore: form.rfciScore !== "" ? Number(form.rfciScore) : undefined,
      growthRate: Number(form.growthRate),
    };
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/admin/trends/${id}`, payload, authHeader());
        toast.success("Trend updated!", { containerId: TOAST_ID });
      } else {
        const { data } = await api.post("/admin/trends", payload, authHeader());
       console.log(data)
        toast.success("Trend created! You can now add proof below.", { containerId: TOAST_ID });
        setCreatedId(data.trend._id);
      }
     
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.", { containerId: TOAST_ID });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Loading trend…</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer containerId={TOAST_ID} position="top-center" autoClose={4000} theme="dark" />
      <div className="bg-black text-white min-h-screen">
        <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h1 className="font-black text-white text-xl tracking-tight">
            TikTok<span className="text-[#D4F244]">Slang</span>
            <span className="text-zinc-500 text-sm font-normal ml-2">Admin</span>
          </h1>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm text-zinc-500 hover:text-white transition px-3 py-2 rounded-xl border border-zinc-800 hover:border-zinc-600"
          >
            ← Dashboard
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8">
          <h2 className="text-xl font-black mb-1">{isEdit ? "Edit Trend" : "New Trend"}</h2>
          <p className="text-zinc-500 text-xs mb-8">
            {isEdit ? "Update the trend details below." : "Fill in the details to create a new trend."}
          </p>

          <div className="space-y-5">
            <Field label="Title *">
              <input type="text" placeholder="e.g. NPC Streaming" value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition" />
            </Field>

            <Field label="Slug *" hint="URL-friendly identifier">
              <input type="text" placeholder="npc-streaming" value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition font-mono" />
            </Field>

            <Field label="Description">
              <textarea placeholder="What is this trend about?" value={form.description}
                onChange={(e) => set("description", e.target.value)} rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition resize-none" />
            </Field>

            <Field label="Category *">
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition">
                <option value="">Select a category…</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>

            <Field label="Tags" hint={allTags.length ? `Available: ${allTags.map(t => t.name).join(", ")}` : ""}>
              <input type="text" placeholder="tag1, tag2, tag3" value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="RFCI Score">
                <input type="number" placeholder="0–100" value={form.rfciScore}
                  onChange={(e) => set("rfciScore", e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition" />
              </Field>
              <Field label="RFCI Type">
                <select value={form.rfciType} onChange={(e) => set("rfciType", e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition">
                  <option value="">None</option>
                  {RFCI_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Growth Rate">
                <input type="number" placeholder="0" value={form.growthRate}
                  onChange={(e) => set("growthRate", e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition" />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => set("status", e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </Field>

              <Field label="Purpose" hint="What is this trend useful for?">
              <select value={form.purpose} onChange={(e) => set("purpose", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition">
                <option value="">None</option>
                {PURPOSE_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p.replace(/_/g, " ")}</option>
                ))}
              </select>
            </Field>
            </div>

            <div className="flex gap-4">
              <Toggle label="Published" value={form.isPublished} onChange={(v) => set("isPublished", v)} />
              <Toggle label="Hidden" value={form.isHidden} onChange={(v) => set("isHidden", v)} />
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full font-bold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50 mt-2"
              style={{ background: "#D4F244", color: "#000", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save Changes" : "Create Trend"}
            </button>
          </div>

         
          {(isEdit || createdId) && (
  <>
    {createdId && (
      <p className="mt-8 text-xs text-[#D4F244] bg-[#1a2e0a] border border-[#3a5c14] rounded-xl px-4 py-3">
        ✓ Trend created. Add proof below, or{" "}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="underline hover:no-underline"
        >
          return to dashboard
        </button>.
      </p>
    )}
    <ProofSection trendId={isEdit ? id : createdId} />
  </>
)}
        </div>
      </div>
    </>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-zinc-500">{label}</label>
        {hint && <span className="text-xs text-zinc-600">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition"
      style={{
        borderColor: value ? "#3a5c14" : "#3f3f46",
        color: value ? "#D4F244" : "#71717a",
        background: value ? "#1a2e0a" : "transparent",
        cursor: "pointer",
      }}>
      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
        style={{ borderColor: value ? "#D4F244" : "#52525b" }}>
        {value && <span className="w-2 h-2 rounded-full" style={{ background: "#D4F244" }} />}
      </span>
      {label}
    </button>
  );
}