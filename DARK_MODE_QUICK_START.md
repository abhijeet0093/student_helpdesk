# Dark Mode - Quick Start Guide

## ✅ Already Implemented

1. **Tailwind Config** - Dark mode enabled
2. **Theme Context** - State management ready
3. **Theme Toggle** - Component created
4. **Global Styles** - Dark mode classes added

## 🚀 Quick Integration (5 Minutes)

### Step 1: Add ThemeToggle to Your Dashboard

```javascript
// At the top of your file
import ThemeToggle from '../components/ThemeToggle';

// In your navbar/header section
<div className="flex items-center gap-4">
  {/* Notification Bell */}
  <button className="...">🔔</button>
  
  {/* Add Theme Toggle */}
  <ThemeToggle />
  
  {/* Profile */}
  <div className="...">Profile</div>
</div>
```

### Step 2: Update Your Page Container

```javascript
// Find your main container div
// Add dark mode classes:

<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
  {/* Your content */}
</div>
```

### Step 3: Update Sidebar

```javascript
<aside className="w-64 bg-indigo-600 dark:bg-slate-900 text-white transition-colors duration-300">
  {/* Sidebar content */}
</aside>
```

### Step 4: Update Navbar

```javascript
<header className="bg-white dark:bg-slate-800 shadow-md dark:shadow-lg p-4 transition-colors duration-300">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
    Dashboard
  </h1>
</header>
```

### Step 5: Update Cards

```javascript
<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 transition-all duration-300">
  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
    Total Complaints
  </h3>
  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
    {complaintStats.total}
  </p>
</div>
```

## 📋 Copy-Paste Patterns

### Pattern 1: Page Container
```javascript
className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
```

### Pattern 2: Card
```javascript
className="bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-xl p-6 transition-colors duration-300"
```

### Pattern 3: Text Heading
```javascript
className="text-2xl font-bold text-gray-900 dark:text-gray-100"
```

### Pattern 4: Text Body
```javascript
className="text-gray-600 dark:text-gray-300"
```

### Pattern 5: Input
```javascript
className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
```

### Pattern 6: Button Secondary
```javascript
className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-300"
```

### Pattern 7: Table Header
```javascript
className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200"
```

### Pattern 8: Table Row
```javascript
className="border-t border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
```

## 🎨 Color Reference

### Backgrounds
- Page: `bg-gray-50 dark:bg-gray-900`
- Card: `bg-white dark:bg-slate-800`
- Sidebar: `bg-indigo-600 dark:bg-slate-900`
- Input: `bg-white dark:bg-slate-700`

### Text
- Heading: `text-gray-900 dark:text-gray-100`
- Body: `text-gray-600 dark:text-gray-300`
- Muted: `text-gray-500 dark:text-gray-400`

### Borders
- Default: `border-gray-300 dark:border-slate-600`
- Light: `border-gray-200 dark:border-slate-700`

## ✅ Testing Checklist

- [ ] Theme toggle appears in navbar
- [ ] Clicking toggle switches theme
- [ ] Theme persists on page reload
- [ ] All text is readable in both modes
- [ ] Cards have proper contrast
- [ ] Inputs are visible and usable
- [ ] Hover states work in both modes
- [ ] Transitions are smooth (no flickering)

## 🐛 Common Issues

### Issue: Toggle not working
**Fix:** Check if ThemeProvider wraps your App in App.js

### Issue: Some elements not changing
**Fix:** Add `transition-colors duration-300` to the element

### Issue: Text not readable
**Fix:** Add dark mode text classes: `dark:text-gray-100`

## 📱 Example: Complete Dashboard Header

```javascript
<header className="bg-white dark:bg-slate-800 shadow-md dark:shadow-lg p-4 flex justify-between items-center transition-colors duration-300">
  <div>
    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
      Student Dashboard
    </h1>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Welcome back, {studentInfo.name}
    </p>
  </div>
  
  <div className="flex items-center gap-4">
    {/* Notification Bell */}
    <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-300">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
    </button>

    {/* Theme Toggle */}
    <ThemeToggle />

    {/* Profile */}
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-slate-700 rounded-xl transition-colors duration-300">
      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
        {studentInfo.name?.charAt(0).toUpperCase()}
      </div>
      <div className="hidden md:block">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {studentInfo.rollNumber}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {studentInfo.department}
        </p>
      </div>
    </div>
  </div>
</header>
```

## 🎯 Priority Pages to Update

1. **StudentDashboard** - Main student interface
2. **AdminDashboard** - Admin interface
3. **StaffDashboard** - Staff interface
4. **MyComplaints** - Complaint list
5. **CreateComplaint** - Complaint form
6. **Login/Register** - Auth pages

## 📊 Estimated Time

- Per page: 10-15 minutes
- Total (6 main pages): 1-2 hours
- Testing: 30 minutes

---

**Ready to go!** Start with StudentDashboard and work your way through each page.

