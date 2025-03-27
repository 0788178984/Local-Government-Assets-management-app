// Asset registration file
// This is a workaround for Metro bundling issues by defining a module that exports all assets
// This avoids the "missing-asset-registry-path" error

// Define network URLs for images (using centralized config)
import config from './config/config';

const assets = {
  // App icons
  icons: {
    logo: { uri: config.logoUrl },
    splash: { uri: config.imageBaseUrl + 'splash-icon.png' },
    favicon: { uri: config.imageBaseUrl + 'favicon.png' },
    adaptiveIcon: { uri: config.imageBaseUrl + 'adaptive-icon.png' },
    icon: { uri: config.imageBaseUrl + 'icon.png' }
  },
  
  // User images
  user: {
    defaultAvatar: { uri: config.defaultAvatarUrl },
    developerPhoto: { uri: config.developerPhotoUrl }
  }
};

export default assets;
