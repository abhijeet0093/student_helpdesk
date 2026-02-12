# Student Dashboard - Visual Guide

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        HEADER                                │
│  Welcome, Test Student!                        [Logout]      │
│  CS2024001 • Computer Science • Semester 5                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Complaint Summary                                           │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 📋       │  │ ⏳       │  │ 🔄       │  │ ✅       │   │
│  │ Total    │  │ Pending  │  │ Progress │  │ Resolved │   │
│  │   10     │  │    2     │  │    3     │  │    4     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Latest Complaint                                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CMP2024001                    [In Progress]         │  │
│  │  Infrastructure                                       │  │
│  │                                                       │  │
│  │  Created: 8 Feb 2024, 10:30                          │  │
│  │  Last Updated: 8 Feb 2024, 14:20                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Quick Actions                                               │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐ │
│  │ ➕ Raise New     │  │ 📋 View My       │  │ 💬 Student│ │
│  │    Complaint     │  │    Complaints    │  │    Corner │ │
│  └──────────────────┘  └──────────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Color Scheme

### Primary Colors
- **Purple Blue:** #667eea (Primary actions, borders)
- **White:** #ffffff (Card backgrounds)
- **Light Gray:** #f5f7fa (Page background)

### Status Colors
- **Orange:** #ff9800 (Pending)
- **Blue:** #2196f3 (In Progress)
- **Green:** #4caf50 (Resolved)
- **Red:** #f44336 (Rejected, Logout)

### Text Colors
- **Dark:** #333 (Headings)
- **Medium:** #666 (Body text)
- **Light:** #888 (Secondary text)

---

## Component Breakdown

### 1. Header Section
```
┌─────────────────────────────────────────────┐
│ Welcome, Test Student!        [Logout]      │
│ CS2024001 • Computer Science • Semester 5   │
└─────────────────────────────────────────────┘
```
- White background
- Border bottom
- Flex layout (space-between)
- Red logout button

### 2. Summary Card
```
┌──────────────┐
│ 📋 Total     │  ← Icon + Title
│              │
│     10       │  ← Large number
└──────────────┘
```
- White background
- Colored left border
- Hover effect (lift + shadow)
- Rounded corners

### 3. Status Badge
```
[In Progress]
```
- Rounded pill shape
- White text
- Colored background
- Uppercase text

### 4. Complaint Card
```
┌────────────────────────────────────┐
│ CMP2024001          [In Progress]  │
│ Infrastructure                     │
│ ─────────────────────────────────  │
│ Created: 8 Feb 2024, 10:30        │
│ Last Updated: 8 Feb 2024, 14:20   │
└────────────────────────────────────┘
```
- White background
- Rounded corners
- Divider line
- Flex layout

### 5. Action Button
```
┌──────────────────┐
│ ➕ Raise New     │
│    Complaint     │
└──────────────────┘
```
- Primary: Purple background, white text
- Secondary: White background, purple border
- Hover: Lift effect + shadow
- Icon + text

---

## Responsive Breakpoints

### Desktop (> 768px)
```
[Card] [Card] [Card] [Card]  ← 4 columns
```

### Tablet (768px - 480px)
```
[Card] [Card]  ← 2 columns
[Card] [Card]
```

### Mobile (< 480px)
```
[Card]  ← 1 column
[Card]
[Card]
[Card]
```

---

## User Interactions

### 1. Page Load
```
Loading... → Fetch Data → Display Dashboard
```

### 2. Logout
```
Click Logout → Clear Session → Redirect to Login
```

### 3. Quick Actions
```
Click Button → Navigate to Page
```

### 4. Error Handling
```
API Error → Show Error Message → [Retry Button]
```

---

## States

### Loading State
```
┌─────────────────────┐
│                     │
│    ⏳ Loading...    │
│                     │
└─────────────────────┘
```

### Error State
```
┌─────────────────────────────┐
│  Error Loading Dashboard    │
│  Failed to fetch data       │
│       [Retry]               │
└─────────────────────────────┘
```

### No Complaints State
```
┌─────────────────────────────┐
│  No complaints raised yet   │
│  Click "Raise New Complaint"│
│  to get started             │
└─────────────────────────────┘
```

---

## Typography

### Headings
- **H1:** 28px, Bold (Welcome message)
- **H2:** 20px, Semi-bold (Section titles)
- **H3:** 18px, Semi-bold (Complaint ID)

### Body Text
- **Regular:** 14px (Descriptions, labels)
- **Small:** 13px (Dates, metadata)
- **Large:** 32px (Statistics numbers)

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

---

## Spacing

### Padding
- **Cards:** 20-24px
- **Sections:** 30px (desktop), 20px (mobile)
- **Buttons:** 16px vertical, 24px horizontal

### Margins
- **Between sections:** 40px
- **Between cards:** 20px (grid gap)
- **Between elements:** 10-16px

### Border Radius
- **Cards:** 12px
- **Buttons:** 10px
- **Badges:** 20px (pill shape)

---

## Shadows

### Cards
```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
```

### Hover Effect
```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
```

### Button Hover
```css
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
```

---

## Animations

### Hover Effects
- **Cards:** Translate up 2px
- **Buttons:** Translate up 2px + shadow increase
- **Transition:** 0.2s - 0.3s ease

### Loading
- **Spinner:** Rotate 360deg in 1s

---

## Accessibility

### Semantic HTML
- `<header>` for header section
- `<main>` for main content
- `<section>` for each section
- `<button>` for clickable actions

### ARIA Labels
- Buttons have descriptive text
- Icons paired with text
- Status badges have clear text

### Keyboard Navigation
- All buttons are focusable
- Tab order is logical
- Enter key activates buttons

### Color Contrast
- Text meets WCAG AA standards
- Status colors are distinct
- Hover states are visible

---

## Performance

### Optimizations
- Single API call on mount
- No unnecessary re-renders
- CSS transitions (GPU accelerated)
- Efficient grid layout

### Loading Time
- Initial render: < 100ms
- API fetch: Depends on backend
- Total time to interactive: < 2s

---

## Browser Support

### Tested On
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Mobile Browsers
- ✅ Chrome Mobile
- ✅ Safari iOS
- ✅ Samsung Internet

---

## Summary

The dashboard provides:
- **Clear Overview:** At-a-glance statistics
- **Recent Activity:** Latest complaint status
- **Quick Access:** One-click navigation
- **Professional Look:** Clean, academic design
- **Responsive:** Works on all devices
- **User-Friendly:** Intuitive layout
