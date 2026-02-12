# AI Chat - Visual Guide

## Interface Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← Back    AI Study Assistant    Clear                  │  ← Header (Green)
│            Ask me anything about your studies           │
└─────────────────────────────────────────────────────────┘
│                                                         │
│                    CHAT AREA                            │
│                 (Beige Background)                      │
│                                                         │
│  ┌──────────────────────┐                              │
│  │ Hello! How can I     │  10:30 AM                    │  ← AI Message (White, Left)
│  │ help you today?      │                              │
│  └──────────────────────┘                              │
│                                                         │
│                              ┌──────────────────────┐  │
│                     10:31 AM │ I need help with    │  │  ← Student Message (Green, Right)
│                              │ exam preparation    │  │
│                              └──────────────────────┘  │
│                                                         │
│  ┌──────────────────────┐                              │
│  │ Great! Here are some │  10:31 AM                    │  ← AI Message
│  │ tips for exam prep:  │                              │
│  │ 1. Start early       │                              │
│  │ 2. Make a schedule   │                              │
│  └──────────────────────┘                              │
│                                                         │
│  ┌──────────────────────┐                              │
│  │ ● ● ●                │                              │  ← Typing Indicator
│  └──────────────────────┘                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
│ [Type your message here...]                      [➤]   │  ← Input Area
│ Press Enter to send • Shift+Enter for new line        │
└─────────────────────────────────────────────────────────┘
```

---

## Welcome Screen (No Messages)

```
┌─────────────────────────────────────────────────────────┐
│  ← Back    AI Study Assistant    Clear                  │
└─────────────────────────────────────────────────────────┘
│                                                         │
│                                                         │
│                    ┌─────────────┐                      │
│                    │             │                      │
│                    │     🤖      │                      │
│                    │             │                      │
│                    └─────────────┘                      │
│                                                         │
│              Hello, Test Student!                       │
│                                                         │
│         I'm your AI study assistant.                    │
│           Ask me anything about:                        │
│                                                         │
│           • Study tips and techniques                   │
│           • Exam preparation strategies                 │
│           • Subject explanations                        │
│           • Time management                             │
│           • Academic guidance                           │
│                                                         │
│       Type your question below to get started!          │
│                                                         │
└─────────────────────────────────────────────────────────┘
│ [Type your message here...]                      [➤]   │
└─────────────────────────────────────────────────────────┘
```

---

## Message Bubble Styles

### Student Message (Right-Aligned)
```
                              ┌──────────────────────┐
                     10:30 AM │ How can I improve   │
                              │ my study habits?    │
                              └──────────────────────┘
```
- Background: #dcf8c6 (Light green)
- Aligned: Right
- Border radius: 8px (2px bottom-right)
- Max width: 70%

### AI Message (Left-Aligned)
```
┌──────────────────────┐
│ Here are some tips:  │  10:31 AM
│ 1. Set a schedule    │
│ 2. Take breaks       │
└──────────────────────┘
```
- Background: #ffffff (White)
- Aligned: Left
- Border radius: 8px (2px bottom-left)
- Max width: 70%

### Typing Indicator
```
┌──────────────────────┐
│ ● ● ●                │
└──────────────────────┘
```
- Three animated dots
- Bounce animation
- White background
- Left-aligned

---

## Color Palette

### Primary Colors
```
Header Background:    #075e54 (WhatsApp Green)
Chat Background:      #e5ddd5 (Light Beige)
Student Bubble:       #dcf8c6 (Light Green)
AI Bubble:            #ffffff (White)
```

### Text Colors
```
Primary Text:         #303030 (Dark Gray)
Secondary Text:       #667781 (Medium Gray)
Timestamp:            #667781 (Medium Gray)
Error Text:           #c33 (Red)
```

### Button Colors
```
Send Button:          #075e54 (Green)
Send Button Hover:    #064d44 (Darker Green)
Back/Clear Button:    rgba(255,255,255,0.2) (Transparent White)
Disabled Button:      #ccc (Light Gray)
```

---

## Typography

### Font Sizes
```
Header Title:         18px (Bold)
Header Subtitle:      12px (Regular)
Message Text:         14px (Regular)
Timestamp:            11px (Regular)
Input Text:           15px (Regular)
Hint Text:            11px (Regular)
Welcome Title:        24px (Bold)
Welcome Text:         15px (Regular)
```

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

---

## Spacing & Layout

### Padding
```
Header:               15px 20px
Chat Area:            20px
Message Bubble:       10px 14px
Input Area:           10px 20px
Welcome Screen:       40px
```

### Margins
```
Between Messages:     12px
Between Sections:     20px
```

### Border Radius
```
Message Bubbles:      8px
Input Field:          24px (Rounded)
Send Button:          50% (Circle)
Buttons:              6px
```

---

## Animations

### Fade In (New Messages)
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
Duration: 0.3s
```

### Typing Dots
```css
@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}
Duration: 1.4s (infinite)
Delay: 0s, 0.2s, 0.4s (for 3 dots)
```

### Button Hover
```css
transform: scale(1.05);
transition: 0.3s ease;
```

---

## Responsive Breakpoints

