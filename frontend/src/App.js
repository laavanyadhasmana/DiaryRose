
console.log('API URL:', process.env.REACT_APP_API_URL);
import React, { useState, useRef, useEffect } from "react";
import {
  Camera, Edit, Calendar, Search, Video, FileText, Plus, X, Play, Trash2, Lock,
  Download, Moon, Sun, Settings, Sparkles, Crown, Clock, BarChart3, Bold, Italic,
  List, MapPin, Repeat, Upload, Pause, User, Mail, Eye, EyeOff, LogOut, Globe,
  Share2, Bell, BookOpen, RefreshCw, CloudUpload, CloudDownload
} from "lucide-react";

export default function DiaryApp() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // App State
  const [view, setView] = useState("entries");
  const [entries, setEntries] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [writtenContent, setWrittenContent] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [entryMood, setEntryMood] = useState("neutral");
  const [entryTags, setEntryTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterMood, setFilterMood] = useState("all");
  const [filterPrivacy, setFilterPrivacy] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [isPremium, setIsPremium] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Feature State
  const [entryLocation, setEntryLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState(null);
  const [attachedImages, setAttachedImages] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [entryPrivacy, setEntryPrivacy] = useState("private");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [shareableLink, setShareableLink] = useState("");
  const [notifications, setNotifications] = useState([]);

  // Refs
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const textareaRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const importFileRef = useRef(null);

  // Templates
  const templates = [
    { id: 1, name: "Daily Reflection", content: "What went well:\n\nWhat I learned:\n\nGrateful for:\n\nTomorrow's goals:" },
    { id: 2, name: "Travel Journal", content: "Location:\n\nWhat I saw:\n\nBest moment:\n\nLocal food:\n\nPeople I met:" },
    { id: 3, name: "Dream Log", content: "Date:\n\nDescription:\n\nEmotions:\n\nMeanings:" },
    { id: 4, name: "Gratitude", content: "Today I'm grateful for:\n1.\n2.\n3.\n\nWhy:" },
    { id: 5, name: "Goal Setting", content: "Goal:\n\nWhy:\n\nSteps:\n\nDeadline:\n\nProgress:" }
  ];

  // Simulated API
  const API = {
    login: async (email, password) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword };
      }
      return { success: false, error: "Invalid credentials" };
    },
    signup: async (name, email, password) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      if (users.find(u => u.email === email)) {
        return { success: false, error: "Email exists" };
      }
      const newUser = {
        id: Date.now().toString(),
        name, email, password,
        createdAt: new Date().toISOString(),
        isPremium: false,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
      };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      const { password: _, ...userWithoutPassword } = newUser;
      return { success: true, user: userWithoutPassword };
    },
    syncEntries: async (userId, entries) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      localStorage.setItem(`entries_${userId}`, JSON.stringify(entries));
      return { success: true, syncedAt: new Date().toISOString() };
    },
    fetchEntries: async (userId) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const entries = JSON.parse(localStorage.getItem(`entries_${userId}`) || "[]");
      return { success: true, entries };
    },
    generateShareLink: async (entryId) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, link: `https://diaryrose.app/shared/${entryId}` };
    }
  };

  // Helper Functions
  const getMoodEmoji = m => ({ happy: "😊", sad: "😢", excited: "🤩", calm: "😌", anxious: "😰", neutral: "😐", grateful: "🙏", angry: "😠" }[m] || "😐");
  const formatDuration = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const theme = darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900";
  const card = darkMode ? "bg-gray-800 border-gray-700" : "bg-white";

  // Analytics Functions
  const getStreakDays = () => {
    if (!entries.length) return 0;
    const dates = [...new Set(entries.map(e => new Date(e.date).toDateString()))].sort((a, b) => new Date(b) - new Date(a));
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (dates[0] !== today && dates[0] !== yesterday) return 0;
    let streak = 0;
    for (let i = 0; i < dates.length; i++) {
      if (dates[i] === new Date(Date.now() - i * 86400000).toDateString()) streak++;
      else break;
    }
    return streak;
  };

  const getWeeklyStats = () => entries.filter(e => new Date(e.date) > new Date(Date.now() - 7 * 86400000)).length;
  
  const getOnThisDayEntries = () => {
    const now = new Date();
    return entries.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getDate() === now.getDate() && d.getFullYear() !== now.getFullYear();
    });
  };

  const publicEntries = entries.filter(e => e.privacy === "public");

  const filteredEntries = entries.filter(e => {
    const search = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const type = filterType === "all" || e.type === filterType;
    const mood = filterMood === "all" || e.mood === filterMood;
    const privacy = filterPrivacy === "all" || e.privacy === filterPrivacy;
    return search && type && mood && privacy;
  }).sort((a, b) => sortBy === "oldest" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));

  // Load user data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      loadUserData(user.id);
    }
  }, []);

  const loadUserData = async (userId) => {
    const result = await API.fetchEntries(userId);
    if (result.success) setEntries(result.entries);
    const settings = JSON.parse(localStorage.getItem(`settings_${userId}`) || "{}");
    setDarkMode(settings.darkMode || false);
    setReminderEnabled(settings.reminderEnabled || false);
    setIsPremium(settings.isPremium || false);
  };

  // Save entries
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`entries_${currentUser.id}`, JSON.stringify(entries));
    }
  }, [entries, currentUser]);

  // Save settings
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`settings_${currentUser.id}`, JSON.stringify({ darkMode, reminderEnabled, isPremium }));
    }
  }, [darkMode, reminderEnabled, isPremium, currentUser]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Auth Handlers
  const handleLogin = async () => {
    if (!authEmail || !authPassword) return alert("Please fill in all fields");
    const result = await API.login(authEmail, authPassword);
    if (result.success) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(result.user));
      await loadUserData(result.user.id);
      addNotification("Welcome back!", "success");
    } else {
      alert(result.error);
    }
  };

  const handleSignup = async () => {
    if (!authName || !authEmail || !authPassword) return alert("Please fill in all fields");
    if (authPassword.length < 6) return alert("Password must be at least 6 characters");
    const result = await API.signup(authName, authEmail, authPassword);
    if (result.success) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(result.user));
      addNotification("Account created!", "success");
    } else {
      alert(result.error);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Logout?")) {
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("currentUser");
      setEntries([]);
      addNotification("Logged out", "info");
    }
  };

  // Notification Handler
  const addNotification = (message, type = "info") => {
    const notification = { id: Date.now(), message, type, timestamp: new Date().toISOString() };
    setNotifications(prev => [notification, ...prev].slice(0, 10));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Sync Handler
  const syncWithCloud = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    const result = await API.syncEntries(currentUser.id, entries);
    if (result.success) {
      setLastSyncTime(result.syncedAt);
      addNotification("Synced!", "success");
    }
    setIsSyncing(false);
  };

  // Location Handler
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationCoords({ lat: latitude, lng: longitude });
          setEntryLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setIsLoadingLocation(false);
          addNotification("Location added", "success");
        },
        () => {
          setIsLoadingLocation(false);
          alert("Unable to get location");
        }
      );
    } else {
      setIsLoadingLocation(false);
      alert("Geolocation not supported");
    }
  };

  // Video Recording Handlers
  const startVideoRecording = async () => {
    const monthVideos = entries.filter(e => e.type === "video" && new Date(e.date).getMonth() === new Date().getMonth()).length;
    if (!isPremium && monthVideos >= 10) {
      alert("Free: 10 videos/month!");
      setShowPremiumModal(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => setRecordedVideo(reader.result);
      };
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDur = prev + 1;
          if (newDur >= (isPremium ? 1800 : 300)) stopVideoRecording();
          return newDur;
        });
      }, 1000);
    } catch { alert("Camera access denied"); }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Image Upload Handler
  const handleImageUpload = e => {
    const files = Array.from(e.target.files);
    if (!isPremium && attachedImages.length + files.length > 3) {
      alert("Free: 3 images/entry!");
      setShowPremiumModal(true);
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setAttachedImages(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  // Text Format Handler
  const applyTextFormat = format => {
    if (!isPremium) {
      alert("Premium feature!");
      setShowPremiumModal(true);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = writtenContent.substring(start, end);
    let formatted = selected;
    if (format === "bold") formatted = `**${selected}**`;
    else if (format === "italic") formatted = `*${selected}*`;
    else if (format === "list") formatted = selected.split("\n").map(l => `• ${l}`).join("\n");
    setWrittenContent(writtenContent.substring(0, start) + formatted + writtenContent.substring(end));
  };

  // Tag Handlers
  const addTag = () => {
    if (tagInput.trim() && !entryTags.includes(tagInput.trim())) {
      setEntryTags([...entryTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Save Entry Handlers
  const saveVideoEntry = () => {
    if (!recordedVideo || !entryTitle) return alert("Add title");
    const newEntry = {
      id: Date.now(), userId: currentUser.id, type: "video", title: entryTitle,
      videoUrl: recordedVideo, mood: entryMood, tags: entryTags,
      date: new Date().toISOString(), timestamp: new Date().toLocaleString(),
      location: entryLocation, locationCoords, duration: recordingDuration,
      privacy: entryPrivacy, likes: 0, views: 0
    };
    setEntries([newEntry, ...entries]);
    resetForm();
    setView("entries");
    addNotification("Video saved!", "success");
  };

  const saveWrittenEntry = () => {
    if (!writtenContent || !entryTitle) return alert("Add title and content");
    const newEntry = {
      id: Date.now(), userId: currentUser.id, type: "written", title: entryTitle,
      content: writtenContent, mood: entryMood, tags: entryTags,
      date: new Date().toISOString(), timestamp: new Date().toLocaleString(),
      wordCount: writtenContent.trim().split(/\s+/).length,
      location: entryLocation, locationCoords, images: attachedImages,
      privacy: entryPrivacy, likes: 0, views: 0
    };
    setEntries([newEntry, ...entries]);
    resetForm();
    setView("entries");
    addNotification("Entry saved!", "success");
  };

  const resetForm = () => {
    setRecordedVideo(null);
    setWrittenContent("");
    setEntryTitle("");
    setEntryMood("neutral");
    setEntryTags([]);
    setTagInput("");
    setEntryLocation("");
    setLocationCoords(null);
    setAttachedImages([]);
    setRecordingDuration(0);
    setEntryPrivacy("private");
  };

  // Entry Action Handlers
  const deleteEntry = id => {
    if (window.confirm("Delete?")) {
      setEntries(entries.filter(e => e.id !== id));
      setSelectedEntry(null);
      addNotification("Deleted", "info");
    }
  };

  const toggleEntryPrivacy = (entry) => {
    const newPrivacy = entry.privacy === "private" ? "public" : "private";
    setEntries(entries.map(e => e.id === entry.id ? { ...e, privacy: newPrivacy } : e));
    addNotification(`Now ${newPrivacy}`, "info");
  };

  const shareEntry = async (entry) => {
    const result = await API.generateShareLink(entry.id);
    if (result.success) {
      setShareableLink(result.link);
      setShowShareModal(true);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareableLink);
    addNotification("Link copied!", "success");
  };

  const exportEntry = entry => {
    if (entry.type === "written") {
      const text = `Title: ${entry.title}\nDate: ${entry.timestamp}\nMood: ${entry.mood}\nPrivacy: ${entry.privacy}\nTags: ${entry.tags.join(", ")}\n${entry.location ? `Location: ${entry.location}\n` : ""}\n${entry.content}`;
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diary-${entry.title.replace(/\s+/g, "-")}.txt`;
      a.click();
      addNotification("Exported", "success");
    }
  };

  const exportAllEntries = () => {
    if (!isPremium) {
      alert("Premium feature!");
      setShowPremiumModal(true);
      return;
    }
    const data = { user: currentUser, entries, exportDate: new Date().toISOString(), version: "1.0" };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diaryrose-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    setShowExportModal(false);
    addNotification("Exported!", "success");
  };

  const importEntries = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.entries && Array.isArray(data.entries)) {
          setEntries([...entries, ...data.entries]);
          setShowImportModal(false);
          addNotification(`Imported ${data.entries.length} entries`, "success");
        } else {
          alert("Invalid file");
        }
      } catch {
        alert("Error reading file");
      }
    };
    reader.readAsText(file);
  };

  const upgradeToPremium = () => {
    setIsPremium(true);
    setShowPremiumModal(false);
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, isPremium: true } : u);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setCurrentUser({ ...currentUser, isPremium: true });
    }
    addNotification("🎉 Premium activated!", "success");
  };

  const applyTemplate = (template) => {
    setWrittenContent(template.content);
    setShowTemplates(false);
    addNotification(`Template "${template.name}" applied`, "success");
  };

  // AUTH SCREEN
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${theme} flex items-center justify-center p-4`}>
        <div className={`${card} rounded-2xl shadow-2xl max-w-md w-full p-8`}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">DiaryRose</h1>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Your private digital diary</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setAuthMode("login")} className={`flex-1 py-2 rounded-lg font-medium ${authMode === "login" ? "bg-indigo-500 text-white" : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}`}>Login</button>
            <button onClick={() => setAuthMode("signup")} className={`flex-1 py-2 rounded-lg font-medium ${authMode === "signup" ? "bg-indigo-500 text-white" : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}`}>Sign Up</button>
          </div>

          <div className="space-y-4">
            {authMode === "signup" && (
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} placeholder="John Doe" className={`w-full pl-10 pr-4 py-3 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`} />
                </div>
              </div>
            )}
            
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@example.com" className={`w-full pl-10 pr-4 py-3 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`} />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? "text" : "password"} value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" className={`w-full pl-10 pr-12 py-3 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`} />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button onClick={authMode === "login" ? handleLogin : handleSignup} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg">
              {authMode === "login" ? "Login" : "Create Account"}
            </button>
          </div>

          <div className={`mt-6 p-4 ${darkMode ? "bg-gray-700" : "bg-blue-50"} rounded-lg`}>
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-blue-900"}`}>
              <strong>Demo:</strong> demo@diaryrose.com / demo123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme}`}>
      {/* HEADER */}
      <header className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} shadow-sm border-b sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">DiaryRose</h1>
                  {isPremium && <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full"><Crown className="w-3 h-3" />Premium</span>}
                </div>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Welcome, {currentUser?.name}</p>
              </div>
            </div>
            
            <div className="flex gap-2 items-center flex-wrap">
              <button onClick={syncWithCloud} disabled={isSyncing} className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} ${isSyncing ? "animate-spin" : ""}`}>
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} relative`}>
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 ${card} rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto`}>
                    <h3 className="font-semibold mb-3">Notifications</h3>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500">No notifications</p>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map(n => (
                          <div key={n.id} className={`p-3 rounded ${n.type === "success" ? "bg-green-50 dark:bg-green-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}>
                            <p className="text-sm">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isPremium && (
                <button onClick={() => setShowPremiumModal(true)} className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:shadow-lg text-sm">
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline">Upgrade</span>
                </button>
              )}
              
              <button onClick={() => setShowAnalytics(true)} className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                <BarChart3 className="w-5 h-5" />
              </button>
              
              <button onClick={() => setShowProfile(true)} className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                <User className="w-5 h-5" />
              </button>
              
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button onClick={() => setShowSettings(true)} className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                <Settings className="w-5 h-5" />
              </button>
              
              <button onClick={() => setView("video")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg">
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Video</span>
              </button>
              
              <button onClick={() => setView("write")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Write</span>
              </button>
            </div>
          </div>
          {lastSyncTime && (
            <p className="text-xs text-gray-500 mt-2">
              Last synced: {new Date(lastSyncTime).toLocaleString()}
            </p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ENTRIES VIEW */}
        {view === "entries" && (
          <div>
            {/* ON THIS DAY */}
            {getOnThisDayEntries().length > 0 && (
              <div className={`${card} rounded-xl shadow-sm p-6 mb-6 border-2 border-purple-500`}>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-purple-600">On This Day</h3>
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="space-y-3">
                  {getOnThisDayEntries().slice(0, 3).map(entry => {
                    const yearsAgo = new Date().getFullYear() - new Date(entry.date).getFullYear();
                    return (
                      <div key={entry.id} onClick={() => setSelectedEntry(entry)} className={`p-4 rounded-lg ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-purple-50 hover:bg-purple-100"} cursor-pointer transition`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                          <span className="text-sm font-semibold text-purple-600">{yearsAgo} {yearsAgo === 1 ? "year" : "years"} ago</span>
                        </div>
                        <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>{entry.title}</h4>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`${card} rounded-xl shadow-sm p-4`}>
                <div className="text-2xl font-bold text-indigo-600">{entries.length}</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total</div>
              </div>
              <div className={`${card} rounded-xl shadow-sm p-4`}>
                <div className="text-2xl font-bold text-purple-600">{publicEntries.length}</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Public</div>
              </div>
              <div className={`${card} rounded-xl shadow-sm p-4`}>
                <div className="text-2xl font-bold text-pink-600">{getStreakDays()}</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Streak 🔥</div>
              </div>
              <div className={`${card} rounded-xl shadow-sm p-4`}>
                <div className="text-2xl font-bold text-green-600">{getWeeklyStats()}</div>
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>This Week</div>
              </div>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className={`mb-6 ${card} rounded-xl shadow-sm p-4`}>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400`} />
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`w-full pl-10 pr-4 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select value={filterType} onChange={e => setFilterType(e.target.value)} className={`px-4 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`}>
                    <option value="all">All Types</option>
                    <option value="written">Written</option>
                    <option value="video">Video</option>
                  </select>
                  <select value={filterPrivacy} onChange={e => setFilterPrivacy(e.target.value)} className={`px-4 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`}>
                    <option value="all">All Privacy</option>
                    <option value="private">🔒 Private</option>
                    <option value="public">🌐 Public</option>
                  </select>
                  <select value={filterMood} onChange={e => setFilterMood(e.target.value)} className={`px-4 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`}>
                    <option value="all">All Moods</option>
                    <option value="happy">😊 Happy</option>
                    <option value="sad">😢 Sad</option>
                    <option value="excited">🤩 Excited</option>
                    <option value="calm">😌 Calm</option>
                  </select>
                  <button onClick={() => setShowExportModal(true)} className={`px-4 py-2 border ${darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"} rounded-lg flex items-center gap-2`}>
                    <Download className="w-4 h-4" />Export
                  </button>
                </div>
              </div>
            </div>

            {/* ENTRIES LIST */}
            {filteredEntries.length === 0 ? (
              <div className={`text-center py-16 ${card} rounded-xl shadow-sm`}>
                <Calendar className={`w-16 h-16 mx-auto text-gray-300 mb-4`} />
                <h3 className={`text-xl font-semibold text-gray-600 mb-2`}>No entries yet</h3>
                <p className="text-gray-500 mb-6">Start your journey today!</p>
                <div className="flex gap-4 justify-center">
                  <button onClick={() => setView("video")} className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg">Record Video</button>
                  <button onClick={() => setView("write")} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg">Write Entry</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEntries.map(entry => (
                  <div key={entry.id} className={`${card} rounded-xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden`}>
                    <div className="p-4" onClick={() => setSelectedEntry(entry)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {entry.type === "video" ? <Video className="w-5 h-5 text-red-500" /> : <FileText className="w-5 h-5 text-indigo-500" />}
                          <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                          {entry.privacy === "public" ? <Globe className="w-4 h-4 text-blue-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
                        </div>
                        <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{entry.timestamp.split(",")[0]}</span>
                      </div>
                      <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-2 line-clamp-2`}>{entry.title}</h3>
                      {entry.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <MapPin className="w-3 h-3" />
                          {entry.location}
                        </div>
                      )}
                      {entry.type === "written" && <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} line-clamp-3`}>{entry.content}</p>}
                      {entry.type === "video" && (
                        <div className={`mt-2 ${darkMode ? "bg-gray-700" : "bg-gray-100"} rounded-lg h-32 flex items-center justify-center`}>
                          <Play className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {entry.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {entry.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center justify-between px-4 py-2 border-t ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>❤️ {entry.likes || 0}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toggleEntryPrivacy(entry); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        {entry.privacy === "private" ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIDEO VIEW */}
        {view === "video" && (
          <div className="max-w-3xl mx-auto">
            <div className={`${card} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Video Entry</h2>
                <button onClick={() => { setView("entries"); if (isRecording) stopVideoRecording(); resetForm(); }} className={`p-2 rounded-lg hover:bg-gray-700`}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              {!recordedVideo ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                  </div>
                  {isRecording && <div className="text-center text-2xl font-bold text-red-500">{formatDuration(recordingDuration)}</div>}
                  <div className="flex justify-center gap-4">
                    {!isRecording ? (
                      <button onClick={startVideoRecording} className="px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center gap-2">
                        <Camera className="w-5 h-5" />Start Recording
                      </button>
                    ) : (
                      <button onClick={stopVideoRecording} className="px-8 py-3 bg-gray-800 text-white rounded-full flex items-center gap-2 animate-pulse">
                        <Pause className="w-5 h-5" />Stop Recording
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <video src={recordedVideo} controls className="w-full aspect-video bg-black rounded-lg" />
                  <input type="text" placeholder="Title..." value={entryTitle} onChange={e => setEntryTitle(e.target.value)} className={`w-full px-4 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`} />
                  <div className="grid grid-cols-2 gap-4">
                    <select value={entryMood} onChange={e => setEntryMood(e.target.value)} className={`px-4 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`}>
                      <option value="happy">😊 Happy</option>
                      <option value="sad">😢 Sad</option>
                      <option value="excited">🤩 Excited</option>
                      <option value="calm">😌 Calm</option>
                      <option value="neutral">😐 Neutral</option>
                    </select>
                    <select value={entryPrivacy} onChange={e => setEntryPrivacy(e.target.value)} className={`px-4 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`}>
                      <option value="private">🔒 Private</option>
                      <option value="public">🌐 Public</option>
                    </select>
                  </div>
                  <button onClick={getCurrentLocation} disabled={isLoadingLocation} className={`w-full px-4 py-2 border ${darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"} rounded-lg flex items-center justify-center gap-2`}>
                    <MapPin className="w-4 h-4" />{isLoadingLocation ? "Getting Location..." : entryLocation || "Add Location"}
                  </button>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === "Enter" && addTag()} className={`flex-1 px-4 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`} />
                    <button onClick={addTag} className="px-4 py-2 bg-indigo-500 text-white rounded-lg"><Plus className="w-5 h-5" /></button>
                  </div>
                  {entryTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entryTags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm rounded-full flex items-center gap-1">
                          {tag}<button onClick={() => setEntryTags(entryTags.filter(t => t !== tag))}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={saveVideoEntry} className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg">Save Entry</button>
                    <button onClick={() => setRecordedVideo(null)} className={`px-6 py-3 border ${darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"} rounded-lg`}>Re-record</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WRITE VIEW */}
        {view === "write" && (
          <div className="max-w-3xl mx-auto">
            <div className={`${card} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Written Entry</h2>
                <div className="flex gap-2">
                  <button onClick={() => setShowTemplates(true)} className={`px-3 py-2 border ${darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"} rounded-lg flex items-center gap-2 text-sm`}>
                    <BookOpen className="w-4 h-4" />Templates
                  </button>
                  <button onClick={() => { setView("entries"); resetForm(); }} className="p-2 rounded-lg hover:bg-gray-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <input type="text" placeholder="Entry title..." value={entryTitle} onChange={e => setEntryTitle(e.target.value)} className={`w-full px-4 py-3 text-xl font-semibold border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`} />
                <div className="grid grid-cols-2 gap-4">
                  <select value={entryMood} onChange={e => setEntryMood(e.target.value)} className={`px-4 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`}>
                    <option value="happy">😊 Happy</option>
                    <option value="sad">😢 Sad</option>
                    <option value="excited">🤩 Excited</option>
                    <option value="calm">😌 Calm</option>
                    <option value="neutral">😐 Neutral</option>
                  </select>
                  <select value={entryPrivacy} onChange={e => setEntryPrivacy(e.target.value)} className={`px-4 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`}>
                    <option value="private">🔒 Private</option>
                    <option value="public">🌐 Public</option>
                  </select>
                </div>
                <button onClick={getCurrentLocation} disabled={isLoadingLocation} className={`w-full px-4 py-2 border ${darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"} rounded-lg flex items-center justify-center gap-2`}>
                  <MapPin className="w-4 h-4" />{isLoadingLocation ? "Getting Location..." : entryLocation || "Add Location"}
                </button>
                <div className="flex gap-2">
                  <input type="text" placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === "Enter" && addTag()} className={`flex-1 px-4 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg`} />
                  <button onClick={addTag} className="px-4 py-2 bg-indigo-500 text-white rounded-lg"><Plus className="w-5 h-5" /></button>
                </div>
                {entryTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entryTags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm rounded-full flex items-center gap-1">
                        {tag}<button onClick={() => setEntryTags(entryTags.filter(t => t !== tag))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                {isPremium && (
                  <div className="flex gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <button onClick={() => applyTextFormat("bold")} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"><Bold className="w-4 h-4" /></button>
                    <button onClick={() => applyTextFormat("italic")} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"><Italic className="w-4 h-4" /></button>
                    <button onClick={() => applyTextFormat("list")} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"><List className="w-4 h-4" /></button>
                  </div>
                )}
                <textarea ref={textareaRef} placeholder="Write your thoughts here..." value={writtenContent} onChange={e => setWrittenContent(e.target.value)} className={`w-full px-4 py-3 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"} rounded-lg min-h-[400px]`} />
                <div>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className={`px-4 py-2 border ${darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"} rounded-lg flex items-center gap-2`}>
                    <Upload className="w-4 h-4" />Add Images {!isPremium && "(max 3)"}
                  </button>
                </div>
                {attachedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {attachedImages.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                        <button onClick={() => setAttachedImages(attachedImages.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={saveWrittenEntry} className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg">Save Entry</button>
              </div>
            </div>
          </div>
        )}
 

{/* ENTRY DETAIL MODAL */}
{selectedEntry && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEntry(null)}>
    <div className={`${card} rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {selectedEntry.type === "video" ? <Video className="w-5 h-5 text-red-500" /> : <FileText className="w-5 h-5 text-indigo-500" />}
              <span className="text-2xl">{getMoodEmoji(selectedEntry.mood)}</span>
              {selectedEntry.privacy === "public" ? <Globe className="w-4 h-4 text-blue-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
            </div>
            <h2 className={`text-2xl font-bold mb-1`}>{selectedEntry.title}</h2>
            <p className="text-sm text-gray-500">{selectedEntry.timestamp}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportEntry(selectedEntry)} className="p-2 rounded-lg hover:bg-gray-700">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={() => toggleEntryPrivacy(selectedEntry)} className="p-2 rounded-lg hover:bg-gray-700">
              {selectedEntry.privacy === "private" ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
            </button>
            <button onClick={() => deleteEntry(selectedEntry.id)} className="p-2 rounded-lg hover:bg-red-900 text-red-400">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={() => setSelectedEntry(null)} className="p-2 rounded-lg hover:bg-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        {selectedEntry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedEntry.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm rounded-full">{tag}</span>
            ))}
          </div>
        )}
        {selectedEntry.location && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            {selectedEntry.location}
          </div>
        )}
        {selectedEntry.type === "video" && (
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video src={selectedEntry.videoUrl} controls className="w-full h-full" />
          </div>
        )}
        {selectedEntry.type === "written" && (
          <div>
            <p className="text-gray-300 whitespace-pre-wrap mb-4">{selectedEntry.content}</p>
            {selectedEntry.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {selectedEntry.images.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-full rounded-lg" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* PROFILE MODAL */}
{showProfile && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowProfile(false)}>
    <div className={`${card} rounded-xl shadow-2xl max-w-md w-full`} onClick={e => e.stopPropagation()}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Profile</h2>
          <button onClick={() => setShowProfile(false)} className="p-2 rounded-lg hover:bg-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="text-center mb-6">
          <img src={currentUser?.avatar} alt="" className="w-24 h-24 rounded-full mx-auto mb-4" />
          <h3 className="text-xl font-bold">{currentUser?.name}</h3>
          <p className="text-sm text-gray-500">{currentUser?.email}</p>
          {isPremium && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full">
              <Crown className="w-4 h-4" />Premium
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className={`p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg`}>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{entries.length}</div>
                <div className="text-sm text-gray-500">Entries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{getStreakDays()}</div>
                <div className="text-sm text-gray-500">Streak</div>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* TEMPLATES MODAL */}
{showTemplates && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowTemplates(false)}>
    <div className={`${card} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Templates</h2>
          <button onClick={() => setShowTemplates(false)} className="p-2 rounded-lg hover:bg-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="grid gap-3">
          {templates.map(template => (
            <div key={template.id} onClick={() => applyTemplate(template)} className={`p-4 border ${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"} rounded-lg cursor-pointer`}>
              <h3 className="font-semibold mb-2">{template.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{template.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

{/* SHARE MODAL */}
{showShareModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowShareModal(false)}>
    <div className={`${card} rounded-xl shadow-2xl max-w-md w-full`} onClick={e => e.stopPropagation()}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Share Entry</h2>
          <button onClick={() => setShowShareModal(false)} className="p-2 rounded-lg hover:bg-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className={`p-3 ${darkMode ? "bg-gray-700" : "bg-gray-100"} rounded-lg`}>
            <p className="text-sm font-mono break-all">{shareableLink}</p>
          </div>
          <button onClick={copyShareLink} className="w-full px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />Copy Link
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* EXPORT MODAL */}
{showExportModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowExportModal(false)}>
    <div className={`${card} rounded-xl shadow-2xl max-w-md w-full`} onClick={e => e.stopPropagation()}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Export Data</h2>
          <button onClick={() => setShowExportModal(false)} className="p-2 rounded-lg hover:bg-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <button onClick={exportAllEntries} className={`w-full p-4 border ${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"} rounded-lg flex items-center gap-3`}>
            <CloudDownload className="w-6 h-6 text-indigo-500" />
            <div className="text-left">
              <div className="font-semibold">Export All Entries</div>
              <div className="text-sm text-gray-500">JSON {!isPremium && "(Premium)"}</div>
            </div>
          </button>
          <button onClick={() => { setShowExportModal(false); setShowImportModal(true); }} className={`w-full p-4 border ${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"} rounded-lg flex items-center gap-3`}>
            <CloudUpload className="w-6 h-6 text-purple-500" />
            <div className="text-left">
              <div className="font-semibold">Import Entries</div>
              <div className="text-sm text-gray-500">Upload backup</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* IMPORT MODAL */}
{showImportModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowImportModal(false)}>
    <div className={`${card} rounded-xl shadow-2xl max-w-md w-full`} onClick={e => e.stopPropagation()}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Import Data</h2>
          <button onClick={() => setShowImportModal(false)} className="p-2 rounded-lg hover:bg-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <input ref={importFileRef} type="file" accept=".json" onChange={importEntries} className="hidden" />
        <button onClick={() => importFileRef.current?.click()} className="w-full px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" />Select JSON File
        </button>
      </div>
    </div>
  </div>
)}

{/* ANALYTICS MODAL */}
{showAnalytics && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowAnalytics(false)}>
    <div className={`${card} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold">Analytics</h2>
          </div>
          <button onClick={() => setShowAnalytics(false)} className="p-2 rounded-lg hover:bg-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-6">
          <div className={`p-4 ${darkMode ? "bg-gray-700" : "bg-indigo-50"} rounded-lg`}>
            <h3 className="font-semibold mb-4 text-indigo-600">Writing Streak</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-indigo-600">{getStreakDays()}</div>
              <div>
                <div className="text-sm text-gray-600">days in a row</div>
                <div className="text-xs text-indigo-600">Keep it up! 🔥</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Activity</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg text-center`}>
                <div className="text-2xl font-bold text-purple-600">{getWeeklyStats()}</div>
                <div className="text-sm text-gray-500">This Week</div>
              </div>
              <div className={`p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg text-center`}>
                <div className="text-2xl font-bold text-pink-600">{entries.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length}</div>
                <div className="text-sm text-gray-500">This Month</div>
              </div>
              <div className={`p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg text-center`}>
                <div className="text-2xl font-bold text-blue-600">{publicEntries.length}</div>
                <div className="text-sm text-gray-500">Public</div>
              </div>
            </div>
          </div>
          <div className={`p-4 ${darkMode ? "bg-gray-700" : "bg-green-50"} rounded-lg`}>
            <h3 className="font-semibold mb-2 text-green-600">Total Words Written</h3>
            <div className="text-3xl font-bold text-green-600">
              {entries.filter(e => e.type === "written").reduce((sum, e) => sum + (e.wordCount || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* PREMIUM MODAL */}
{showPremiumModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowPremiumModal(false)}>
    <div className={`${card} rounded-xl shadow-2xl max-w-lg w-full`} onClick={e => e.stopPropagation()}>
      <div className="p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Upgrade to Premium</h2>
          <p className="text-gray-500">Unlock all features</p>
        </div>
        <div className="space-y-3 mb-6">
          <div className={`p-4 ${darkMode ? "bg-gray-700" : "bg-indigo-50"} rounded-lg flex items-center gap-3`}>
            <Video className="w-5 h-5 text-indigo-600" />
            <div className="text-sm">
              <div className="font-semibold">Unlimited Videos</div>
              <div className="text-gray-500">Record unlimited entries</div>
            </div>
          </div>
          <div className={`p-4 ${darkMode ? "bg-gray-700" : "bg-indigo-50"} rounded-lg flex items-center gap-3`}>
            <Bold className="w-5 h-5 text-indigo-600" />
            <div className="text-sm">
              <div className="font-semibold">Advanced Formatting</div>
              <div className="text-gray-500">Bold, italic, lists</div>
            </div>
          </div>
          <div className={`p-4 ${darkMode ? "bg-gray-700" : "bg-indigo-50"} rounded-lg flex items-center gap-3`}>
            <Upload className="w-5 h-5 text-indigo-600" />
            <div className="text-sm">
              <div className="font-semibold">Unlimited Images</div>
              <div className="text-gray-500">Add unlimited photos</div>
            </div>
          </div>
          <div className={`p-4 ${darkMode ? "bg-gray-700" : "bg-indigo-50"} rounded-lg flex items-center gap-3`}>
            <Download className="w-5 h-5 text-indigo-600" />
            <div className="text-sm">
              <div className="font-semibold">Export Everything</div>
              <div className="text-gray-500">Backup all entries</div>
            </div>
          </div>
        </div>
        <div className="border-t dark:border-gray-700 pt-6 mb-6 text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">$7.99/mo</div>
          <div className="text-sm text-gray-500">or $79.99/year (save 17%)</div>
        </div>
        <div className="space-y-3">
          <button onClick={upgradeToPremium} className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg">
            Start Free 7-Day Trial
          </button>
          <button onClick={() => setShowPremiumModal(false)} className="w-full px-6 py-3 text-gray-500 hover:bg-gray-700 rounded-lg">
            Maybe Later
          </button>
        </div>
        <p className="text-xs text-center mt-4 text-gray-500">Cancel anytime. No credit card required.</p>
      </div>
    </div>
  </div>
)}

{/* SETTINGS MODAL */}
{showSettings && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowSettings(false)}>
    <div className={`${card} rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg hover:bg-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-gray-500">Toggle theme</div>
              </div>
              <button onClick={() => setDarkMode(!darkMode)} className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? "bg-indigo-600" : "bg-gray-300"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Notifications</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Daily Reminders</div>
                <div className="text-sm text-gray-500">Get reminded to write</div>
              </div>
              <button onClick={() => setReminderEnabled(!reminderEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full ${reminderEnabled ? "bg-indigo-600" : "bg-gray-300"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${reminderEnabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Privacy</h3>
            <div className={`p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg`}>
              <div className="flex items-center justify-between">
                <span className="text-sm">Default Privacy</span>
                <select value={entryPrivacy} onChange={e => setEntryPrivacy(e.target.value)} className={`px-3 py-1 border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "border-gray-300"} rounded text-sm`}>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Data Management</h3>
            <div className="space-y-2">
              <button onClick={() => { setShowSettings(false); setShowExportModal(true); }} className={`w-full p-3 border ${darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"} rounded-lg flex items-center gap-3`}>
                <Download className="w-5 h-5 text-indigo-500" />
                <div className="text-left">
                  <div className="font-medium text-sm">Export Data</div>
                </div>
              </button>
              <button onClick={syncWithCloud} className={`w-full p-3 border ${darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"} rounded-lg flex items-center gap-3`}>
                <CloudUpload className="w-5 h-5 text-purple-500" />
                <div className="text-left">
                  <div className="font-medium text-sm">Sync Now</div>
                </div>
              </button>
            </div>
          </div>
          {isPremium && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-600">Premium Member</span>
              </div>
              <p className="text-sm text-gray-600">All features unlocked</p>
            </div>
          )}
          <div className="pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-500 space-y-1">
              <p>📊 Total: {entries.length}</p>
              <p>🎥 Videos: {entries.filter(e => e.type === "video").length}</p>
              <p>✍️ Written: {entries.filter(e => e.type === "written").length}</p>
              <p>🌐 Public: {publicEntries.length}</p>
              <p>🔒 Private: {entries.length - publicEntries.length}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>
      </div>
    </div>
  </div>
)}
</div>
</div>
);
}
