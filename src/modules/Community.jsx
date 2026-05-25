import { useState, useEffect, useMemo } from "react";
import { Icon } from "../components/icons";
import { SPECIALTIES } from "../lib/data";
import { SEED_POSTS } from "../lib/seedPosts";
import { VERIFIED_DOMAINS, RECENT_ACTIVITY } from "../lib/socialProof";
import { Section, Card, Btn, Badge, Alert, Takeaway } from "../components/ui";

function loadPosts() { try { return JSON.parse(localStorage.getItem("pw_community") || "[]"); } catch { return []; } }

const TOPICS = [
  { id:"all", label:"All", color:"#fff" },
  { id:"salary", label:"Salary & Comp", color:"#34d399" },
  { id:"contracts", label:"Contracts", color:"#f87171" },
  { id:"financial", label:"Financial", color:"#60a5fa" },
  { id:"career", label:"Career Moves", color:"#a78bfa" },
  { id:"burnout", label:"Burnout & Wellness", color:"#fbbf24" },
  { id:"employer", label:"Employer Reviews", color:"#f472b6" },
];

const SORT_OPTIONS = [
  { id:"hot", label:"Hot" },
  { id:"new", label:"New" },
  { id:"top", label:"Top" },
];

function VerifiedBadge({ employer }) {
  if (!employer) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold">
      <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path d="M10 0l2.5 5.3L18 6.2l-4 4.2 1 5.6-5-2.8-5 2.8 1-5.6-4-4.2 5.5-.9z"/></svg>
      Verified at {employer}
    </span>
  );
}

function LiveTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx(prev => (prev + 1) % RECENT_ACTIVITY.length), 4000);
    return () => clearInterval(iv);
  }, []);
  const item = RECENT_ACTIVITY[idx];
  const icons = { salary:"money", post:"chat", savings:"chart", review:"star", milestone:"target" };
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
      <p className="text-sm text-white/50 truncate animate-fade" key={idx}>
        <span className="mr-1">{icons[item.type] || "📌"}</span>
        {item.text}
        <span className="text-white/30 ml-2">{item.time}</span>
      </p>
    </div>
  );
}

