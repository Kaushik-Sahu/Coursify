import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import axios from 'axios';
import { Back } from '../icons/Back';
import { Cross } from '../icons/Cross';
import { toast } from 'sonner';

// Premium SVG Icons for buttons
const PlayIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default function AdminCourseContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Page level states
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Accordion state
  const [expandedSections, setExpandedSections] = useState({});

  // Modals visibility
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Video preview playback and comments state
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewSectionId, setPreviewSectionId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false);
  const videoRef = useRef(null);

  // New section form state
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Upload video form state
  const [uploadSectionId, setUploadSectionId] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit video form state
  const [editingVideo, setEditingVideo] = useState(null);
  const [editSectionId, setEditSectionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editHidden, setEditHidden] = useState(false);

  // Fetch course metadata and content sections
  const fetchContent = async () => {
    try {
      const response = await api.get(`/admin/courses/${courseId}/content`);
      setCourse(response.data.course);
      setSections(response.data.sections || []);
    } catch (err) {
      console.error('Failed to load course content:', err);
      setError('Failed to fetch course content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [courseId]);

  // Fetch comments when previewVideo changes
  useEffect(() => {
    if (!previewVideo) {
      setComments([]);
      return;
    }

    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const response = await api.get(
          `/admin/courses/${courseId}/sections/${previewSectionId}/videos/${previewVideo._id}/comments?page=1&limit=10`
        );
        setComments(response.data.comments || []);
        setCommentsPage(1);
        setHasMoreComments((response.data.comments || []).length >= 10);
      } catch (err) {
        console.error('Failed to fetch video comments:', err);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [previewVideo, previewSectionId, courseId]);

  const loadMoreComments = async () => {
    if (!hasMoreComments || commentsLoading) return;
    setCommentsLoading(true);
    try {
      const nextPage = commentsPage + 1;
      const response = await api.get(
        `/admin/courses/${courseId}/sections/${previewSectionId}/videos/${previewVideo._id}/comments?page=${nextPage}&limit=10`
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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !previewVideo) return;

    try {
      const response = await api.post(
        `/admin/courses/${courseId}/sections/${previewSectionId}/videos/${previewVideo._id}/comments`,
        { text: newCommentText }
      );
      setComments([response.data.comment, ...comments]);
      setNewCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
      toast.error('Failed to post comment. Please try again.');
    }
  };



  // ═══════════════════════════════════════════════════
  // SECTION CRUD OPERATIONS
  // ═══════════════════════════════════════════════════

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    try {
      const response = await api.post(`/admin/courses/${courseId}/sections`, {
        title: newSectionTitle
      });
      setSections([...sections, { ...response.data.section, videos: [] }]);
      setNewSectionTitle('');
      setShowSectionModal(false);
      toast.success('Section created successfully');
      
      // Auto expand newly created section
      setExpandedSections(prev => ({ ...prev, [response.data.section._id]: true }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to create section');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section? All videos inside it will be permanently deleted.')) {
      return;
    }

    try {
      await api.delete(`/admin/courses/${courseId}/sections/${sectionId}`);
      setSections(sections.filter(sec => sec._id !== sectionId));
      toast.success('Section deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete section');
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // ═══════════════════════════════════════════════════
  // VIDEO DIRECT UPLOAD & STAGING
  // ═══════════════════════════════════════════════════

  const openUploadModal = (sectionId) => {
    setUploadSectionId(sectionId);
    setVideoTitle('');
    setVideoDescription('');
    setVideoFile(null);
    setUploadProgress(0);
    setUploading(false);
    setShowUploadModal(true);
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile || !videoTitle.trim()) {
      alert('Please provide a video file and a title.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Request signature from backend
      const signatureResponse = await api.post('/admin/upload-signature', {
        resourceType: 'video'
      });

      const {
        signature,
        timestamp,
        type,
        api_key,
        cloud_name,
        folder,
        max_file_size
      } = signatureResponse.data;

      // Validate file size locally
      if (videoFile.size > max_file_size) {
        throw new Error(`File is too large. Maximum size allowed is ${Math.round(max_file_size / (1024 * 1024))}MB.`);
      }

      // Step 2: Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('api_key', api_key);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('type', type);
      formData.append('eager', 'sp_auto'); // Required for streaming support

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      const { public_id, secure_url, bytes, duration } = cloudinaryResponse.data;

      // Step 3: Send video metadata to backend
      const saveResponse = await api.post(`/admin/courses/${courseId}/sections/${uploadSectionId}/videos`, {
        publicId: public_id,
        title: videoTitle,
        description: videoDescription,
        bytes,
        duration: Math.round(duration || 0)
      });

      // Update sections in state
      setSections(sections.map(sec => {
        if (sec._id === uploadSectionId) {
          return {
            ...sec,
            videos: [...(sec.videos || []), saveResponse.data.video]
          };
        }
        return sec;
      }));

      setShowUploadModal(false);
      toast.success('Video uploaded and processed successfully!');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to upload video.';
      alert(errMsg);
    } finally {
      setUploading(false);
    }
  };

  // ═══════════════════════════════════════════════════
  // VIDEO CRUD & VISIBILITY
  // ═══════════════════════════════════════════════════

  const openEditModal = (sectionId, video) => {
    setEditingVideo(video);
    setEditSectionId(sectionId);
    setEditTitle(video.title);
    setEditDescription(video.description || '');
    setEditHidden(video.hidden || false);
    setShowEditModal(true);
  };

  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      const response = await api.put(
        `/admin/courses/${courseId}/sections/${editSectionId}/videos/${editingVideo._id}`,
        {
          title: editTitle,
          description: editDescription,
          hidden: editHidden
        }
      );

      // Update video in sections state
      setSections(sections.map(sec => {
        if (sec._id === editSectionId) {
          return {
            ...sec,
            videos: sec.videos.map(vid => 
              vid._id === editingVideo._id ? response.data.video : vid
            )
          };
        }
        return sec;
      }));

      setShowEditModal(false);
      toast.success('Video updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update video details');
    }
  };

  const handleToggleHideVideo = async (sectionId, video) => {
    try {
      const newHiddenState = !video.hidden;
      const response = await api.put(
        `/admin/courses/${courseId}/sections/${sectionId}/videos/${video._id}`,
        {
          hidden: newHiddenState
        }
      );

      // Update sections in state
      setSections(sections.map(sec => {
        if (sec._id === sectionId) {
          return {
            ...sec,
            videos: sec.videos.map(vid => 
              vid._id === video._id ? response.data.video : vid
            )
          };
        }
        return sec;
      }));

      toast.success(newHiddenState ? 'Video hidden from students' : 'Video is now visible to students');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update visibility state');
    }
  };

  const handleDeleteVideo = async (sectionId, videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This deletes it from the cloud storage as well.')) {
      return;
    }

    try {
      await api.delete(`/admin/courses/${courseId}/sections/${sectionId}/videos/${videoId}`);
      
      // Update state
      setSections(sections.map(sec => {
        if (sec._id === sectionId) {
          return {
            ...sec,
            videos: sec.videos.filter(vid => vid._id !== videoId)
          };
        }
        return sec;
      }));

      toast.success('Video deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete video');
    }
  };

  // Helpers
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
    return <div className="text-center py-20 text-slate-500">Loading course manager...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-transparent pb-16 animate-fade-in text-left">
      {/* Dynamic Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-purple-50/20 to-transparent dark:from-indigo-900/10 dark:via-transparent"></div>
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/your-courses')}
              className="p-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-full transition text-slate-600 dark:text-slate-400 active:scale-95 cursor-pointer border-0 flex items-center justify-center"
            >
              <Back />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{course?.title || 'Course Content'}</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Organize your lessons, upload videos directly, and configure public visibility states.</p>
            </div>
          </div>

          <button 
            onClick={() => setShowSectionModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition active:scale-95 border-0 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            + Create Section
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {sections.length === 0 ? (
          <div className="text-center py-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-800 p-8 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📁</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No sections created yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">Create sections to start structuring your course topics. You can then upload video lessons within each section.</p>
            <button 
              onClick={() => setShowSectionModal(true)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl border-0 cursor-pointer shadow-sm"
            >
              Create Your First Section
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sections.map((section, idx) => {
              const isExpanded = !!expandedSections[section._id];
              return (
                <div key={section._id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
                  {/* Section Title Header Accordion */}
                  <div 
                    onClick={() => toggleSection(section._id)}
                    className="flex justify-between items-center p-5 cursor-pointer bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/30 dark:hover:bg-slate-900/50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 dark:text-slate-500 text-sm font-semibold w-6">#{idx + 1}</span>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{section.title}</h2>
                      <span className="text-xs bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                        {section.videos?.length || 0} Lesson{(section.videos?.length !== 1) ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => openUploadModal(section._id)}
                        className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-905 dark:hover:bg-indigo-950/20 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg border-0 cursor-pointer transition font-medium"
                      >
                        📤 Add Video
                      </button>
                      <button 
                        onClick={() => handleDeleteSection(section._id)}
                        className="p-1.5 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 rounded-lg border-0 cursor-pointer transition"
                        title="Delete Section"
                      >
                        🗑️
                      </button>
                      <button 
                        onClick={() => toggleSection(section._id)}
                        className={`text-slate-400 transition-transform duration-300 font-bold ${isExpanded ? 'rotate-180' : ''} border-0 bg-transparent cursor-pointer text-lg p-1`}
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  {/* Accordion Content (Lazy loaded/rendered only when expanded) */}
                  {isExpanded && (
                    <div className="p-6 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 animate-slide-down">
                      {(!section.videos || section.videos.length === 0) ? (
                        <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                          No videos in this section yet. Click <span className="font-semibold text-slate-600 dark:text-slate-350">"Add Video"</span> to upload your first lesson.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {section.videos.map((video) => (
                            <div 
                              key={video._id} 
                              className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border transition-all ${
                                video.hidden 
                                  ? 'bg-slate-50/60 dark:bg-slate-900/10 border-slate-100 dark:border-slate-900 opacity-75' 
                                  : 'bg-white dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-750'
                              }`}
                            >
                              <div className="flex items-start gap-3.5 max-w-2xl">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl mt-0.5">
                                  🎬
                                </div>
                                <div>
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{video.title}</h3>
                                    {video.hidden ? (
                                      <span className="text-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-200/50">
                                        Hidden
                                      </span>
                                    ) : (
                                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-200/50">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  {video.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                                      {video.description}
                                    </p>
                                  )}
                                  <div className="flex gap-4 mt-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                    <span>⏱️ {formatDuration(video.duration)}</span>
                                    <span>💾 {formatSize(video.bytes)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 mt-4 md:mt-0 self-end md:self-auto flex-wrap">
                                {/* Play/Preview button */}
                                <button 
                                  onClick={() => { setPreviewVideo(video); setPreviewSectionId(section._id); }}
                                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-755 text-white rounded-lg text-xs font-bold border-0 cursor-pointer transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/10 active:scale-[0.98]"
                                  title="Play Video"
                                >
                                  <PlayIcon /> Play
                                </button>

                                {/* Toggle visibility */}
                                <button 
                                  onClick={() => handleToggleHideVideo(section._id, video)}
                                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition flex items-center gap-1.5 active:scale-[0.98] ${
                                    video.hidden 
                                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800' 
                                      : 'bg-amber-50 hover:bg-amber-100/80 text-amber-700 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border-amber-200/40 dark:border-amber-900/40'
                                  }`}
                                  title={video.hidden ? 'Show to Students' : 'Hide from Students'}
                                >
                                  {video.hidden ? (
                                    <>
                                      <EyeIcon /> Show
                                    </>
                                  ) : (
                                    <>
                                      <EyeOffIcon /> Hide
                                    </>
                                  )}
                                </button>

                                {/* Edit metadata */}
                                <button 
                                  onClick={() => openEditModal(section._id, video)}
                                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-800 cursor-pointer transition flex items-center gap-1.5 active:scale-[0.98]"
                                  title="Edit Video details"
                                >
                                  <EditIcon /> Edit
                                </button>

                                {/* Delete video */}
                                <button 
                                  onClick={() => handleDeleteVideo(section._id, video._id)}
                                  className="p-2 bg-slate-50 hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-900/50 cursor-pointer transition flex items-center justify-center active:scale-[0.98]"
                                  title="Delete Video"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          MODAL: CREATE SECTION
          ═══════════════════════════════════════════════════ */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowSectionModal(false)}>
          <div className="glassmorphism bg-white/95 dark:bg-slate-900/95 w-[90%] sm:w-[26rem] rounded-3xl flex flex-col p-6 relative shadow-2xl border border-white/50 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-5 right-5 cursor-pointer hover:scale-110 transition p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 border-0 bg-transparent flex items-center justify-center"
              onClick={() => setShowSectionModal(false)}
            >
              <Cross />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Create Section</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Give a title for the section/module. You can add video contents under it.</p>
            
            <form onSubmit={handleCreateSection} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Section Title</label>
                <input 
                  type="text" 
                  value={newSectionTitle}
                  onChange={e => setNewSectionTitle(e.target.value)}
                  placeholder="e.g. Getting Started with React" 
                  className="w-full h-11 mt-1 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 text-sm font-medium"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="submit"
                  className="flex-grow h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all border-0 cursor-pointer shadow-md shadow-indigo-600/25 flex items-center justify-center"
                >
                  Create
                </button>
                <button 
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="px-5 h-11 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold border-0 cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL: UPLOAD VIDEO
          ═══════════════════════════════════════════════════ */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="glassmorphism bg-white/95 dark:bg-slate-900/95 w-[90%] sm:w-[28rem] rounded-3xl flex flex-col p-6 relative shadow-2xl border border-white/50 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            {!uploading && (
              <button 
                className="absolute top-5 right-5 cursor-pointer hover:scale-110 transition p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 border-0 bg-transparent flex items-center justify-center"
                onClick={() => setShowUploadModal(false)}
              >
                <Cross />
              </button>
            )}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Upload Lesson Video</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Select a video and set its metadata. The video will be uploaded to the cloud.</p>

            <form onSubmit={handleVideoUpload} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Video Title</label>
                <input 
                  type="text" 
                  value={videoTitle}
                  onChange={e => setVideoTitle(e.target.value)}
                  placeholder="e.g. 1.1 Intro to State Management" 
                  className="w-full h-11 mt-1 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 text-sm font-medium"
                  required
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Description (Optional)</label>
                <textarea 
                  value={videoDescription}
                  onChange={e => setVideoDescription(e.target.value)}
                  placeholder="e.g. In this video, we'll explain how Recoil manages state across files..." 
                  className="w-full h-20 mt-1 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 text-xs resize-none"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Video File</label>
                <input 
                  type="file" 
                  accept="video/*"
                  onChange={e => setVideoFile(e.target.files[0])}
                  className="w-full mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950/30 dark:file:text-indigo-400 file:cursor-pointer text-xs text-slate-500 dark:text-slate-400"
                  required
                  disabled={uploading}
                />
              </div>

              {uploading && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-450 font-bold mb-1.5">
                    <span>Uploading to the cloud...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">Do not close this tab. Processing and finalizing the video details...</p>
                </div>
              )}

              {!uploading && (
                <div className="flex gap-3 mt-4">
                  <button 
                    type="submit"
                    className="flex-grow h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all border-0 cursor-pointer shadow-md shadow-indigo-600/25 flex items-center justify-center"
                  >
                    Start Upload
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-5 h-11 bg-slate-105 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold border-0 cursor-pointer flex items-center justify-center"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL: EDIT VIDEO METADATA
          ═══════════════════════════════════════════════════ */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowEditModal(false)}>
          <div className="glassmorphism bg-white/95 dark:bg-slate-900/95 w-[90%] sm:w-[28rem] rounded-3xl flex flex-col p-6 relative shadow-2xl border border-white/50 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-5 right-5 cursor-pointer hover:scale-110 transition p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 border-0 bg-transparent flex items-center justify-center"
              onClick={() => setShowEditModal(false)}
            >
              <Cross />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Edit Lesson Details</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Update the title, description, or toggle visibility status for students.</p>

            <form onSubmit={handleUpdateVideo} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Video Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full h-11 mt-1 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Description (Optional)</label>
                <textarea 
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full h-20 mt-1 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 text-xs resize-none"
                />
              </div>

              <div className="py-3 border-y border-slate-100 dark:border-slate-900 flex items-center justify-between mt-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Hide from Students</h4>
                  <p className="text-[10px] text-slate-505 dark:text-slate-450 mt-0.5">If hidden, students cannot access this lesson in their course dashboard.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editHidden} 
                    onChange={e => setEditHidden(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="submit"
                  className="flex-grow h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all border-0 cursor-pointer shadow-md shadow-indigo-600/25 flex items-center justify-center"
                >
                  Save Changes
                </button>
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 h-11 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold border-0 cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL: VIDEO PLAYBACK PREVIEW & COMMENTS
          ═══════════════════════════════════════════════════ */}
      {previewVideo && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in" onClick={() => setPreviewVideo(null)}>
          <div className="bg-white dark:bg-slate-900 w-[95%] sm:w-[46rem] max-h-[90vh] rounded-3xl flex flex-col p-6 relative shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-5 right-5 cursor-pointer hover:scale-110 transition p-2 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 border-0 bg-transparent flex items-center justify-center z-10"
              onClick={() => setPreviewVideo(null)}
            >
              <Cross />
            </button>
            
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 pr-8 tracking-tight shrink-0">
              {previewVideo.title}
            </h3>
            
            {/* Video Player Box */}
            <div className="bg-black rounded-2xl overflow-hidden aspect-video w-full border border-slate-200 dark:border-slate-800 shadow-inner relative flex items-center justify-center shrink-0 transform translate-z-0">
              <video 
                ref={videoRef}
                src={previewVideo.videoUrl} 
                className="w-full h-full object-contain" 
                controls 
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                autoPlay 
              />
            </div>
            
            {/* Scrollable details & comments section (hidden in fullscreen mode) */}
            {!isPlayerFullscreen && (
              <div className="flex-1 overflow-y-auto mt-5 pr-1 custom-scrollbar flex flex-col">


                {/* Comments Section */}
                <div className="border-t border-slate-100 dark:border-slate-850 pt-5 text-left flex-1 flex flex-col">
                  <h4 className="font-extrabold text-slate-855 dark:text-slate-100 mb-4 flex items-center gap-2 text-base shrink-0">
                    <span>💬</span> Comments ({comments.length})
                  </h4>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="flex gap-3 mb-6 items-start shrink-0">
                    <textarea
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      placeholder="Ask a question or add a comment..."
                      className="flex-grow min-h-[48px] max-h-[120px] text-sm p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 resize-y font-medium placeholder-slate-400"
                      required
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all border-0 cursor-pointer shadow-md shadow-indigo-600/10 active:scale-95 self-end"
                    >
                      Post
                    </button>
                  </form>

                  {/* Comments Feed */}
                  <div className="flex-1 flex flex-col gap-4 pb-4">
                    {commentsLoading ? (
                      <div className="text-center py-6 text-xs text-slate-400">Loading comments...</div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8 text-sm text-slate-450 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80">
                        No comments on this lesson yet.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {comments.map((comment) => (
                          <div key={comment._id} className="flex items-start gap-3.5 text-left animate-fade-in">
                            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 select-none shadow-sm">
                              {(comment.userId?.username || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                  {comment.userId?.username || 'Deleted User'}
                                </span>
                                {(comment.userModel === 'Admin' || comment.userModel === 'SuperAdmin') && (
                                  <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 px-2 py-0.5 rounded-md font-extrabold tracking-wide uppercase">
                                    Instructor
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold ml-auto">
                                  {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="bg-slate-50/70 dark:bg-slate-950/30 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-850 mt-1 shadow-sm">
                                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
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
                            className="w-full py-3 mt-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-850 cursor-pointer disabled:opacity-50"
                          >
                            {commentsLoading ? 'Loading...' : 'Load more comments'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

          </div>
  );
}
