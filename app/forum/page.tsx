"use client";
import { useState, useEffect } from "react";
import PostCard from "./posts/post";
import ReplyItem from "./components/ReplyItem";

export default function ForumPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ id: number | null, name: string | null }>({ id: null, name: null });

  const USER_ID = 1; // Temporary mock

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

  useEffect(() => { fetchPosts(); }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, authorId: USER_ID }),
    });
    setTitle(""); setContent("");
    fetchPosts();
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;
    
    await fetch("/api/replies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        postId: selectedPost.id, 
        parentId: replyTarget.id, 
        content: replyContent, 
        authorId: USER_ID 
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

    const existingVote = target?.votes?.find((v: any) => v.userId === USER_ID);
    const finalValue = existingVote?.value === value ? 0 : value;

    const res = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        value: finalValue,
        postId: type === "post" ? id : null,
        replyId: type === "reply" ? id : null,
      }),
    });

    if (res.ok) fetchPosts();
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8 border-b border-gray-900 pb-4 italic tracking-tighter">BUKYT FORUM</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 order-2 md:order-1">
            <form onSubmit={handlePost} className="sticky top-8 flex flex-col gap-4 bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-2xl">
              <h3 className="font-bold text-lg text-green-500">New Transmission</h3>
              <input className="p-2 rounded bg-black border border-gray-800 focus:border-green-500 outline-none transition-colors" value={title} onChange={e => setTitle(e.target.value)} placeholder="Subject" required />
              <textarea className="p-2 rounded bg-black border border-gray-800 focus:border-green-500 outline-none h-32 transition-colors resize-none" value={content} onChange={e => setContent(e.target.value)} placeholder="Message content..." required />
              <button className="p-2 bg-green-600 rounded font-bold hover:bg-green-500 text-black transition-all uppercase text-xs tracking-widest">Broadcast</button>
            </form>
          </div>
          <div className="md:col-span-2 order-1 md:order-2 space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onVote={(id, val) => handleVote(id, val, "post")} onOpen={setSelectedPost} />
            ))}
          </div>
        </div>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex justify-center items-start p-4 md:p-12 z-50 overflow-auto">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl max-w-3xl w-full">
            <button onClick={() => { setSelectedPost(null); setReplyTarget({id: null, name: null}); }} className="text-gray-500 hover:text-white float-right transition-colors">✕</button>
            <h2 className="text-3xl font-bold mb-4 text-green-400 tracking-tight">{selectedPost.title}</h2>
            <p className="text-gray-400 text-lg mb-8 border-l-2 border-green-900 pl-4">{selectedPost.content}</p>
            
            <div className="space-y-4 mb-8">
              {selectedPost.replies.filter((r: any) => !r.parentId).map((r: any) => (
                <ReplyItem 
                  key={r.id} 
                  reply={r} 
                  onVote={handleVote} 
                  onSetParent={(id, name) => setReplyTarget({ id, name })} 
                  currentUserId={USER_ID}
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