### Desktop (> 768px)
```
┌─────────────────────────────────────────┐
│  Header (Full Width)                    │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐                           │
│  │ AI Msg   │                           │
│  └──────────┘                           │
│                    ┌──────────┐         │
│                    │ Student  │         │
│                    └──────────┘         │
│                                         │
├─────────────────────────────────────────┤
│  [Input Field]                    [➤]  │
└─────────────────────────────────────────┘
```
- Bubble max-width: 70%
- Font size: 14px
- Padding: 20px

### Tablet (768px - 480px)
```
┌───────────────────────────────────┐
│  Header                           │
├───────────────────────────────────┤
│                                   │
│  ┌──────────┐                     │
│  │ AI Msg   │                     │
│  └──────────┘                     │
│              ┌──────────┐         │
│              │ Student  │         │
│              └──────────┘         │
│                                   │
├───────────────────────────────────┤
│  [Input]                    [➤]  │
└───────────────────────────────────┘
```
- Bubble max-width: 85%
- Font size: 14px
- Padding: 15px

### Mobile (< 480px)
```
┌─────────────────────────────┐
│  Header (Compact)           │
├─────────────────────────────┤
│                             │
│  ┌──────────┐               │
│  │ AI Msg   │               │
│  └──────────┘               │
│          ┌──────────┐       │
│          │ Student  │       │
│          └──────────┘       │
│                             │
├─────────────────────────────┤
│  [Input]              [➤]  │
└─────────────────────────────┘
```
- Bubble max-width: 90%
- Font size: 13px
- Padding: 15px
- Compact buttons

---

## Interactive States

### Input Field States
```
Normal:    Border: #ddd, Background: white
Focus:     Border: #075e54, Background: white
Disabled:  Border: #ddd, Background: #f5f5f5
```

### Send Button States
```
Normal:    Background: #075e54, Cursor: pointer
Hover:     Background: #064d44, Scale: 1.05
Disabled:  Background: #ccc, Cursor: not-allowed
```

### Message States
```
Sending:   Opacity: 1, Animation: fadeIn
Sent:      Opacity: 1, No animation
Error:     Red border (optional)
```

---

## Error Display

### Error Banner
```
┌─────────────────────────────────────────┐
│  ⚠ Message must be at least 3 characters │
└─────────────────────────────────────────┘
```
- Background: #fee (Light red)
- Border: 1px solid #fcc
- Text: #c33 (Red)
- Position: Above input field

### Error as AI Message
```
┌──────────────────────────────────────┐
│ Sorry, I encountered an error:      │  10:32 AM
│ Failed to get response. Please      │
│ try again.                           │
└──────────────────────────────────────┘
```
- Same style as normal AI message
- Contains error text

---

## Scrollbar Styling

### Custom Scrollbar
```
Width:       6px
Track:       Transparent
Thumb:       rgba(0,0,0,0.2)
Thumb Hover: rgba(0,0,0,0.3)
Border Radius: 3px
```

---

## Button Styles

### Back Button
```
┌──────────┐
│ ← Back   │
└──────────┘
```
- Background: rgba(255,255,255,0.2)
- Color: white
- Padding: 8px 16px
- Border radius: 6px

### Clear Button
```
┌──────────┐
│  Clear   │
└──────────┘
```
- Background: rgba(255,255,255,0.2)
- Color: white
- Padding: 8px 16px
- Border radius: 6px

### Send Button
```
┌────┐
│ ➤  │
└────┘
```
- Background: #075e54 (Circle)
- Color: white
- Size: 48x48px
- Icon: ➤ (Arrow)

---

## Loading States

### While Typing
```
Input:     Disabled (gray background)
Send:      Disabled (gray background)
Indicator: Visible (animated dots)
```

### While Loading History
```
Silent loading (no spinner)
Falls back to empty state on error
```

---

## Accessibility Features

### Keyboard Navigation
```
Tab:           Navigate between elements
Enter:         Send message
Shift+Enter:   New line in message
Escape:        Clear input (optional)
```

### Focus Indicators
```
Input:   Blue border on focus
Buttons: Outline on focus
```

### Screen Reader Support
```
Buttons:  Descriptive text
Messages: Semantic HTML
Errors:   Clear error messages
```

---

## User Flow

### First Visit
```
1. See welcome screen
2. Read AI capabilities
3. Type first message
4. Press Enter or click Send
5. See typing indicator
6. Receive AI response
7. Continue conversation
```

### Returning Visit
```
1. Chat history loads automatically
2. See previous messages
3. Continue conversation
4. Or clear history to start fresh
```

---

## Performance Metrics

### Load Time
```
Initial Render:     < 100ms
History Load:       < 500ms (depends on backend)
Message Send:       Instant (optimistic UI)
AI Response:        1-3s (depends on backend)
Auto-scroll:        Smooth (CSS animation)
```

### Optimization
```
✅ Single API call per message
✅ Efficient state updates
✅ CSS animations (GPU accelerated)
✅ No unnecessary re-renders
✅ Lazy loading ready
```

---

## Summary

The AI Chat interface provides:
- **Familiar Design:** WhatsApp-like experience
- **Smooth Interaction:** Instant feedback, auto-scroll
- **Clear Communication:** Color-coded messages
- **Error Handling:** Graceful error display
- **Responsive:** Works on all devices
- **Accessible:** Keyboard support, clear focus
- **Academic Focus:** Study-oriented welcome message
