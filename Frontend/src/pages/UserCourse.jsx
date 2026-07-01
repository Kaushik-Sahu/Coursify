import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

// Vector icons for premium look
const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

export function UserCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Core states
  const [course, setCourse] = useState(location.state?.course || null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [sections, setSections] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // Comments feed states
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false);
  const videoRef = useRef(null);

  // Fetch course metadata, enrollment status, and syllabus
  const init = async () => {
    try {
      // 1. Load course metadata if missing from state
      let currentCourse = course;
      if (!currentCourse) {
        const coursesResponse = await api.get('/users/courses');
        currentCourse = coursesResponse.data.courses.find(c => c._id === courseId);
        if (!currentCourse) {
          throw new Error('Course not found');
        }
        setCourse(currentCourse);
      }

      // 2. Check enrollment status
      try {
        const profileResponse = await api.get('/users/me');
        const enrolledIds = profileResponse.data.user?.enrolledCourses || [];
        const enrolled = enrolledIds.includes(courseId);
        setIsEnrolled(enrolled);

        // 3. If enrolled, fetch classroom content
        if (enrolled) {
          const contentResponse = await api.get(`/users/courses/${courseId}/content`);
          const fetchedSections = contentResponse.data.sections || [];
          setSections(fetchedSections);

          // Find the first video of the first section to set as active video
          if (fetchedSections.length > 0) {
            // Expand first section by default
            setExpandedSections({ [fetchedSections[0]._id]: true });
            
            const firstSectionVideos = fetchedSections[0].videos || [];
            if (firstSectionVideos.length > 0) {
              setActiveVideo(firstSectionVideos[0]);
              setActiveSectionId(fetchedSections[0]._id);
            }
          }
        }
      } catch (authErr) {
        // Not authenticated
        setIsEnrolled(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, [courseId]);

  // Fetch comments when active video changes
  useEffect(() => {
    if (!activeVideo || !activeSectionId) {
      setComments([]);
      return;
    }

    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const response = await api.get(
          `/admin/courses/${courseId}/sections/${activeSectionId}/videos/${activeVideo._id}/comments?page=1&limit=10`
        );
        setComments(response.data.comments || []);
        setCommentsPage(1);
        setHasMoreComments((response.data.comments || []).length >= 10);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [activeVideo, activeSectionId, courseId]);

  const loadMoreComments = async () => {
    if (!hasMoreComments || commentsLoading) return;
    setCommentsLoading(true);
    try {
      const nextPage = commentsPage + 1;
      const response = await api.get(
        `/admin/courses/${courseId}/sections/${activeSectionId}/videos/${activeVideo._id}/comments?page=${nextPage}&limit=10`
      );
      const newComments = response.data.comments || [];
      if (newComments.length === 0) {
        setHasMoreComments(false);
      } else {
        setComments(prev => [...prev, ...newComments]);
        setCommentsPage(nextPage);
        if (newComments.length < 10) setHasMoreComments(false);
      }
    } catch (err) {
      console.error('Failed to load more comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsPlayerFullscreen(isFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Purchase handler
  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      // Direct post. In testing mode, no paymentId is required. In production, this will fail/error.
      await api.post(`/users/courses/${courseId}`);
      setIsEnrolled(true);
      
      // Load content immediately after enrolling
      const contentResponse = await api.get(`/users/courses/${courseId}/content`);
      const fetchedSections = contentResponse.data.sections || [];
      setSections(fetchedSections);

      if (fetchedSections.length > 0) {
        setExpandedSections({ [fetchedSections[0]._id]: true });
        const firstSectionVideos = fetchedSections[0].videos || [];
        if (firstSectionVideos.length > 0) {
          setActiveVideo(firstSectionVideos[0]);
          setActiveSectionId(fetchedSections[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to purchase course. Please complete payment.';
      alert(errMsg);
    } finally {
      setPurchasing(false);
    }
  };

  // Submit comment handler
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeVideo) return;

    try {
      const response = await api.post(
        `/admin/courses/${courseId}/sections/${activeSectionId}/videos/${activeVideo._id}/comments`,
        { text: newCommentText }
      );
      setComments([response.data.comment, ...comments]);
      setNewCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
      alert('Failed to post comment. Please try again.');
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0m 0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = '';
    if (hrs > 0) result += `${hrs}h `;
    if (mins > 0 || hrs > 0) result += `${mins}m `;
    result += `${secs}s`;
    return result;
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading course...</div>;
  }

  if (!course) {
    return <div className="text-center py-20 text-red-500">Course not found.</div>;
  }

  // ═══════════════════════════════════════════════════
  // VIEW: CLASSROOM DASHBOARD (ENROLLED STUDENT)
  // ═══════════════════════════════════════════════════
  if (isEnrolled) {
    return (
      <div className="min-h-screen bg-slate-955 text-slate-100 flex flex-col animate-fade-in text-left">
        {/* Top Navbar */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/purchased')}
              className="p-2 bg-slate-800 hover:bg-slate-705 text-slate-300 rounded-full transition border-0 cursor-pointer flex items-center justify-center active:scale-95"
              title="Back to my courses"
            >
              <BackIcon />
            </button>
            <div>
              <h2 className="text-lg font-bold truncate max-w-md">{course.title}</h2>
              <p className="text-xs text-slate-400 font-medium">Student Classroom Dashboard</p>
            </div>
          </div>
          <span className="text-xs bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 px-3 py-1 rounded-full font-bold">
            Enrolled
          </span>
        </header>

        {/* Workspace Panels split */}
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden max-h-[calc(100vh-73px)]">
          
          {/* LEFT: Video Player + Comments */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col">
            {activeVideo ? (
              <div className="flex flex-col flex-grow">
                {/* Responsive Player Box */}
                <div className="bg-black rounded-2xl overflow-hidden aspect-video w-full border border-slate-850 shadow-inner relative flex items-center justify-center transform translate-z-0 shrink-0">
                  <video 
                    ref={videoRef}
                    key={activeVideo._id}
                    src={activeVideo.videoUrl}
                    className="w-full h-full object-contain"
                    controls
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    autoPlay
                  />
                </div>

                {/* Video Info (hide in fullscreen) */}
                {!isPlayerFullscreen && (
                  <div className="mt-5 text-left shrink-0">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{activeVideo.title}</h1>
                    {activeVideo.description && (
                      <p className="text-sm text-slate-400 mt-2 bg-slate-900/40 p-4 rounded-xl border border-slate-900 leading-relaxed font-medium">
                        {activeVideo.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Discussion Q&A (hide in fullscreen) */}
                {!isPlayerFullscreen && (
                  <div className="border-t border-slate-900 mt-6 pt-6 text-left flex-grow flex flex-col min-h-[300px]">
                    <h3 className="font-extrabold text-white mb-4 flex items-center gap-2 text-base shrink-0">
                      <span>💬</span> Discussion ({comments.length})
                    </h3>

                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className="flex gap-3 mb-6 items-start shrink-0">
                      <textarea
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        placeholder="Ask a question or share your thoughts..."
                        className="flex-grow min-h-[48px] max-h-[120px] text-sm p-3.5 border border-slate-800 bg-slate-900/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/50 transition-all text-slate-100 resize-y font-medium placeholder-slate-500"
                        required
                      />
                      <button
                        type="submit"
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all border-0 cursor-pointer shadow-md shadow-indigo-600/10 active:scale-95 self-end"
                      >
                        Post
                      </button>
                    </form>

                    {/* Discussion List */}
                    <div className="flex-1 flex flex-col gap-4 pb-4">
                      {commentsLoading ? (
                        <div className="text-center py-6 text-xs text-slate-500">Loading discussion...</div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-sm text-slate-500 bg-slate-900/20 rounded-2xl border border-dashed border-slate-850">
                          No comments on this lesson yet. Be the first to start the discussion!
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {comments.map((comment) => (
                            <div key={comment._id} className="flex items-start gap-3.5 text-left animate-fade-in">
                              <div className="w-9 h-9 rounded-full bg-indigo-955/40 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 select-none shadow-sm border border-indigo-900/30">
                                {(comment.userId?.username || 'A').charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-slate-350">
                                    {comment.userId?.username || 'Deleted User'}
                                  </span>
                                  {(comment.userModel === 'Admin' || comment.userModel === 'SuperAdmin') && (
                                    <span className="text-[9px] bg-indigo-955/60 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-md font-extrabold tracking-wide uppercase">
                                      Instructor
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-550 font-semibold ml-auto">
                                    {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <div className="bg-slate-900/30 px-4 py-3 rounded-2xl border border-slate-900 mt-1 shadow-sm">
                                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {hasMoreComments && comments.length >= 10 && (
                            <button
                              onClick={loadMoreComments}
                              disabled={commentsLoading}
                              className="w-full py-3 mt-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
                            >
                              {commentsLoading ? 'Loading...' : 'Load more comments'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-grow py-20 text-slate-400">
                <span className="text-4xl mb-4">📺</span>
                <p className="text-base font-semibold">No lessons available in this course.</p>
              </div>
            )}
          </div>

          {/* RIGHT: Course Outline (Syllabus Accordion) */}
          <div className="w-full lg:w-[360px] bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
            <div className="p-4 border-b border-slate-800 shrink-0 text-left">
              <h4 className="font-extrabold text-white text-sm">Course Syllabus</h4>
              <p className="text-[11px] text-slate-405 mt-0.5">Select a lesson to start playing.</p>
            </div>
            
            <div className="flex-1 flex flex-col">
              {sections.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">No sections configured.</div>
              ) : (
                sections.map((section, idx) => {
                  const isExpanded = !!expandedSections[section._id];
                  return (
                    <div key={section._id} className="border-b border-slate-800 text-left">
                      {/* Accordion header */}
                      <div 
                        onClick={() => toggleSection(section._id)}
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-850/50 transition duration-200 select-none"
                      >
                        <div className="pr-4">
                          <h5 className="text-xs font-bold text-slate-200 line-clamp-1">{section.title}</h5>
                          <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                            Section {idx + 1} • {section.videos?.length || 0} lessons
                          </span>
                        </div>
                        <span className={`text-slate-500 transition-transform duration-300 font-bold ${isExpanded ? 'rotate-180' : ''} text-xs`}>
                          ▼
                        </span>
                      </div>

                      {/* Accordion items list */}
                      {isExpanded && (
                        <div className="bg-slate-950/60 border-t border-slate-850/50">
                          {(!section.videos || section.videos.length === 0) ? (
                            <div className="p-3 text-[11px] text-slate-500 italic">No lessons in this section.</div>
                          ) : (
                            section.videos.map((video) => {
                              const isActive = activeVideo?._id === video._id;
                              return (
                                <div 
                                  key={video._id}
                                  onClick={() => {
                                    setActiveVideo(video);
                                    setActiveSectionId(section._id);
                                  }}
                                  className={`p-3.5 pl-6 flex items-start gap-3 cursor-pointer transition border-b border-slate-900/40 last:border-0 select-none ${
                                    isActive 
                                      ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-l-indigo-500' 
                                      : 'hover:bg-slate-855/30 text-slate-300 hover:text-white'
                                  }`}
                                >
                                  <div className={`mt-0.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                                    <PlayIcon />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate leading-snug">{video.title}</p>
                                    <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500 font-medium">
                                      <span>⏱️ {formatDuration(video.duration)}</span>
                                      <span>💾 {formatSize(video.bytes)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // VIEW: LANDING & CHECKOUT PAGE (UNENROLLED STUDENT)
  // ═══════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-transparent pt-10 pb-20 px-4 sm:px-6 lg:px-8 animate-fade-in text-left">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* Left Column: Image & Info */}
        <div className="flex-grow">
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-2 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
            <img 
              src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"} 
              alt={course.title} 
              className="rounded-2xl object-cover w-full max-h-[500px]" 
            />
          </div>
          
          <div className="glassmorphism bg-white/70 dark:bg-slate-900/50 rounded-[2rem] p-8 sm:p-12 shadow-md border border-white/60 dark:border-slate-800">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">{course.title}</h1>
            <div className="prose prose-lg prose-slate max-w-none">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">About this course</h3>
              <p className="text-slate-600 dark:text-slate-350 leading-relaxed text-lg">
                {course.description || "No description provided for this course. Enroll now to discover the content inside."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Purchase Card */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="sticky top-24 bg-white dark:bg-slate-950 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">₹{course.price}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">One-time payment. Full lifetime access.</p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full h-14 bg-indigo-600 text-white font-extrabold text-lg rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border-0 flex items-center justify-center disabled:opacity-50"
              >
                {purchasing ? 'Enrolling...' : 'Buy this course'}
              </button>
              <button className="w-full h-14 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-lg rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer border-0 flex items-center justify-center">
                Add to Wishlist
              </button>
            </div>

            <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">This course includes:</h4>
              <ul className="space-y-3 text-slate-600 dark:text-slate-350 list-none p-0 m-0">
                <li className="flex items-center gap-3">
                  <span className="text-indigo-500">📺</span> High-quality video content
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-indigo-500">📱</span> Access on mobile and TV
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-indigo-500">🏆</span> Certificate of completion
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}