// Test file to verify English display functionality
export const testMessages = {
  welcome_message: {
    key: "welcome_message",
    defaultValue: "Welcome to our educational platform! {{userName}}",
  },
  course_title: {
    key: "course_title",
    defaultValue: "Advanced Teaching Methods",
  },
  navigation: {
    home: {
      key: "navigation.home",
      defaultValue: "Home",
    },
    courses: {
      key: "navigation.courses",
      defaultValue: "Courses",
    },
    profile: {
      key: "navigation.profile",
      defaultValue: "User Profile",
    },
  },
  settings: {
    language: {
      key: "settings.language",
      defaultValue: "Language Settings",
    },
    notifications: {
      key: "settings.notifications",
      defaultValue: "Notification Preferences",
    },
  },
};

// Expected English output (alphabetically sorted, snake_case):
/*
advanced_teaching_methods: Advanced Teaching Methods
course_title: Advanced Teaching Methods
home: Home
language_settings: Language Settings
navigation_courses: Courses
navigation_home: Home
navigation_profile: User Profile
notification_preferences: Notification Preferences
settings_language: Language Settings
settings_notifications: Notification Preferences
user_profile: User Profile
welcome_message: Welcome to our educational platform! {{userName}}
*/
