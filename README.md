# Google Maps Explorer

A modern, interactive Google Maps application with a beautiful UI and comprehensive features for exploring locations, saving favorites, and getting directions.

## 🌟 Features

### Core Features
- **Interactive Map**: Full Google Maps integration with multiple map types (Roadmap, Satellite, Hybrid, Terrain)
- **Smart Search**: Search for places, addresses, or landmarks with Places API integration
- **Current Location**: Get your current location with geolocation support
- **Click to Add**: Click anywhere on the map to add custom markers
- **Real-time Coordinates**: Display current map center coordinates

### Advanced Features
- **Save Locations**: Bookmark your favorite places with local storage persistence
- **Quick Places**: One-click navigation to popular cities (New York, London, Tokyo, Paris, Sydney)
- **Directions**: Get directions to any location via Google Maps
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations
- **Keyboard Shortcuts**: Ctrl/Cmd + K to focus search, Escape to clear

### User Experience
- **Smart Notifications**: Toast notifications for user feedback
- **Loading States**: Visual feedback during API calls
- **Info Windows**: Rich popup windows with save and directions options
- **Sidebar Management**: Organized controls and saved locations panel
- **Error Handling**: Graceful error handling with user-friendly messages

## 🚀 Setup Instructions

### 1. Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API key)
5. (Optional) Restrict your API key to specific domains for security

### 2. Configure the Application

1. Open `index.html` in your code editor
2. Find line 112 where it says:
   ```html
   src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initMap"
   ```
3. Replace `YOUR_API_KEY` with your actual Google Maps API key

### 3. Run the Application

#### Option 1: Local Development Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open your browser and navigate to `http://localhost:8000`

#### Option 2: Direct File Opening
Simply open `index.html` in your web browser. Note that some features (like geolocation) may require HTTPS in production.

## 📱 Usage Guide

### Basic Operations

1. **Search for Places**:
   - Type in the search box and press Enter or click the search button
   - Use quick place buttons for popular cities
   - Search supports addresses, landmarks, and business names

2. **Navigate the Map**:
   - Drag to pan
   - Scroll or use controls to zoom
   - Switch between map types using the dropdown

3. **Add Markers**:
   - Click anywhere on the map to add a custom marker
   - Search results automatically add markers
   - Use "My Location" to add your current position

4. **Manage Saved Locations**:
   - Click any marker to open an info window
   - Click "Save" to bookmark the location
   - View saved locations in the sidebar
   - Click "View" to navigate to a saved location
   - Click "Remove" to delete a saved location

### Keyboard Shortcuts

- `Ctrl/Cmd + K`: Focus search input
- `Escape`: Clear search input and unfocus
- `Enter`: Search when search input is focused

### Mobile Usage

The application is fully responsive and touch-friendly:
- Tap to add markers
- Pinch to zoom
- Swipe to pan
- Sidebar adapts to mobile layout

## 🛠️ Technical Details

### Technologies Used
- **Google Maps JavaScript API**: Core mapping functionality
- **Google Places API**: Location search and details
- **Google Geocoding API**: Address conversion
- **Vanilla JavaScript**: No frameworks, pure JavaScript
- **CSS3**: Modern styling with flexbox and grid
- **HTML5**: Semantic markup and geolocation
- **Local Storage**: Persistent data storage

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### File Structure
```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md          # Documentation
```

## 🔧 Customization

### Adding New Quick Places
Edit the quick places section in `index.html`:
```html
<button class="quick-place-btn" data-place="Your City">Your City</button>
```

### Changing Default Location
In `script.js`, modify the `defaultLocation` variable:
```javascript
const defaultLocation = { lat: YOUR_LAT, lng: YOUR_LNG };
```

### Styling Customization
The application uses CSS custom properties. Key colors can be modified in `styles.css`:
- Primary color: `#4c51bf`
- Success color: `#10b981`
- Error color: `#ef4444`
- Warning color: `#f59e0b`

## 🔒 Security Considerations

1. **API Key Security**: 
   - Restrict your API key to specific domains
   - Monitor API usage in Google Cloud Console
   - Never commit API keys to public repositories

2. **HTTPS**: 
   - Use HTTPS in production for geolocation features
   - Consider using environment variables for API keys

## 🐛 Troubleshooting

### Common Issues

1. **Map doesn't load**:
   - Check if your API key is correctly set
   - Ensure required APIs are enabled
   - Check browser console for errors

2. **Search doesn't work**:
   - Verify Places API is enabled
   - Check API key permissions
   - Ensure internet connection

3. **Geolocation fails**:
   - Check if location permission is granted
   - Ensure you're using HTTPS (required by modern browsers)
   - Verify geolocation is supported

### Debug Mode
Open browser developer tools (F12) to see console logs and error messages.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review Google Maps API documentation
3. Open an issue in the repository

---

Built with ❤️ using Google Maps API