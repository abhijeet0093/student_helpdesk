# Dark Mode Example: StudentDashboard

## Complete Before & After Implementation

This document shows exactly how to update the StudentDashboard component with dark mode support.

---

## Changes Required

### 1. Import ThemeToggle

```javascript
// Add this import at the top
import ThemeToggle from '../components/ThemeToggle';
```

### 2. Update Main Container

**Before:**
```javascript
<div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
```

**After:**
```javascript
<div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
```

### 3. Update Sidebar

**Before:**
```javascript
<aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-600 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
```

**After:**
```javascript
<aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-600 dark:bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
```

### 4. Update Sidebar Menu Items

**Before:**
```javascript
className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
  isActive
    ? 'bg-white text-indigo-600 shadow-lg border-l-4 border-indigo-600'
    : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
}`}
```

**After:**
```javascript
className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
  isActive
    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-lg border-l-4 border-indigo-600 dark:border-indigo-400'
    : 'text-indigo-100 dark:text-gray-300 hover:bg-indigo-700 dark:hover:bg-slate-800 hover:text-white'
}`}
```

### 5. Update Navbar/Header

**Before:**
```javascript
<header className="bg-white shadow-md p-4 flex justify-between items-center">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
    <p className="text-sm text-gray-500">Welcome back, {studentInfo.name}</p>
  </div>
```

**After:**
```javascript
<header className="bg-white dark:bg-slate-800 shadow-md dark:shadow-lg p-4 flex justify-between items-center transition-colors duration-300">
  <div>
    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Dashboard</h1>
    <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {studentInfo.name}</p>
  </div>
```

### 6. Add ThemeToggle to Header

**Before:**
```javascript
<div className="flex items-center gap-4">
  {/* Notification Bell */}
  <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110">
```

**After:**
```javascript
<div className="flex items-center gap-4">
  {/* Notification Bell */}
  <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-300 hover:scale-110">
    {/* ... bell icon ... */}
  </button>

  {/* Theme Toggle - NEW */}
  <ThemeToggle />

  {/* Profile */}
  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-slate-700 rounded-xl transition-colors duration-300">
```

### 7. Update Profile Section

**Before:**
```javascript
<div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
    {studentInfo.name?.charAt(0).toUpperCase() || 'S'}
  </div>
  <div className="hidden md:block">
    <p className="text-sm font-semibold text-gray-900">{studentInfo.rollNumber}</p>
    <p className="text-xs text-gray-500">{studentInfo.department}</p>
  </div>
</div>
```

**After:**
```javascript
<div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-slate-700 rounded-xl transition-colors duration-300">
  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
    {studentInfo.name?.charAt(0).toUpperCase() || 'S'}
  </div>
  <div className="hidden md:block">
    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{studentInfo.rollNumber}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{studentInfo.department}</p>
  </div>
</div>
```

### 8. Update Welcome Card

**Before:**
```javascript
<div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white animate-fadeIn">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-3xl font-bold mb-2">Welcome back, {studentInfo.name}! 👋</h2>
      <p className="text-indigo-100 flex items-center gap-4 flex-wrap">
```

**After:**
```javascript
<div className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 rounded-2xl shadow-xl p-8 mb-8 text-white animate-fadeIn transition-colors duration-300">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-3xl font-bold mb-2">Welcome back, {studentInfo.name}! 👋</h2>
      <p className="text-indigo-100 dark:text-indigo-200 flex items-center gap-4 flex-wrap">
```

### 9. Update Stats Cards

**Before:**
```javascript
<div className="bg-white rounded-2xl shadow-lg p-6 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-l-4 border-indigo-500">
  <div className="flex items-center justify-between mb-4">
    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
```

**After:**
```javascript
<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-l-4 border-indigo-500 dark:border-indigo-400">
  <div className="flex items-center justify-between mb-4">
    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center">
      <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
```

### 10. Update Stats Card Text

**Before:**
```javascript
<h3 className="text-gray-500 text-sm font-medium mb-1">Total Complaints</h3>
<p className="text-3xl font-bold text-gray-900">{complaintStats.total}</p>
<div className="mt-2 flex items-center text-xs text-indigo-600">
```

**After:**
```javascript
<h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Complaints</h3>
<p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{complaintStats.total}</p>
<div className="mt-2 flex items-center text-xs text-indigo-600 dark:text-indigo-400">
```

### 11. Update Recent Activity Card

