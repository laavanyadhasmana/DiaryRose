// src/config/constants.ts
export const MOOD_OPTIONS = [
    { value: 'happy', label: '😊 Happy', emoji: '😊' },
    { value: 'sad', label: '😢 Sad', emoji: '😢' },
    { value: 'excited', label: '🤩 Excited', emoji: '🤩' },
    { value: 'calm', label: '😌 Calm', emoji: '😌' },
    { value: 'anxious', label: '😰 Anxious', emoji: '😰' },
    { value: 'neutral', label: '😐 Neutral', emoji: '😐' },
    { value: 'grateful', label: '🙏 Grateful', emoji: '🙏' },
    { value: 'angry', label: '😠 Angry', emoji: '😠' }
  ];
  
  export const PRIVACY_OPTIONS = [
    { value: 'PRIVATE', label: '🔒 Private' },
    { value: 'PUBLIC', label: '🌐 Public' }
  ];
  
  export const ENTRY_TYPE = {
    WRITTEN: 'WRITTEN' as const,
    VIDEO: 'VIDEO' as const
  };
  
  export const LIMITS = {
    FREE: {
      VIDEOS_PER_MONTH: 10,
      VIDEO_DURATION: 300, // 5 minutes
      IMAGES_PER_ENTRY: 3,
      STORAGE_GB: 5
    },
    PREMIUM: {
      VIDEOS_PER_MONTH: -1, // Unlimited
      VIDEO_DURATION: 1800, // 30 minutes
      IMAGES_PER_ENTRY: -1, // Unlimited
      STORAGE_GB: 100
    }
  };
  
  export const PREMIUM_FEATURES = [
    {
      icon: '🎥',
      title: 'Unlimited Videos',
      description: 'Record as many video entries as you want'
    },
    {
      icon: '⏱️',
      title: 'Extended Duration',
      description: 'Up to 30 minutes per video'
    },
    {
      icon: '🖼️',
      title: 'Unlimited Images',
      description: 'Add as many photos as you like'
    },
    {
      icon: '💾',
      title: '100GB Storage',
      description: 'Plenty of space for all your memories'
    },
    {
      icon: '📝',
      title: 'Advanced Formatting',
      description: 'Bold, italic, lists, and more'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Insights about your journaling habits'
    },
    {
      icon: '📥',
      title: 'Export & Backup',
      description: 'Download all your entries anytime'
    },
    {
      icon: '🎨',
      title: 'Custom Themes',
      description: 'Personalize your diary experience'
    }
  ];
  
