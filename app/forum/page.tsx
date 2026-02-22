"use client";
import { useState, useEffect } from "react";
import PostCard from "./posts/post";
import ReplyItem from "./components/ReplyItem";

export default function ForumPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ id: number | null, name: string | null }>({ id: null, name: null });
  const [sortBy, setSortBy] = useState<"new" | "top" | "trending">("new");
  const [userId, setUserId] = useState<number | null>(null);

  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    if (res.ok) {
      const data = await res.json();
      setPosts(data);
      if (selectedPost) {
        const updated = data.find((p: any) => p.id === selectedPost.id);
        if (updated) setSelectedPost(updated);
      }
    }
  };

  const fetchCurrentUser = async () => {
    const res = await fetch("/api/me");
    if (res.ok) {
      const user = await res.json();
      setUserId(user.id);
    }
  };

  useEffect(() => { 
    fetchCurrentUser();
    fetchPosts(); 
  }, []);

  const getSortedPosts = (postsToSort: any[]) => {
    const now = Date.now();
    
    if (sortBy === "new") {
      return [...postsToSort].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    if (sortBy === "top") {
      return [...postsToSort].sort((a, b) => {
        const scoreA = (a.votes || []).reduce((acc: number, v: any) => acc + v.value, 0);
        const scoreB = (b.votes || []).reduce((acc: number, v: any) => acc + v.value, 0);
        return scoreB - scoreA;
      });
    }
    
    if (sortBy === "trending") {
      // Trending: higher score and recency matter
      return [...postsToSort].sort((a, b) => {
        const scoreA = (a.votes || []).reduce((acc: number, v: any) => acc + v.value, 0);
        const scoreB = (b.votes || []).reduce((acc: number, v: any) => acc + v.value, 0);
        
        const ageA = (now - new Date(a.createdAt).getTime()) / (1000 * 60 * 60); // hours
        const ageB = (now - new Date(b.createdAt).getTime()) / (1000 * 60 * 60); // hours
        
        // Trending score: votes / log(age + 2) to favor newer posts with votes
        const trendingA = scoreA / Math.log(ageA + 2);
        const trendingB = scoreB / Math.log(ageB + 2);
        
        return trendingB - trendingA;
      });
    }
    
    return [...postsToSort];
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, authorId: userId }),
    });
    
    if (!res.ok) return;
    
    const post = await res.json();
    
    // Upload files if any
    if (files.length > 0) {
      const formData = new FormData();
      formData.append("postId", String(post.id));
      files.forEach(file => formData.append("files", file));
      
      await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
    }
    
    setTitle(""); 
    setContent("");
    setFiles([]);
    fetchPosts();
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;
    
    if (!userId) return;
    await fetch("/api/replies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        postId: selectedPost.id, 
        parentId: replyTarget.id, 
        content: replyContent, 
        authorId: userId 
      }),
    });
    setReplyContent("");
    setReplyTarget({ id: null, name: null });
    fetchPosts();
  };

  const handleVote = async (id: number, value: number, type: "post" | "reply") => {
    let target;
    if (type === "post") {
      target = posts.find(p => p.id === id);
    } else {
      // Improved recursive flatten to find the reply anywhere in the tree
      const findAllReplies = (items: any[]): any[] => {
        let results: any[] = [];
        for (const item of items) {
          results.push(item);
          if (item.replies && item.replies.length > 0) {
            results = results.concat(findAllReplies(item.replies));
          }
        }
        return results;
      };
      
      const allReplies = findAllReplies(posts.flatMap(p => p.replies || []));
      target = allReplies.find(r => r.id === id);
    }

    if (!userId) return;
    const existingVote = target?.votes?.find((v: any) => v.userId === userId);
    const finalValue = existingVote?.value === value ? 0 : value;

    const res = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
        value: finalValue,
        postId: type === "post" ? id : null,
        replyId: type === "reply" ? id : null,
      }),
    });

    if (res.ok) fetchPosts();
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="w-full">
        <h1 className="text-3xl font-black mb-8 border-b border-gray-900 pb-4 italic tracking-tighter">Nypeldusfoorum</h1>
        <div className="flex gap-8">
          {/* Left sidebar - 20% */}
          <div className="w-1/5">
            <form onSubmit={handlePost} className="sticky top-8 flex flex-col gap-4 bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-2xl">
              <h3 className="font-bold text-lg text-green-500">Post Something</h3>
              <input className="p-2 rounded bg-black border border-gray-800 focus:border-green-500 outline-none transition-colors text-sm" value={title} onChange={e => setTitle(e.target.value)} placeholder="Subject" required />
              <textarea className="p-2 rounded bg-black border border-gray-800 focus:border-green-500 outline-none h-24 transition-colors resize-none text-sm" value={content} onChange={e => setContent(e.target.value)} placeholder="Message..." required />
              <input 
                type="file" 
                multiple 
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="p-2 rounded bg-black border border-gray-800 focus:border-green-500 outline-none text-gray-400 text-xs transition-colors"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
              {files.length > 0 && (
                <div className="text-xs text-green-400">
                  {files.length} file(s)
                </div>
              )}
              <button className="p-2 bg-green-600 rounded font-bold hover:bg-green-500 text-black transition-all uppercase text-xs tracking-widest">Broadcast</button>
            </form>
          </div>
          
          {/* Right content - 80% */}
          <div className="flex-1">
            <div className="mb-4 flex gap-2 bg-gray-900 p-3 rounded-xl border border-gray-800">
              <button
                onClick={() => setSortBy("new")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  sortBy === "new" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                New
              </button>
              <button
                onClick={() => setSortBy("top")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  sortBy === "top" 
                    ? "bg-orange-600 text-white" 
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Top
              </button>
              <button
                onClick={() => setSortBy("trending")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  sortBy === "trending" 
                    ? "bg-red-600 text-white" 
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Trending
              </button>
            </div>
            <div className="space-y-4">
              {getSortedPosts(posts).map(post => (
                <PostCard key={post.id} post={post} onVote={(id, val) => handleVote(id, val, "post")} onOpen={setSelectedPost} userId={userId} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-start p-4 md:p-12 z-50 overflow-auto">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl max-w-3xl w-full">
            <button onClick={() => { setSelectedPost(null); setReplyTarget({id: null, name: null}); }} className="text-gray-500 hover:text-white float-right transition-colors">✕</button>
            <h2 className="text-3xl font-bold mb-4 text-green-400 tracking-tight">{selectedPost.title}</h2>
            <p className="text-gray-400 text-lg mb-8 border-l-2 border-green-900 pl-4">{selectedPost.content}</p>
            
            {/* Media Display */}
            {selectedPost.media && selectedPost.media.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-col gap-4">
                  {selectedPost.media.map((m: any) => {
                    const isImage = m.mimetype.startsWith("image/");
                    const isVideo = m.mimetype.startsWith("video/");
                    
                    if (isImage) {
                      return (
                        <img 
                          key={m.id}
                          src={m.filepath} 
                          alt={m.filename}
                          className="max-w-full max-h-[33vh] w-auto h-auto object-contain rounded border border-gray-700 hover:border-gray-500 transition-colors"
                        />
                      );
                    } else if (isVideo) {
                      return (
                        <video 
                          key={m.id}
                          src={m.filepath}
                          controls
                          className="max-w-full max-h-[33vh] w-auto h-auto object-contain rounded border border-gray-700 hover:border-gray-500 transition-colors"
                        />
                      );
                    } else {
                      return (
                        <a
                          key={m.id}
                          href={m.filepath}
                          download={m.filename}
                          className="p-4 bg-gray-800 rounded border border-gray-700 hover:border-gray-500 transition-colors flex items-center gap-3"
                        >
                          <span className="text-2xl">📎</span>
                          <div className="flex-1">
                            <div className="font-semibold text-white text-sm truncate">{m.filename}</div>
                            <div className="text-xs text-gray-400">{m.mimetype}</div>
                          </div>
                        </a>
                      );
                    }
                  })}
                </div>
              </div>
            )}
            
            <div className="space-y-4 mb-8">
              {(selectedPost.replies ?? []).map((r: any) => (
                <ReplyItem 
                  key={r.id} 
                  reply={r} 
                  onVote={handleVote} 
                  onSetParent={(id, name) => setReplyTarget({ id, name })} 
                  currentUserId={userId || 0}
                />
              ))}
            </div>

            <form onSubmit={handleReply} className="sticky bottom-0 bg-gray-900 pt-6 border-t border-gray-800 flex flex-col gap-3">
              {replyTarget.id && (
                <div className="flex justify-between items-center bg-blue-900/20 border border-blue-900/50 px-4 py-2 rounded-lg text-[10px] text-blue-400 uppercase tracking-widest font-bold">
                  <span>Responding to u/{replyTarget.name}</span>
                  <button type="button" onClick={() => setReplyTarget({ id: null, name: null })}>Cancel</button>
                </div>
              )}
              <textarea 
                value={replyContent} 
                onChange={e => setReplyContent(e.target.value)} 
                placeholder="Write your response..." 
                className="p-4 rounded-xl bg-black text-white border border-gray-800 focus:border-blue-500 outline-none min-h-[120px] shadow-inner" 
                required 
              />
              <button className="p-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all uppercase text-xs tracking-widest shadow-lg shadow-blue-900/20">
                Send Reply
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}