**Before:**
```javascript
<div className="bg-white rounded-2xl shadow-lg p-6">
  <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
  {recentComplaint ? (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100 hover:shadow-md transition-all duration-300">
```

**After:**
```javascript
<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-6 transition-colors duration-300">
  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Recent Activity</h2>
  {recentComplaint ? (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-indigo-100 dark:border-slate-600 hover:shadow-md transition-all duration-300">
```

### 12. Update Recent Activity Text

**Before:**
```javascript
<h3 className="text-lg font-bold text-gray-900 mb-2">{recentComplaint.complaintId}</h3>
<span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
  {recentComplaint.category}
</span>
```

**After:**
```javascript
<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{recentComplaint.complaintId}</h3>
<span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
  {recentComplaint.category}
</span>
```

### 13. Update Empty State

**Before:**
```javascript
<div className="text-center py-12">
  <div className="text-6xl mb-4">📋</div>
  <h3 className="text-xl font-bold text-gray-900 mb-2">No complaints yet</h3>
  <p className="text-gray-500 mb-6">Click "Raise Complaint" from the sidebar to get started</p>
```

**After:**
```javascript
<div className="text-center py-12">
  <div className="text-6xl mb-4">📋</div>
  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No complaints yet</h3>
  <p className="text-gray-500 dark:text-gray-400 mb-6">Click "Raise Complaint" from the sidebar to get started</p>
```

---

## Complete Code Snippet: Header with Dark Mode

Here's the complete header section with all dark mode classes:

```javascript
<header className="bg-white dark:bg-slate-800 shadow-md dark:shadow-lg p-4 flex justify-between items-center transition-colors duration-300">
  <div>
    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Dashboard</h1>
    <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {studentInfo.name}</p>
  </div>
  
  <div className="flex items-center gap-4">
    {/* Notification Bell */}
    <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-300 hover:scale-110">
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
        {studentInfo.name?.charAt(0).toUpperCase() || 'S'}
      </div>
      <div className="hidden md:block">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{studentInfo.rollNumber}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{studentInfo.department}</p>
      </div>
    </div>
  </div>
</header>
```

---

## Testing Checklist

After making these changes:

- [ ] Import ThemeToggle component
- [ ] Theme toggle button appears in header
- [ ] Clicking toggle switches between light and dark
- [ ] Theme persists on page reload
- [ ] Sidebar changes color
- [ ] Header changes color
- [ ] Cards change color
- [ ] Text is readable in both modes
- [ ] Stats cards have proper contrast
- [ ] Welcome card looks good in both modes
- [ ] Recent activity card adapts properly
- [ ] All transitions are smooth
- [ ] No flickering when switching themes

---

## Visual Preview

### Light Mode
```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Student Dashboard          🔔 ☀️ [Profile]  │
│  Indigo    │  Welcome back, John! 👋                       │
│            │                                                │
│  Dashboard │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  Complaints│  │ Total: 5 │ │Pending:3 │ │Resolved:1│     │
│  Results   │  └──────────┘ └──────────┘ └──────────┘     │
│            │                                                │
│            │  Recent Activity                              │
│            │  ┌─────────────────────────────────────────┐ │
│            │  │ CMP00005 - IT Services                  │ │
│            │  │ Status: Pending                         │ │
│            │  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Dark Mode
```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Student Dashboard          🔔 🌙 [Profile]  │
│  Dark      │  Welcome back, John! 👋                       │
│  Slate     │                                                │
│            │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  Dashboard │  │ Total: 5 │ │Pending:3 │ │Resolved:1│     │
│  Complaints│  └──────────┘ └──────────┘ └──────────┘     │
│  Results   │                                                │
│            │  Recent Activity                              │
│            │  ┌─────────────────────────────────────────┐ │
│            │  │ CMP00005 - IT Services                  │ │
│            │  │ Status: Pending                         │ │
│            │  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

**Total Changes:** ~15 className updates + 1 import
**Time Required:** 10-15 minutes
**Difficulty:** Easy (copy-paste)

**Key Pattern:**
- Add `dark:` prefix to colors
- Add `transition-colors duration-300` for smooth changes
- Import and place `<ThemeToggle />` in header

**Next Steps:**
1. Apply same pattern to AdminDashboard
2. Apply to StaffDashboard
3. Update MyComplaints page
4. Update CreateComplaint form
5. Test all pages