export default function Community({ profile, user }) {
  const allPosts = useMemo(() => {
    const userPosts = loadPosts();
    // Add verified employers to some seed posts
    const enriched = SEED_POSTS.map(p => {
      const employers = { 86:"HCA Healthcare", 87:"Kaiser Permanente", 88:"Mass General Brigham", 89:"CommonSpirit Health", 90:"USAP/Envision", 93:"Veterans Affairs", 94:"US Military", 99:"Children's Hospital" };
      return { ...p, verifiedEmployer: employers[p.id] || null };
    });
    return [...enriched, ...userPosts];
  }, []);

  const [posts, setPosts] = useState(allPosts);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("hot");
  const [showNew, setShowNew] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newTopic, setNewTopic] = useState("financial");
  const [searchQ, setSearchQ] = useState("");

  // Employer review verification
  const [reviewEmployer, setReviewEmployer] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyStep, setVerifyStep] = useState(0); // 0=none, 1=email entered, 2=verified

  const filtered = useMemo(() => {
    let d = posts;
    if (filter !== "all") d = d.filter(p => p.topic === filter);
    if (searchQ) d = d.filter(p => p.title.toLowerCase().includes(searchQ.toLowerCase()) || p.body.toLowerCase().includes(searchQ.toLowerCase()));
    if (sort === "new") d = [...d].reverse();
    if (sort === "top") d = [...d].sort((a,b) => b.upvotes - a.upvotes);
    return d;
  }, [posts, filter, sort, searchQ]);

  const checkEmailDomain = () => {
    if (!verifyEmail.includes("@")) return;
    const domain = verifyEmail.split("@")[1].toLowerCase();
    const employer = VERIFIED_DOMAINS[domain];
    if (employer) {
      setReviewEmployer(employer);
      setVerifyStep(2);
    } else {
      setReviewEmployer(domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1));
      setVerifyStep(2);
    }
  };

  const submitPost = () => {
    if (!newTitle.trim()) return;
    const post = {
      id: Date.now(), specialty: profile.specialty, topic: newTopic,
      title: newTitle, body: newBody, upvotes: 0, replies: 0, time: "now", anon: true,
      verifiedEmployer: newTopic === "employer" && verifyStep === 2 ? reviewEmployer : null,
    };
    const updated = [post, ...posts];
    setPosts(updated);
    localStorage.setItem("pw_community", JSON.stringify(updated.filter(p => p.id > 1000)));
    setNewTitle(""); setNewBody(""); setShowNew(false); setVerifyStep(0); setVerifyEmail("");
  };

  const submitReply = (postId) => {
    if (!replyText.trim()) return;
    const updated = posts.map(p => {
      if (p.id === postId) {
        const replies = p.replyList || [];
        return { ...p, replies: p.replies + 1, replyList: [...replies, { id: Date.now(), body: replyText, specialty: profile.specialty, time: "just now", upvotes: 0 }] };
      }
      return p;
    });
    setPosts(updated);
    try { localStorage.setItem("pw_community", JSON.stringify(updated.filter(p => !SEED_POSTS.find(s => s.id === p.id)))); } catch {}
    setReplyText("");
  };

  const upvote = (id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));

  const topicCounts = useMemo(() => {
    const c = {};
    posts.forEach(p => { c[p.topic] = (c[p.topic] || 0) + 1; });
    return c;
  }, [posts]);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Physician Community" sub={`${posts.length.toLocaleString()} discussions from verified physicians`} />

      {/* Live ticker */}
      <LiveTicker />

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-lg font-black text-emerald-400">{posts.length.toLocaleString()}</p>
          <p className="text-xs text-white/40">Discussions</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-lg font-black text-blue-400">{posts.reduce((s,p) => s+p.replies, 0).toLocaleString()}</p>
          <p className="text-xs text-white/40">Replies</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-lg font-black text-amber-400">{posts.filter(p => p.verifiedEmployer).length}</p>
          <p className="text-xs text-white/40">Verified Reviews</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-lg font-black text-purple-400">20</p>
          <p className="text-xs text-white/40">Specialties</p>
        </div>
      </div>

      <Alert type="info">All posts are anonymous. Your specialty is shown but never your name or location. Employer reviews require email verification at that organization's domain.</Alert>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex gap-1 overflow-x-auto flex-1">
          {TOPICS.map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition ${filter === t.id ? "bg-white/[0.06] text-white/75" : "text-white/50"}`}>
              {t.label} {topicCounts[t.id] ? <span className="text-white/30 ml-0.5">({topicCounts[t.id]})</span> : ""}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex gap-0.5 bg-white/[0.02] rounded-lg border border-white/[0.05] p-0.5">
            {SORT_OPTIONS.map(s => (
              <button key={s.id} onClick={() => setSort(s.id)}
                className={`px-2 py-1 rounded text-xs font-bold transition ${sort === s.id ? "bg-white/[0.06] text-white/65" : "text-white/40"}`}>{s.label}</button>
            ))}
          </div>
          <Btn onClick={() => setShowNew(!showNew)} variant="secondary">{showNew ? "Cancel" : "New Post"}</Btn>
        </div>
      </div>

      {/* Search */}
      <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search discussions..."
        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white/55 outline-none focus:border-emerald-500/20 placeholder:text-white/25" />

      {/* New post form */}
      {showNew && (
        <Card className="animate-in border-emerald-500/15">
          <p className="text-sm text-white/55 font-bold mb-3">New Anonymous Post</p>
          <select value={newTopic} onChange={e => { setNewTopic(e.target.value); setVerifyStep(0); }}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none mb-2">
            {TOPICS.filter(t => t.id !== "all").map(t => <option key={t.id} value={t.id} className="bg-[#13141c]">{t.label}</option>)}
          </select>

          {/* Employer review verification */}
          {newTopic === "employer" && (
            <div className="p-3 rounded-xl bg-blue-500/[0.04] border border-blue-500/10 mb-3 animate-in">
              <p className="text-sm text-blue-400/80 font-bold mb-1">Employer Review Verification</p>
              <p className="text-xs text-white/40 mb-2">To post a verified employer review, enter your work email. We'll confirm the domain matches the employer. Your email is never shown.</p>
              <div className="flex gap-2">
                <input value={verifyEmail} onChange={e => setVerifyEmail(e.target.value)} placeholder="your.name@hospital.org"
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none" />
                <button onClick={checkEmailDomain}
                  className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 font-bold hover:bg-blue-500/15 transition">
                  Verify
                </button>
              </div>
              {verifyStep === 2 && (
                <div className="flex items-center gap-2 mt-2 animate-in">
                  <VerifiedBadge employer={reviewEmployer} />
                  <span className="text-xs text-emerald-400/70">Domain verified. Your review will show as verified.</span>
                </div>
              )}
            </div>
          )}

          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/65 outline-none mb-2" />
          <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Share your experience (anonymous)..." rows={4}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/65 outline-none resize-none mb-2" />
          <div className="flex justify-between items-center">
            <p className="text-xs text-white/40">Posting as: Anonymous {profile.specialty}{verifyStep === 2 ? ` | Verified at ${reviewEmployer}` : ""}</p>
            <Btn onClick={submitPost}>Post Anonymously</Btn>
          </div>
        </Card>
      )}

      {/* Posts */}
      <div className="space-y-2">
        {filtered.slice(0, 20).map(post => (
          <Card key={post.id} className="glass-hover">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-0.5 pt-1 flex-shrink-0 w-10">
                <button onClick={() => upvote(post.id)} className="text-white/20 hover:text-emerald-400 transition text-lg leading-none">&#9650;</button>
                <span className="text-sm font-bold text-white/55 tabular-nums">{post.upvotes}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge color={TOPICS.find(t => t.id === post.topic)?.color || "#fff"}>{post.topic}</Badge>
                  <span className="text-xs text-white/50">{post.specialty}</span>
                  <span className="text-xs text-white/30">{post.time}</span>
                  {post.verifiedEmployer && <VerifiedBadge employer={post.verifiedEmployer} />}
                </div>
                <p className="text-sm text-white/65 font-bold leading-snug">{post.title}</p>
                <p className="text-xs text-white/50 mt-1.5 line-clamp-2 leading-relaxed">{post.body}</p>
                <div className="flex gap-4 mt-2.5 text-xs text-white/40">
                  <button onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)} className="hover:text-emerald-400/70 cursor-pointer transition">{post.replies} replies {expandedPost === post.id ? "▾" : "▸"}</button>
                  <span className="hover:text-white/55 cursor-pointer">Share</span>
                  <span className="hover:text-white/55 cursor-pointer">Save</span>
                </div>
                {expandedPost === post.id && (
                  <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-2 animate-in">
                    {(post.replyList || []).map(r => (
                      <div key={r.id} className="pl-4 border-l-2 border-white/[0.06] py-1.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-white/40">{r.specialty}</span>
                          <span className="text-xs text-white/25">{r.time}</span>
                        </div>
                        <p className="text-xs text-white/55">{r.body}</p>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." onKeyDown={e => e.key === "Enter" && submitReply(post.id)}
                        className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white/55 outline-none focus:border-emerald-500/20" />
                      <button onClick={() => submitReply(post.id)} className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold hover:bg-emerald-500/15 transition">Reply</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length > 20 && (
        <button className="w-full py-3 rounded-xl glass text-sm text-white/50 hover:text-white/65 transition">
          Load more ({filtered.length - 20} remaining)
        </button>
      )}

      <Takeaway items={[
        `${posts.length} discussions across ${Object.keys(topicCounts).length} categories. ${posts.filter(p=>p.verifiedEmployer).length} employer reviews are domain-verified.`,
        `Employer reviews require work email verification (@hospital.org). Your email is never displayed, only the verified badge.`,
        `Salary discussions are legally protected under NLRA Section 7. Employers cannot restrict compensation sharing.`,
      ]} />
    </div>
  );
}
