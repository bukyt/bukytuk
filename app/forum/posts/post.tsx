"use client";

interface PostProps {
  post: any;
  onVote: (postId: number, value: number) => void;
  onOpen: (post: any) => void;
  userId: number | null;
}

export default function PostCard({ post, onVote, onOpen, userId }: PostProps) {
  const score = (post.votes || []).reduce((a: number, b: any) => a + b.value, 0);
  
  const currentUserVote = userId ? post.votes?.find((v: any) => v.userId === userId)?.value : undefined;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md mb-4 flex overflow-hidden hover:border-gray-500 transition-colors">
      {/* Vote Sidebar */}
      <div className="bg-gray-800/50 p-2 flex flex-col items-center border-r border-gray-700 w-12">
        <button 
          onClick={() => onVote(post.id, 1)}
          className={`${currentUserVote === 1 ? 'text-orange-500' : 'text-gray-400'} hover:text-orange-500 transition-colors`}
          title="Upvote"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill={currentUserVote === 1 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        
        <span className={`font-bold my-1 ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : 'text-gray-300'}`}>
          {score}
        </span>

        <button 
          onClick={() => onVote(post.id, -1)}
          className={`${currentUserVote === -1 ? 'text-blue-500' : 'text-gray-400'} hover:text-blue-500 transition-colors`}
          title="Downvote"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill={currentUserVote === -1 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 cursor-pointer" onClick={() => onOpen(post)}>
        <div className="flex items-center gap-2 mb-1">
          {/* UPDATED: Showing username instead of authorId */}
          <span className="text-xs text-orange-400 font-bold">
            u/{post.author?.username || `user_${post.authorId}`}
          </span>
          <span className="text-xs text-gray-600">•</span>
          <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
        <p className="text-gray-300 line-clamp-3 text-sm leading-relaxed">
          {post.content}
        </p>
        
        {/* Media Preview */}
        {post.media && post.media.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {post.media.map((m: any) => {
              const isImage = m.mimetype.startsWith("image/");
              const isVideo = m.mimetype.startsWith("video/");
              
              if (isImage) {
                return (
                  <img 
                    key={m.id}
                    src={m.filepath} 
                    alt={m.filename}
                    className="max-h-[33vh] w-auto object-contain rounded border border-gray-600"
                  />
                );
              } else if (isVideo) {
                return (
                  <video 
                    key={m.id}
                    src={m.filepath}
                    className="max-h-[33vh] w-auto object-contain rounded border border-gray-600"
                  />
                );
              } else {
                return (
                  <div key={m.id} className="h-16 w-16 bg-gray-700 rounded border border-gray-600 flex items-center justify-center text-center">
                    <span className="text-[10px] text-gray-400">{m.filename.split('.').pop()}</span>
                  </div>
                );
              }
            })}
          </div>
        )}
        
        <div className="mt-4 flex items-center text-gray-500 text-xs font-bold gap-4">
            <div className="flex items-center gap-1 hover:bg-gray-700 p-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {(post.replies || []).length} Comments
            </div>
        </div>
      </div>
    </div>
  );
}