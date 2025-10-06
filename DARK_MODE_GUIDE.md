# Dark Mode Implementation Guide

## Overview
The Medicine Tracking System now supports both light and dark modes, providing users with a comfortable viewing experience in different lighting conditions. The implementation uses Tailwind CSS's class-based dark mode system with React Context for state management.

## Features

### ✨ Key Features
- **Automatic Theme Detection**: Respects user's system preference on first visit
- **Manual Toggle**: Users can switch between light and dark modes via the header toggle button
- **Persistent Preference**: Theme choice is saved to localStorage
- **Smooth Transitions**: CSS transitions for seamless theme switching
- **Comprehensive Coverage**: Dark mode styles applied across all components

### 🎨 Visual Elements
- Custom dark mode color palette using Tailwind's gray scale
- Adjusted primary, success, warning, and danger colors for dark mode
- Dark-themed scrollbars
- Properly styled shadows and borders

## Architecture

### 1. Theme Context (`ThemeContext.tsx`)
Located at: `frontend/src/contexts/ThemeContext.tsx`

**Purpose**: Manages theme state globally across the application

**Key Functions**:
- `useTheme()`: Hook to access theme state and toggle function
- `toggleTheme()`: Switches between light and dark modes
- `setTheme(theme)`: Directly sets a specific theme

**Features**:
- Initializes from localStorage or system preference
- Applies theme via CSS class on document root
- Listens for system theme changes

**Usage Example**:
```tsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### 2. Tailwind Configuration
Located at: `frontend/tailwind.config.js`

**Dark Mode Strategy**: `class` - Requires `.dark` class on root element

```javascript
module.exports = {
  darkMode: 'class', // Enables class-based dark mode
  // ... rest of config
}
```

### 3. Global Styles
Located at: `frontend/src/index.css`

**Custom Dark Mode Enhancements**:
- Dark-themed scrollbars
- Global transition properties for smooth theme changes
- Transition applied to: `background-color`, `border-color`, `color`

## Component Updates

### Updated Components with Dark Mode Support

#### Layout Components
1. **Header** (`components/layout/Header.tsx`)
   - Theme toggle button with sun/moon icons
   - Dark mode styles for notifications dropdown
   - Dark mode profile menu

2. **Sidebar** (`components/layout/Sidebar.tsx`)
   - Dark background and text colors
   - Adjusted navigation item styles
   - Dark mode user info section

3. **Layout** (`components/layout/Layout.tsx`)
   - Dark background for main content area

#### UI Components
1. **Card** (`components/ui/Card.tsx`)
   - Dark background and border colors
   - Styled header, body, and footer sections

2. **Input** (`components/ui/Input.tsx`)
   - Dark input backgrounds
   - Adjusted label and helper text colors
   - Dark mode error states

3. **Modal** (`components/ui/Modal.tsx`)
   - Dark modal background
   - Dark overlay
   - Styled close button

#### Pages
1. **LoginPage** (`pages/auth/LoginPage.tsx`)
   - Dark mode login form
   - Adjusted input fields and error messages
   - Dark themed brand elements

## Color Palette

### Dark Mode Color Scheme

#### Background Colors
- **Primary Background**: `dark:bg-gray-900` (Main app background)
- **Secondary Background**: `dark:bg-gray-800` (Cards, modals, header)
- **Tertiary Background**: `dark:bg-gray-700` (Inputs, hover states)

#### Text Colors
- **Primary Text**: `dark:text-white`
- **Secondary Text**: `dark:text-gray-300`
- **Muted Text**: `dark:text-gray-400`
- **Disabled Text**: `dark:text-gray-500`

#### Border Colors
- **Default Borders**: `dark:border-gray-700`
- **Subtle Borders**: `dark:border-gray-600`

#### Interactive Elements
- **Hover States**: `dark:hover:bg-gray-700`
- **Active States**: `dark:bg-primary-900`
- **Focus Rings**: Uses primary color (same as light mode)

## Usage Guidelines

### For Developers

#### Adding Dark Mode to New Components

**Basic Pattern**:
```tsx
// Light mode class | Dark mode class
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

