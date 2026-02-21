"use client";

// Define interfaces locally to fix the "Module not found" error
interface Reply {
  id: number;
  content: string;
  authorId: number;
  author?: { username: string };
  createdAt: string;
  parentId?: number | null;
  replies: Reply[];
  votes: { userId: number; value: number }[];
}

interface ReplyItemProps {
  reply: Reply;
  onVote: (id: number, val: number, type: "reply") => void;
  onSetParent: (id: number, username: string) => void;
  currentUserId: number;
}

export default function ReplyItem({ reply, onVote, onSetParent, currentUserId }: ReplyItemProps) {
  // Calculate score: Sum of all vote values
  const voteScore = reply.votes?.reduce((acc, v) => acc + v.value, 0) || 0;
  
  // Find if the current logged-in user has voted on THIS specific reply
  const userVote = reply.votes?.find(v => v.userId === currentUserId)?.value || 0;

  return (
    <div className="pl-4 border-l border-gray-800 mt-4 transition-all">
      <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-800 hover:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-green-400 font-mono">
            u/{reply.author?.username || "anon"}
          </span>
          <div className="flex items-center gap-3 bg-black/40 px-2 py-1 rounded-md border border-gray-800">
            <button 
              onClick={() => onVote(reply.id, 1, "reply")} 
              className={`text-sm transition-colors ${userVote === 1 ? 'text-green-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              ▲
            </button>
            <span className="text-xs font-bold min-w-[12px] text-center">{voteScore}</span>
            <button 
              onClick={() => onVote(reply.id, -1, "reply")} 
              className={`text-sm transition-colors ${userVote === -1 ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              ▼
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{reply.content}</p>
        <button 
          onClick={() => onSetParent(reply.id, reply.author?.username || "anon")}
          className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-3 hover:text-blue-400"
        >
          Reply
        </button>
      </div>

      {/* Recursive Rendering for nested replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="ml-1">
          {reply.replies.map((sub) => (
            <ReplyItem 
              key={sub.id} 
              reply={sub} 
              onVote={onVote} 
              onSetParent={onSetParent}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}