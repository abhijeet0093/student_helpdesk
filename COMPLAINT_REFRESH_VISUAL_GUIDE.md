# Complaint Status Refresh - Visual Guide

## New UI Elements

### 1. Header with Refresh Button
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back    My Complaints                                        │
│                                    [🔄 Refresh] [+ Raise New]   │
└─────────────────────────────────────────────────────────────────┘
```

**Refresh Button Features:**
- White background with indigo border
- Rotating arrow icon (spins when loading)
- Disabled during loading
- Hover effect: light indigo background

---

### 2. Success Message (After Refresh)
```
┌─────────────────────────────────────────────────────────────────┐
│ ✓  Complaints updated successfully!                             │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Green background with checkmark
- Auto-dismisses after 3 seconds
- Smooth fade-in animation

---

### 3. Filter Tabs with Last Updated
```
┌─────────────────────────────────────────────────────────────────┐
│  [All (5)]  [Pending (2)]  [In Progress (1)]  [Resolved (2)]   │
└─────────────────────────────────────────────────────────────────┘

🕐 Last updated: 14:35:22
```

**Features:**
- Shows exact time of last data fetch
- Updates on every refresh
- Clock icon for visual clarity

---

### 4. Complete Page Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ← Back    My Complaints          [🔄 Refresh] [+ Raise New]   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓  Complaints updated successfully!                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [All (5)]  [Pending (2)]  [In Progress (1)]  [Resolved (2)]  │
│                                                                 │
│  🕐 Last updated: 14:35:22                                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ CMP-001  [Infrastructure]              [Resolved]         │ │
│  │                                                           │ │
│  │ Broken Classroom Furniture                                │ │
│  │ The chairs in Room 301 are broken...                      │ │
│  │                                                           │ │
│  │ Priority: high  |  Assigned to: John Staff               │ │
│  │ Created: 10 Feb 2026  |  Updated: 14 Feb 2026            │ │
│  │                                                           │ │
│  │ ℹ️ Admin Remarks: Issue has been fixed. Please verify.   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ CMP-002  [Academic]                    [In Progress]      │ │
│  │                                                           │ │
│  │ Library Book Request                                      │ │
│  │ Need more reference books for...                          │ │
│  │                                                           │ │
│  │ Priority: medium  |  Assigned to: Jane Admin             │ │
│  │ Created: 12 Feb 2026  |  Updated: 14 Feb 2026            │ │
│  │                                                           │ │
│  │ ℹ️ Admin Remarks: We are working on this issue           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Status Badge Colors

### Pending
```
┌──────────┐
│ Pending  │  Orange background
└──────────┘
```

### In Progress
```
┌──────────────┐
│ In Progress  │  Blue background
└──────────────┘
```

### Resolved
```
┌──────────┐
│ Resolved │  Green background
└──────────┘
```

### Rejected
```
┌──────────┐
│ Rejected │  Red background
└──────────┘
```

---

## User Interaction Flow

### Scenario 1: Manual Refresh
```
1. Student views complaints
   └─> Status shows "Pending"

2. Admin updates status to "Resolved"
   └─> (In admin dashboard)

3. Student clicks "Refresh" button
   ├─> Button shows spinning icon
   ├─> Data fetches from server
   └─> Success message appears

4. Status now shows "Resolved"
   └─> Last updated timestamp updates
```

### Scenario 2: Auto-Refresh on Tab Switch
```
1. Student views complaints in Tab A
   └─> Status shows "Pending"

2. Student switches to Tab B
   └─> (Checks email, browses, etc.)

3. Admin updates status to "Resolved"
   └─> (While student is on Tab B)

4. Student switches back to Tab A
   ├─> Page automatically refreshes
   ├─> Success message appears
   └─> Status now shows "Resolved"
```

---

## Button States

### Normal State
```
┌──────────────┐
│ 🔄 Refresh   │  White bg, indigo border
└──────────────┘
```

### Hover State
```
┌──────────────┐
│ 🔄 Refresh   │  Light indigo bg
└──────────────┘
```

### Loading State
```
┌──────────────┐
│ ⟳ Refresh    │  Spinning icon, disabled
└──────────────┘
```

---

## Mobile Responsive Design

### Desktop (>1024px)
- Refresh button and Raise New button side by side
- Filter tabs in single row
- Complaint cards in full width

### Tablet (768px - 1024px)
- Buttons stack if needed
- Filter tabs scroll horizontally
- Complaint cards full width

### Mobile (<768px)
- Buttons stack vertically
- Filter tabs scroll horizontally
- Compact complaint cards
- Timestamp wraps to new line

---

## Animation Details

### Fade In (Success Message)
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Spin (Loading Icon)
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Slide Up (Complaint Cards)
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Color Palette

### Primary Colors
- Indigo: `#667eea` (buttons, active tabs)
- Blue: `#4299e1` (In Progress status)
- Green: `#48bb78` (Resolved status, success messages)
- Orange: `#ed8936` (Pending status)
- Red: `#f56565` (Rejected status, errors)

### Neutral Colors
- Gray 50: `#f9fafb` (page background)
- Gray 100: `#f3f4f6` (card hover)
- Gray 600: `#4b5563` (text)
- Gray 900: `#111827` (headings)

---

## Accessibility Features

1. **Keyboard Navigation**: All buttons are keyboard accessible
2. **Screen Readers**: Proper ARIA labels on buttons
3. **Color Contrast**: All text meets WCAG AA standards
4. **Loading States**: Clear visual feedback during operations
5. **Error Messages**: Clear error descriptions with retry options

---

## Performance Optimizations

1. **Debounced Refresh**: Prevents multiple simultaneous requests
2. **Conditional Rendering**: Only shows messages when needed
3. **Efficient State Updates**: Minimal re-renders
4. **Event Cleanup**: Removes focus listener on unmount
5. **Optimized API Calls**: Single endpoint for all complaints