**Border Example**:
```tsx
<div className="border border-gray-200 dark:border-gray-700">
  Content
</div>
```

**Interactive Example**:
```tsx
<button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
  Click me
</button>
```

#### Best Practices

1. **Always Provide Both Variants**
   - Include both light and dark mode classes for all visual elements
   - Don't rely on inheritance alone

2. **Test in Both Modes**
   - Verify components in both light and dark modes
   - Check contrast ratios for accessibility

3. **Use Consistent Color Scales**
   - Light mode: gray-50 to gray-200 for backgrounds
   - Dark mode: gray-700 to gray-900 for backgrounds

4. **Mind the Transitions**
   - Global transitions are applied automatically
   - Avoid adding redundant transition classes

5. **Accessibility**
   - Ensure sufficient contrast in both modes
   - Test with color blindness simulators

### For Users

#### Changing Theme

**Option 1: Header Toggle Button**
- Click the sun/moon icon in the header
- Toggle between light and dark modes

**Option 2: System Preference**
- If no preference is saved, the app follows your system theme
- Change your OS theme settings to switch automatically

#### Theme Persistence
- Your theme choice is automatically saved
- The same theme will load on your next visit
- Clearing browser data will reset to system preference

## Technical Details

### How Theme Detection Works

1. **Initial Load**:
   ```
   Check localStorage → Saved theme exists?
   ↓ Yes: Use saved theme
   ↓ No: Check system preference
   → Apply theme
   ```

2. **Theme Toggle**:
   ```
   User clicks toggle
   → Update state
   → Add/Remove .dark class on <html>
   → Save to localStorage
   ```

3. **System Preference Listener**:
   ```
   System theme changes
   → No saved preference?
   → Update theme automatically
   ```

### Performance Considerations

- **CSS Transitions**: Limited to specific properties to avoid performance issues
- **Context Updates**: Theme changes trigger minimal re-renders
- **Class-Based**: More performant than inline styles
- **No Flash**: Theme applied before initial render

## Troubleshooting

### Common Issues

**Issue**: Theme doesn't persist after refresh
- **Solution**: Check if localStorage is enabled in browser

**Issue**: Some components don't change theme
- **Solution**: Verify dark mode classes are applied to all elements

**Issue**: Flash of wrong theme on load
- **Solution**: Ensure ThemeProvider wraps entire app and theme is initialized early

**Issue**: Icons or images too bright in dark mode
- **Solution**: Apply `dark:opacity-80` or use SVG fill colors

## Future Enhancements

Potential improvements for the dark mode feature:

1. **High Contrast Mode**: Additional theme variant for accessibility
2. **Custom Theme Colors**: Allow users to customize accent colors
3. **Scheduled Theme**: Auto-switch based on time of day
4. **Per-Page Themes**: Different themes for different sections
5. **Theme Animations**: More elaborate transition effects

## Browser Support

Dark mode is supported in all modern browsers:
- Chrome/Edge: 76+
- Firefox: 67+
- Safari: 12.1+
- Opera: 62+

## Files Modified

### Core Theme Files
- `frontend/src/contexts/ThemeContext.tsx` (New)
- `frontend/tailwind.config.js` (Modified)
- `frontend/src/index.css` (Modified)
- `frontend/src/App.tsx` (Modified)

### Layout Components
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/Layout.tsx`

### UI Components
- `frontend/src/components/ui/Card.tsx`
- `frontend/src/components/ui/Input.tsx`
- `frontend/src/components/ui/Modal.tsx`

### Pages
- `frontend/src/pages/auth/LoginPage.tsx`

## Resources

- [Tailwind CSS Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode)
- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: 2025-10-06
**Version**: 1.0.0
