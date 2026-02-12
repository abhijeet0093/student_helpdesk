# Module 5: Student Dashboard & Student Corner
## Smart Campus Helpdesk & Student Ecosystem

---

## MODULE PURPOSE

This module focuses on enhancing the student experience by providing:
- ✅ A clean, easy-to-use dashboard for quick access
- ✅ A safe academic social space for peer learning
- ✅ Encouragement for knowledge sharing and collaboration
- ✅ College-appropriate content and interactions
- ✅ Non-technical, student-friendly interface

---

## PART A: STUDENT DASHBOARD

### 1. DASHBOARD FEATURES EXPLANATION

The student dashboard is designed to be **simple, clean, and focused**. Think of it as your personal college homepage where you can see everything important at a glance.

### What Students See When They Login:

```
┌─────────────────────────────────────────────────────────────┐
│                    WELCOME, RAHUL!                           │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  PROFILE CARD    │  │  COMPLAINT CARD  │                │
│  │                  │  │                  │                │
│  │  Name: Rahul     │  │  Total: 5        │                │
│  │  Roll: CS2024001 │  │  Pending: 1      │                │
│  │  Dept: CS        │  │  Resolved: 4     │                │
│  │  Year: 3rd       │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  QUICK ACTIONS                                       │   │
│  │  [Raise Complaint] [My Complaints] [Student Corner] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  NOTIFICATIONS                                       │   │
│  │  • Your complaint CMP2024001 has been resolved       │   │
│  │  • New post in Student Corner: "Java Notes"         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LATEST COMPLAINT STATUS                             │   │
│  │  CMP2024001 - Broken projector                      │   │
│  │  Status: Resolved ✓                                  │   │
│  │  Resolution: Projector repaired, new bulb installed │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```


---

### Feature 1: Profile Summary Card

**What It Shows:**
- Student's full name
- Roll number
- Department
- Current year/semester
- Profile picture (optional)

**Why This Matters:**
- Students can quickly verify they're logged into the right account
- Shows personalized greeting: "Welcome, Rahul!"
- Makes the system feel friendly and personal

**Data Source:**
- Fetched from `users` collection
- Linked to `student_master` for verified information
- Updated automatically if admin changes master data

**Example:**
```javascript
{
  name: "Rahul Kumar Sharma",
  rollNumber: "CS2024001",
  department: "Computer Science",
  semester: 6,
  batch: "2021-2025",
  profilePicture: "/uploads/profiles/rahul.jpg"
}
```


---

### Feature 2: Complaint Overview Card

**What It Shows:**
- Total complaints raised by student
- Number of pending complaints
- Number of resolved complaints
- Number of closed complaints

**Why This Matters:**
- Students can see their complaint history at a glance
- Encourages students to check status before raising duplicate complaints
- Shows system is tracking their issues

**Visual Representation:**
```
┌─────────────────────────┐
│  MY COMPLAINTS          │
├─────────────────────────┤
│  Total:      5          │
│  Pending:    1  🟡      │
│  In-Progress: 0  🔵     │
│  Resolved:   4  🟢      │
│  Closed:     0  ⚫      │
└─────────────────────────┘
```

**Data Calculation:**
```javascript
const complaintStats = {
  total: await Complaint.countDocuments({ 
    studentId: userId 
  }),
  pending: await Complaint.countDocuments({ 
    studentId: userId,
    status: 'pending' 
  }),
  inProgress: await Complaint.countDocuments({ 
    studentId: userId,
    status: 'in-progress' 
  }),
  resolved: await Complaint.countDocuments({ 
    studentId: userId,
    status: 'resolved' 
  }),
  closed: await Complaint.countDocuments({ 
    studentId: userId,
    status: 'closed' 
  })
};
```


---

### Feature 3: Quick Actions

**Three Big Buttons:**

**1. Raise New Complaint**
- Bright, prominent button
- Takes student directly to complaint form
- Most important action for helpdesk

**2. My Complaints**
- Shows list of all complaints
- Can filter by status
- Can view details and track progress

**3. Student Corner**
- Opens the academic social space
- See what peers are sharing
- Post study materials or questions

**Why Quick Actions?**
- Students don't have to search through menus
- One-click access to main features
- Reduces confusion for non-technical students
- Makes system feel fast and responsive


---

### Feature 4: Notifications Area

**What Students See:**
- Latest 5 notifications
- Complaint status updates
- Admin remarks on their complaints
- New posts in Student Corner (optional)
- System announcements

**Notification Types:**

**1. Complaint Updates:**
```
🔔 Your complaint CMP2024001 has been assigned to Mr. Rajesh Kumar
   2 hours ago
```

**2. Resolution Notifications:**
```
✅ Your complaint CMP2024001 has been resolved
   Resolution: Projector repaired, new bulb installed
   1 day ago
```

**3. Admin Remarks:**
```
💬 Admin added a remark to your complaint CMP2024001
   "We are working on this. Will be fixed by tomorrow."
   3 hours ago
```

**4. Student Corner Activity:**
```
📚 New post in Student Corner: "Data Structures Notes - Unit 3"
   Posted by Priya Sharma (CS2024045)
   30 minutes ago
```

**Why Notifications?**
- Students stay informed without checking repeatedly
- Reduces anxiety about complaint status
- Encourages engagement with Student Corner
- Shows system is active and responsive


---

### Feature 5: Latest Complaint Status

**Shows Most Recent Complaint:**
- Complaint ID
- Subject
- Current status with color indicator
- Resolution notes (if resolved)
- Quick link to view full details

**Example Display:**
```
┌─────────────────────────────────────────────────┐
│  LATEST COMPLAINT                               │
├─────────────────────────────────────────────────┤
│  CMP2024001                                     │
│  Broken projector in Room 301                   │
│                                                 │
│  Status: Resolved ✓                             │
│  Assigned to: Mr. Rajesh Kumar                  │
│  Resolved on: Feb 7, 2024                       │
│                                                 │
│  Resolution:                                    │
│  "Projector has been repaired. New bulb         │
│   installed. Tested and working fine."          │
│                                                 │
│  [View Full Details]                            │
└─────────────────────────────────────────────────┘
```

**Why Show Latest Complaint?**
- Students usually care most about their recent issue
- Provides immediate status without clicking
- Shows resolution notes for transparency
- Reduces support queries ("What happened to my complaint?")


---

### Dashboard Data Flow

**Step 1: Student Logs In**
- Student enters roll number and password
- System verifies credentials
- Generates JWT token
- Redirects to dashboard

**Step 2: Dashboard Loads**
```javascript
// Frontend makes parallel API calls for fast loading
Promise.all([
  fetch('/api/student/profile'),           // Get profile data
  fetch('/api/student/complaint-stats'),   // Get complaint statistics
  fetch('/api/student/latest-complaint'),  // Get latest complaint
  fetch('/api/student/notifications')      // Get notifications
])
.then(([profile, stats, latest, notifications]) => {
  // Display all data on dashboard
  setProfile(profile);
  setComplaintStats(stats);
  setLatestComplaint(latest);
  setNotifications(notifications);
});
```

**Step 3: Backend Processes Requests**

**Profile Request:**
```javascript
GET /api/student/profile
Authorization: Bearer <token>

// Backend
const userId = req.user.id;
const user = await User.findById(userId)
  .select('fullName rollNumber department semester batch profilePicture');

return res.json({
  success: true,
  data: user
});
```

**Complaint Stats Request:**
```javascript
GET /api/student/complaint-stats
Authorization: Bearer <token>

// Backend
const userId = req.user.id;

const stats = {
  total: await Complaint.countDocuments({ studentId: userId }),
  pending: await Complaint.countDocuments({ studentId: userId, status: 'pending' }),
  inProgress: await Complaint.countDocuments({ studentId: userId, status: 'in-progress' }),
  resolved: await Complaint.countDocuments({ studentId: userId, status: 'resolved' }),
  closed: await Complaint.countDocuments({ studentId: userId, status: 'closed' })
};

return res.json({
  success: true,
  data: stats
});
```

**Latest Complaint Request:**
```javascript
GET /api/student/latest-complaint
Authorization: Bearer <token>

// Backend
const userId = req.user.id;

const latestComplaint = await Complaint.findOne({ 
  studentId: userId 
})
.sort({ createdAt: -1 })  // Most recent first
.select('complaintId subject status assignedToName resolutionNotes resolvedAt createdAt');

return res.json({
  success: true,
  data: latestComplaint
});
```

**Notifications Request:**
```javascript
GET /api/student/notifications?limit=5
Authorization: Bearer <token>

// Backend
const userId = req.user.id;

const notifications = await Notification.find({ 
  recipientId: userId,
  recipientRole: 'student'
})
.sort({ createdAt: -1 })
.limit(5)
.select('type title message isRead createdAt actionUrl');

return res.json({
  success: true,
  data: notifications
});
```

**Step 4: Frontend Displays Dashboard**
- Shows all data in organized cards
- Uses loading spinners while fetching
- Shows error messages if any API fails
- Dashboard is fully loaded in 1-2 seconds


---

### Why Dashboard is Kept Simple

**Reason 1: Not All Students Are Tech-Savvy**
- Many students are from non-technical backgrounds
- Complex interfaces confuse them
- Simple = Less support queries

**Reason 2: Mobile-Friendly**
- Students access from phones
- Simple layout works on small screens
- No horizontal scrolling needed

**Reason 3: Fast Loading**
- Only essential information shown
- Loads quickly even on slow internet
- Students in hostels often have poor connectivity

**Reason 4: Clear Purpose**
- Dashboard has one job: Show important info quickly
- No distractions or unnecessary features
- Students can find what they need in 5 seconds

**Reason 5: Reduces Cognitive Load**
- Students are already stressed with studies
- Don't make them think about how to use the system
- Everything is obvious and intuitive

**Example of What We AVOID:**
```
❌ Complex charts and graphs
❌ Too many colors and animations
❌ Nested menus and dropdowns
❌ Technical jargon
❌ Cluttered layout with 20+ widgets
```

**What We DO Instead:**
```
✅ Simple cards with clear labels
✅ Big, obvious buttons
✅ Plain language ("My Complaints" not "Ticket Management")
✅ Clean white space
✅ 3-4 main sections only
```


---

### How This Helps Non-Technical Students

**Scenario 1: First-Time User**

**Without Simple Dashboard:**
- Student logs in, sees complex interface
- Gets confused, doesn't know where to click
- Calls friend for help
- Takes 10 minutes to raise a complaint

**With Simple Dashboard:**
- Student logs in, sees "Raise Complaint" button
- Clicks it immediately
- Fills form and submits
- Takes 2 minutes total

**Scenario 2: Checking Complaint Status**

**Without Simple Dashboard:**
- Student navigates through menus
- Finds "Complaints" section
- Clicks on complaint ID
- Views status

**With Simple Dashboard:**
- Student logs in
- Sees latest complaint status immediately
- No clicking needed
- Status visible in 1 second

**Scenario 3: Student from Rural Background**

**Challenge:**
- Never used web applications before
- Uncomfortable with technology
- Afraid of making mistakes

**How Simple Dashboard Helps:**
- Everything is labeled clearly in simple language
- Big buttons are hard to miss
- Can't really "break" anything
- Builds confidence with each successful action

**Real-World Impact:**
- 90% of students can use system without training
- Support queries reduced by 70%
- Students actually USE the system instead of avoiding it
- Positive feedback: "It's so easy, even my junior can use it!"


---

## PART B: STUDENT CORNER

### What is Student Corner?

**Think of it as:**
- A digital notice board for academic content
- A place where students help each other learn
- A safe space for asking doubts
- A knowledge-sharing platform

**NOT:**
- Social media like Facebook/Instagram
- Entertainment platform
- Chat room
- Off-topic discussion forum

**Purpose:**
- Encourage peer learning
- Share study materials
- Help each other with doubts
- Build academic community

---

### Student Corner Features

### Feature 1: Post Creation

**What Students Can Post:**

**1. Study Tips**
```
Example Post:
Title: "How I Scored 95 in Data Structures"
Content: "Here are 5 tips that helped me:
1. Practice coding daily
2. Understand concepts, don't memorize
3. Solve previous year questions
..."
```

**2. Notes and Study Materials**
```
Example Post:
Title: "Operating Systems - Unit 3 Notes"
Content: "Sharing my handwritten notes for OS Unit 3.
Topics covered:
- Process Scheduling
- Deadlock
- Memory Management"
Attachment: os_unit3_notes.pdf
```

**3. Exam Guidance**
```
Example Post:
Title: "Important Topics for DBMS End-Term"
Content: "Based on previous years, these topics are important:
- Normalization (always comes)
- SQL queries (20 marks)
- Transaction management
Good luck everyone!"
```

**4. Doubt Questions**
```
Example Post:
Title: "Doubt: Difference between Stack and Queue?"
Content: "Can someone explain the practical difference?
I understand the theory but confused about when to use which.
Any real-world examples?"
```

**5. Resource Sharing**
```
Example Post:
Title: "Best YouTube Channel for Java"
Content: "I found this channel really helpful for Java:
[Link to channel]
Explains concepts in simple Hindi/English.
Helped me clear my basics."
```


---

### Post Creation Form

**Simple Form Fields:**

```
┌─────────────────────────────────────────────────┐
│  CREATE POST                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Category: [Dropdown]                           │
│  ☐ Study Tips                                   │
│  ☐ Notes/Materials                              │
│  ☐ Exam Guidance                                │
│  ☐ Doubt/Question                               │
│  ☐ Resource Sharing                             │
│                                                 │
│  Title: [Text Input]                            │
│  Example: "Java Notes - Unit 2"                 │
│                                                 │
│  Content: [Text Area]                           │
│  Write your post here...                        │
│  (Minimum 20 characters)                        │
│                                                 │
│  Tags: [Text Input]                             │
│  Example: java, programming, notes              │
│                                                 │
│  Attach File (Optional):                        │
│  [Choose File] (PDF, Images only, Max 10MB)    │
│                                                 │
│  [Cancel]  [Post]                               │
└─────────────────────────────────────────────────┘
```

**Validation Rules:**
- Title: 10-100 characters
- Content: Minimum 20 characters
- File: PDF, JPG, PNG only, Max 10MB
- Tags: Optional, max 5 tags
- Category: Required


---

### Feature 2: Feed System

**How Posts Are Displayed:**

```
┌─────────────────────────────────────────────────────────────┐
│  STUDENT CORNER                                              │
│  [Create Post]  [My Posts]  [Saved Posts]                   │
├─────────────────────────────────────────────────────────────┤
│  Sort by: [Latest ▼]  Filter: [All Categories ▼]            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📚 Notes/Materials                                     │ │
│  │ Operating Systems - Unit 3 Notes                       │ │
│  │ Posted by: Priya Sharma (CS2024045)                   │ │
│  │ 2 hours ago                                            │ │
│  │                                                        │ │
│  │ Sharing my handwritten notes for OS Unit 3...         │ │
│  │ [Read More]                                            │ │
│  │                                                        │ │
│  │ 📎 Attachment: os_unit3_notes.pdf (2.5 MB)            │ │
│  │                                                        │ │
│  │ 👍 45 Likes  💬 12 Comments  🔖 Save  ⚠️ Report       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ❓ Doubt/Question                                      │ │
│  │ Difference between Stack and Queue?                    │ │
│  │ Posted by: Amit Singh (ME2024023)                     │ │
│  │ 5 hours ago                                            │ │
│  │                                                        │ │
│  │ Can someone explain the practical difference?...      │ │
│  │ [Read More]                                            │ │
│  │                                                        │ │
│  │ 👍 8 Likes  💬 15 Comments  🔖 Save  ⚠️ Report        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Load More Posts]                                           │
└─────────────────────────────────────────────────────────────┘
```

**Sorting Options:**
- Latest (default) - Newest posts first
- Most Liked - Popular posts first
- Most Commented - Active discussions first
- Trending - Combination of likes, comments, and recency

**Filter Options:**
- All Categories
- Study Tips
- Notes/Materials
- Exam Guidance
- Doubt/Question
- Resource Sharing

**Search Functionality:**
- Search by title
- Search by tags
- Search by author name


---

### Feature 3: Interactions (Controlled)

### 3.1 Like/Upvote System

**How It Works:**
- Student clicks "Like" button on a post
- Like count increases
- Student can unlike by clicking again
- One student can like a post only once

**Why Likes?**
- Shows appreciation for helpful content
- Helps identify quality posts
- Motivates students to share more
- No negative voting (no dislikes) to keep environment positive

**Implementation:**
```javascript
// Student clicks like
POST /api/student-corner/posts/:postId/like
Authorization: Bearer <token>

// Backend
const post = await Post.findById(postId);
const userId = req.user.id;

// Check if already liked
const alreadyLiked = await Like.findOne({
  postId: postId,
  userId: userId
});

if (alreadyLiked) {
  // Unlike
  await Like.deleteOne({ _id: alreadyLiked._id });
  post.likeCount -= 1;
} else {
  // Like
  await Like.create({
    postId: postId,
    userId: userId,
    createdAt: new Date()
  });
  post.likeCount += 1;
}

await post.save();
```


---

### 3.2 Comment System

**How Comments Work:**

**Viewing Comments:**
```
┌─────────────────────────────────────────────────┐
│  COMMENTS (15)                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Neha Gupta (CS2024078)                        │
│  "Thanks for sharing! Very helpful notes."      │
│  2 hours ago                                    │
│                                                 │
│  Vikram Patel (CS2024012)                      │
│  "Can you also share Unit 4 notes?"            │
│  1 hour ago                                     │
│                                                 │
│  Priya Sharma (CS2024045) [Author]             │
│  "@Vikram Yes, will upload next week!"         │
│  30 minutes ago                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│  Add Comment:                                   │
│  [Text Input]                                   │
│  [Post Comment]                                 │
└─────────────────────────────────────────────────┘
```

**Comment Rules:**
- Minimum 5 characters
- Maximum 500 characters
- Must be academic/helpful
- No abusive language
- Can edit own comments within 5 minutes
- Can delete own comments anytime

**Comment Validation:**
```javascript
// Check for inappropriate content
const inappropriateWords = ['bad_word1', 'bad_word2', ...];

function validateComment(text) {
  // Check length
  if (text.length < 5) {
    return { valid: false, error: 'Comment too short' };
  }
  
  if (text.length > 500) {
    return { valid: false, error: 'Comment too long (max 500 characters)' };
  }
  
  // Check for inappropriate words
  const lowerText = text.toLowerCase();
  for (const word of inappropriateWords) {
    if (lowerText.includes(word)) {
      return { valid: false, error: 'Inappropriate content detected' };
    }
  }
  
  return { valid: true };
}
```


---

### 3.3 Save Post Feature

**Why Save Posts?**
- Students can bookmark helpful posts
- Access saved posts anytime from "My Saved Posts"
- Like a personal study resource library

**How It Works:**
- Click "Save" button on any post
- Post added to "Saved Posts" section
- Can unsave anytime
- Private (only student can see their saved posts)

**Use Cases:**
- Save exam tips for later revision
- Bookmark important notes
- Keep track of helpful resources
- Build personal study collection


---

### Feature 4: Content Rules & Moderation

### Content Guidelines (Shown to Students)

**✅ ALLOWED:**
- Study tips and techniques
- Class notes and summaries
- Exam preparation guidance
- Academic doubts and questions
- Resource recommendations (books, videos, websites)
- Project ideas and guidance
- Career advice related to studies
- Internship/placement preparation tips

**❌ NOT ALLOWED:**
- Personal attacks or bullying
- Abusive or offensive language
- Political or religious discussions
- Entertainment content (memes, jokes)
- Spam or advertisements
- Copied content without credit
- Personal information sharing
- Off-topic discussions

**Consequences:**
- First violation: Warning
- Second violation: Post removed
- Third violation: Account suspended for 7 days
- Serious violations: Permanent ban + admin notification


---

### Report System

**How Students Report Inappropriate Content:**

**Step 1: Student Clicks "Report" Button**
- Modal opens with report form

**Step 2: Select Reason**
```
┌─────────────────────────────────────────┐
│  REPORT POST                            │
├─────────────────────────────────────────┤
│  Why are you reporting this post?       │
│                                         │
│  ☐ Inappropriate content                │
│  ☐ Spam or advertisement                │
│  ☐ Abusive language                     │
│  ☐ Off-topic (not academic)             │
│  ☐ Copied content                       │
│  ☐ Personal information shared          │
│  ☐ Other                                │
│                                         │
│  Additional details (optional):         │
│  [Text Area]                            │
│                                         │
│  [Cancel]  [Submit Report]              │
└─────────────────────────────────────────┘
```

**Step 3: Report Submitted**
- Report saved in database
- Admin notified
- Student sees confirmation: "Thank you for reporting. We will review this post."

**Step 4: Admin Reviews**
- Admin sees reported posts in dashboard
- Reviews content and report reason
- Takes action:
  - Approve (no violation found)
  - Remove post
  - Warn author
  - Suspend author

**Auto-Moderation:**
- If post gets 5+ reports, automatically hidden until admin reviews
- Prevents harmful content from spreading
- Admin still makes final decision


---

## DATABASE DESIGN

### Collection 1: `student_corner_posts`

**Purpose:** Store all posts created by students

**Complete Schema:**
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789abcdef0"),
  
  // Post Identification
  postId: "POST2024001",                 // Unique post ID
  
  // Author Information
  authorId: ObjectId("user_id_here"),    // Reference to users collection
  authorName: "Priya Sharma",            // Cached for display
  authorRollNumber: "CS2024045",         // Cached for display
  authorDepartment: "Computer Science",  // Cached for display
  
  // Post Content
  category: "Notes/Materials",           // Study Tips | Notes/Materials | Exam Guidance | Doubt/Question | Resource Sharing
  title: "Operating Systems - Unit 3 Notes",
  content: "Sharing my handwritten notes for OS Unit 3. Topics covered: Process Scheduling, Deadlock, Memory Management...",
  
  // Tags for searchability
  tags: ["operating-systems", "notes", "unit3", "os"],
  
  // Attachments
  attachments: [
    {
      fileName: "os_unit3_notes.pdf",
      filePath: "/uploads/student-corner/2024/02/os_unit3_notes_1707456789.pdf",
      fileSize: 2621440,                 // 2.5 MB in bytes
      mimeType: "application/pdf",
      uploadedAt: ISODate("2024-02-08T10:30:00Z")
    }
  ],
  
  // Engagement Metrics
  likeCount: 45,
  commentCount: 12,
  saveCount: 23,
  viewCount: 156,
  
  // Moderation
  isApproved: true,                      // Auto-approved, can be changed by admin
  isHidden: false,                       // Hidden if reported multiple times
  reportCount: 0,
  
  // Status
  isActive: true,                        // Can be deactivated by author or admin
  isDeleted: false,                      // Soft delete
  
  // Timestamps
  createdAt: ISODate("2024-02-08T10:30:00Z"),
  updatedAt: ISODate("2024-02-08T10:30:00Z"),
  deletedAt: null,
  
  // Edit History (optional)
  isEdited: false,
  editedAt: null
}
```

**Indexes for Performance:**
```javascript
postSchema.index({ postId: 1 }, { unique: true });
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ isActive: 1, isHidden: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: 'text', content: 'text' });  // Text search
```


---

### Collection 2: `student_corner_likes`

**Purpose:** Track which students liked which posts

**Complete Schema:**
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789abcdef0"),
  
  // Post Reference
  postId: ObjectId("post_id_here"),
  
  // User Reference
  userId: ObjectId("user_id_here"),
  userName: "Rahul Kumar Sharma",       // Cached for display
  userRollNumber: "CS2024001",
  
  // Timestamp
  createdAt: ISODate("2024-02-08T11:00:00Z")
}
```

**Indexes:**
```javascript
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });  // One like per user per post
likeSchema.index({ userId: 1, createdAt: -1 });
likeSchema.index({ postId: 1 });
```

**Why Separate Collection?**
- Easy to check if user already liked a post
- Can show "Liked by: Rahul, Priya, and 43 others"
- Can track user's liked posts
- Prevents duplicate likes


---

### Collection 3: `student_corner_comments`

**Purpose:** Store comments on posts

**Complete Schema:**
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789abcdef0"),
  
  // Post Reference
  postId: ObjectId("post_id_here"),
  
  // Author Information
  authorId: ObjectId("user_id_here"),
  authorName: "Neha Gupta",
  authorRollNumber: "CS2024078",
  authorDepartment: "Computer Science",
  
  // Comment Content
  content: "Thanks for sharing! Very helpful notes.",
  
  // Moderation
  isApproved: true,
  isHidden: false,
  reportCount: 0,
  
  // Status
  isActive: true,
  isDeleted: false,
  
  // Timestamps
  createdAt: ISODate("2024-02-08T12:00:00Z"),
  updatedAt: ISODate("2024-02-08T12:00:00Z"),
  deletedAt: null,
  
  // Edit tracking
  isEdited: false,
  editedAt: null
}
```

**Indexes:**
```javascript
commentSchema.index({ postId: 1, createdAt: 1 });  // Get comments for a post
commentSchema.index({ authorId: 1, createdAt: -1 });  // Get user's comments
commentSchema.index({ isActive: 1, isHidden: 1 });
```


---

### Collection 4: `student_corner_saves`

**Purpose:** Track saved posts by students

**Complete Schema:**
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789abcdef0"),
  
  // Post Reference
  postId: ObjectId("post_id_here"),
  
  // User Reference
  userId: ObjectId("user_id_here"),
  
  // Timestamp
  savedAt: ISODate("2024-02-08T13:00:00Z")
}
```

**Indexes:**
```javascript
saveSchema.index({ postId: 1, userId: 1 }, { unique: true });  // One save per user per post
saveSchema.index({ userId: 1, savedAt: -1 });  // Get user's saved posts
```


---

### Collection 5: `student_corner_reports`

**Purpose:** Track reported posts and comments

**Complete Schema:**
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789abcdef0"),
  
  // What is being reported
  reportType: "post",                    // post | comment
  reportedItemId: ObjectId("post_or_comment_id"),
  
  // Who reported
  reportedBy: ObjectId("user_id_here"),
  reportedByName: "Rahul Kumar Sharma",
  reportedByRollNumber: "CS2024001",
  
  // Report Details
  reason: "Inappropriate content",       // Predefined reasons
  additionalDetails: "This post contains offensive language and is not academic.",
  
  // Status
  status: "pending",                     // pending | reviewed | action_taken | dismissed
  
  // Admin Action
  reviewedBy: ObjectId("admin_id_here"),
  reviewedByName: "Dr. Rajesh Kumar",
  reviewedAt: null,
  adminAction: null,                     // removed | warned | no_action
  adminNotes: null,
  
  // Timestamps
  reportedAt: ISODate("2024-02-08T14:00:00Z"),
  resolvedAt: null
}
```

**Indexes:**
```javascript
reportSchema.index({ reportedItemId: 1, reportedBy: 1 }, { unique: true });  // One report per user per item
reportSchema.index({ status: 1, reportedAt: -1 });
reportSchema.index({ reportType: 1, status: 1 });
```


---

### Collection 6: `student_corner_views`

**Purpose:** Track post views for analytics (optional)

**Complete Schema:**
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789abcdef0"),
  
  // Post Reference
  postId: ObjectId("post_id_here"),
  
  // Viewer Information
  viewerId: ObjectId("user_id_here"),
  
  // Timestamp
  viewedAt: ISODate("2024-02-08T15:00:00Z")
}
```

**Note:** This is optional. Can also just increment viewCount in post document without tracking individual views.


---

## STUDENT CORNER WORKFLOW (STEP-BY-STEP)

### Workflow 1: Creating a Post

**Step 1: Student Opens Student Corner**
- Clicks "Student Corner" from dashboard
- Sees feed of existing posts

**Step 2: Student Clicks "Create Post"**
- Modal or new page opens with post form

**Step 3: Student Fills Form**
- Selects category: "Notes/Materials"
- Enters title: "Operating Systems - Unit 3 Notes"
- Writes content: "Sharing my handwritten notes..."
- Adds tags: "operating-systems, notes, unit3"
- Uploads file: os_unit3_notes.pdf (2.5 MB)

**Step 4: Frontend Validates**
```javascript
// Check title length
if (title.length < 10 || title.length > 100) {
  return error("Title must be 10-100 characters");
}

// Check content length
if (content.length < 20) {
  return error("Content must be at least 20 characters");
}

// Check file size
if (file && file.size > 10 * 1024 * 1024) {
  return error("File size must be less than 10MB");
}

// Check file type
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
if (file && !allowedTypes.includes(file.type)) {
  return error("Only PDF and images allowed");
}
```

**Step 5: Upload File First (if attached)**
```javascript
const formData = new FormData();
formData.append('file', file);

const uploadResponse = await fetch('/api/student-corner/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { filePath } = await uploadResponse.json();
```

**Step 6: Submit Post**
```javascript
POST /api/student-corner/posts
Authorization: Bearer <token>

Body: {
  category: "Notes/Materials",
  title: "Operating Systems - Unit 3 Notes",
  content: "Sharing my handwritten notes for OS Unit 3...",
  tags: ["operating-systems", "notes", "unit3"],
  attachments: [{
    filePath: "/uploads/student-corner/2024/02/os_unit3_notes_1707456789.pdf",
    fileName: "os_unit3_notes.pdf",
    fileSize: 2621440,
    mimeType: "application/pdf"
  }]
}
```

**Step 7: Backend Creates Post**
```javascript
// Extract user from token
const userId = req.user.id;
const user = await User.findById(userId);

// Generate post ID
const postCount = await Post.countDocuments();
const postId = `POST${new Date().getFullYear()}${String(postCount + 1).padStart(6, '0')}`;
// Result: POST2024000001

// Create post
const post = await Post.create({
  postId: postId,
  authorId: user._id,
  authorName: user.fullName,
  authorRollNumber: user.rollNumber,
  authorDepartment: user.department,
  category: req.body.category,
  title: req.body.title,
  content: req.body.content,
  tags: req.body.tags,
  attachments: req.body.attachments,
  likeCount: 0,
  commentCount: 0,
  saveCount: 0,
  viewCount: 0,
  isApproved: true,  // Auto-approve, admin can review later
  isHidden: false,
  reportCount: 0,
  isActive: true,
  isDeleted: false,
  createdAt: new Date()
});

return res.json({
  success: true,
  message: "Post created successfully",
  data: {
    postId: post.postId,
    createdAt: post.createdAt
  }
});
```

**Step 8: Frontend Shows Success**
- Shows success message: "Post created successfully!"
- Redirects to feed
- New post appears at top of feed


---

### Workflow 2: Viewing Feed

**Step 1: Student Opens Student Corner**
```javascript
GET /api/student-corner/posts?page=1&limit=10&sort=latest
Authorization: Bearer <token>
```

**Step 2: Backend Fetches Posts**
```javascript
// Build query
const query = {
  isActive: true,
  isHidden: false,
  isDeleted: false
};

// Apply filters if provided
if (req.query.category) {
  query.category = req.query.category;
}

if (req.query.search) {
  query.$text = { $search: req.query.search };
}

// Pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

// Sorting
let sort = { createdAt: -1 };  // Default: latest first

if (req.query.sort === 'popular') {
  sort = { likeCount: -1, createdAt: -1 };
} else if (req.query.sort === 'trending') {
  // Trending = combination of likes, comments, and recency
  // Can use aggregation for complex scoring
}

// Fetch posts
const posts = await Post.find(query)
  .sort(sort)
  .skip(skip)
  .limit(limit)
  .select('postId authorName authorRollNumber category title content tags attachments likeCount commentCount saveCount viewCount createdAt');

// For each post, check if current user has liked/saved it
const userId = req.user.id;

const postsWithUserData = await Promise.all(posts.map(async (post) => {
  const hasLiked = await Like.exists({ 
    postId: post._id, 
    userId: userId 
  });
  
  const hasSaved = await Save.exists({ 
    postId: post._id, 
    userId: userId 
  });
  
  return {
    ...post.toObject(),
    hasLiked: !!hasLiked,
    hasSaved: !!hasSaved
  };
}));

// Count total
const total = await Post.countDocuments(query);

return res.json({
  success: true,
  data: {
    posts: postsWithUserData,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      limit: limit
    }
  }
});
```

**Step 3: Frontend Displays Feed**
- Shows posts in card format
- Each card shows:
  - Author name and roll number
  - Category badge
  - Title and content preview
  - Attachment (if any)
  - Like, comment, save counts
  - Like button (filled if already liked)
  - Save button (filled if already saved)


---

### Workflow 3: Liking a Post

**Step 1: Student Clicks Like Button**
```javascript
POST /api/student-corner/posts/:postId/like
Authorization: Bearer <token>
```

**Step 2: Backend Toggles Like**
```javascript
const postId = req.params.postId;
const userId = req.user.id;

// Find post
const post = await Post.findOne({ postId: postId });

if (!post) {
  return res.status(404).json({ error: 'Post not found' });
}

// Check if already liked
const existingLike = await Like.findOne({
  postId: post._id,
  userId: userId
});

if (existingLike) {
  // Unlike
  await Like.deleteOne({ _id: existingLike._id });
  post.likeCount = Math.max(0, post.likeCount - 1);
  await post.save();
  
  return res.json({
    success: true,
    action: 'unliked',
    likeCount: post.likeCount
  });
  
} else {
  // Like
  await Like.create({
    postId: post._id,
    userId: userId,
    userName: req.user.fullName,
    userRollNumber: req.user.rollNumber,
    createdAt: new Date()
  });
  
  post.likeCount += 1;
  await post.save();
  
  // Notify post author (optional)
  if (post.authorId.toString() !== userId) {
    await Notification.create({
      recipientId: post.authorId,
      recipientRole: 'student',
      type: 'post_liked',
      title: 'Someone liked your post',
      message: `${req.user.fullName} liked your post: "${post.title}"`,
      relatedPostId: post.postId,
      actionUrl: `/student-corner/posts/${post.postId}`,
      isRead: false,
      createdAt: new Date()
    });
  }
  
  return res.json({
    success: true,
    action: 'liked',
    likeCount: post.likeCount
  });
}
```

**Step 3: Frontend Updates UI**
- Like button changes color (filled)
- Like count increases
- Smooth animation


---

### Workflow 4: Commenting on a Post

**Step 1: Student Opens Post Details**
```javascript
GET /api/student-corner/posts/:postId
Authorization: Bearer <token>
```

**Step 2: Backend Returns Post with Comments**
```javascript
const postId = req.params.postId;

// Find post
const post = await Post.findOne({ 
  postId: postId,
  isActive: true,
  isDeleted: false 
});

if (!post) {
  return res.status(404).json({ error: 'Post not found' });
}

// Increment view count
post.viewCount += 1;
await post.save();

// Fetch comments
const comments = await Comment.find({
  postId: post._id,
  isActive: true,
  isDeleted: false
})
.sort({ createdAt: 1 })  // Oldest first
.select('authorName authorRollNumber content createdAt isEdited');

// Check if current user has liked/saved
const userId = req.user.id;
const hasLiked = await Like.exists({ postId: post._id, userId: userId });
const hasSaved = await Save.exists({ postId: post._id, userId: userId });

return res.json({
  success: true,
  data: {
    post: {
      ...post.toObject(),
      hasLiked: !!hasLiked,
      hasSaved: !!hasSaved
    },
    comments: comments
  }
});
```

**Step 3: Student Writes Comment**
- Enters text in comment box
- Clicks "Post Comment"

**Step 4: Frontend Sends Comment**
```javascript
POST /api/student-corner/posts/:postId/comments
Authorization: Bearer <token>

Body: {
  content: "Thanks for sharing! Very helpful notes."
}
```

**Step 5: Backend Creates Comment**
```javascript
const postId = req.params.postId;
const userId = req.user.id;
const user = await User.findById(userId);

// Find post
const post = await Post.findOne({ postId: postId });

// Validate comment
const content = req.body.content.trim();

if (content.length < 5) {
  return res.status(400).json({ error: 'Comment too short (min 5 characters)' });
}

if (content.length > 500) {
  return res.status(400).json({ error: 'Comment too long (max 500 characters)' });
}

// Check for inappropriate content
const validation = validateComment(content);
if (!validation.valid) {
  return res.status(400).json({ error: validation.error });
}

// Create comment
const comment = await Comment.create({
  postId: post._id,
  authorId: user._id,
  authorName: user.fullName,
  authorRollNumber: user.rollNumber,
  authorDepartment: user.department,
  content: content,
  isApproved: true,
  isHidden: false,
  reportCount: 0,
  isActive: true,
  isDeleted: false,
  createdAt: new Date()
});

// Update post comment count
post.commentCount += 1;
await post.save();

// Notify post author
if (post.authorId.toString() !== userId) {
  await Notification.create({
    recipientId: post.authorId,
    recipientRole: 'student',
    type: 'post_commented',
    title: 'New comment on your post',
    message: `${user.fullName} commented on your post: "${post.title}"`,
    relatedPostId: post.postId,
    actionUrl: `/student-corner/posts/${post.postId}`,
    isRead: false,
    createdAt: new Date()
  });
}

return res.json({
  success: true,
  message: 'Comment posted successfully',
  data: {
    comment: {
      authorName: comment.authorName,
      authorRollNumber: comment.authorRollNumber,
      content: comment.content,
      createdAt: comment.createdAt
    }
  }
});
```

**Step 6: Frontend Updates UI**
- New comment appears at bottom
- Comment count increases
- Shows success message


---

### Workflow 5: Reporting Inappropriate Content

**Step 1: Student Clicks "Report" Button**
- Modal opens with report form

**Step 2: Student Selects Reason and Submits**
```javascript
POST /api/student-corner/posts/:postId/report
Authorization: Bearer <token>

Body: {
  reason: "Inappropriate content",
  additionalDetails: "This post contains offensive language and is not academic."
}
```

**Step 3: Backend Creates Report**
```javascript
const postId = req.params.postId;
const userId = req.user.id;
const user = await User.findById(userId);

// Find post
const post = await Post.findOne({ postId: postId });

// Check if user already reported this post
const existingReport = await Report.findOne({
  reportedItemId: post._id,
  reportedBy: userId
});

if (existingReport) {
  return res.status(400).json({ 
    error: 'You have already reported this post' 
  });
}

// Create report
const report = await Report.create({
  reportType: 'post',
  reportedItemId: post._id,
  reportedBy: userId,
  reportedByName: user.fullName,
  reportedByRollNumber: user.rollNumber,
  reason: req.body.reason,
  additionalDetails: req.body.additionalDetails,
  status: 'pending',
  reportedAt: new Date()
});

// Increment report count on post
post.reportCount += 1;

// Auto-hide if 5+ reports
if (post.reportCount >= 5) {
  post.isHidden = true;
}

await post.save();

// Notify admin
const admins = await AdminUser.find({ role: { $in: ['super_admin', 'admin'] } });

for (const admin of admins) {
  await Notification.create({
    recipientId: admin._id,
    recipientRole: admin.role,
    type: 'content_reported',
    title: 'Content Reported',
    message: `A post has been reported: "${post.title}"`,
    relatedPostId: post.postId,
    actionUrl: `/admin/student-corner/reports/${report._id}`,
    priority: post.reportCount >= 5 ? 'high' : 'normal',
    isRead: false,
    createdAt: new Date()
  });
}

return res.json({
  success: true,
  message: 'Thank you for reporting. We will review this post.'
});
```

**Step 4: Frontend Shows Confirmation**
- Shows success message
- Hides report button (already reported)


---

## SECURITY & CONTROL

### 1. Only Verified Students Can Post

**Verification Check:**
```javascript
// Middleware to check if user is verified student
async function requireVerifiedStudent(req, res, next) {
  const userId = req.user.id;
  
  // Check if user exists and is verified
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (!user.isVerified) {
    return res.status(403).json({ 
      error: 'Only verified students can post in Student Corner' 
    });
  }
  
  if (!user.isActive) {
    return res.status(403).json({ 
      error: 'Your account is inactive. Contact administration.' 
    });
  }
  
  // Check if user is suspended from Student Corner
  const suspension = await Suspension.findOne({
    userId: userId,
    expiresAt: { $gt: new Date() }
  });
  
  if (suspension) {
    return res.status(403).json({ 
      error: `You are suspended from Student Corner until ${suspension.expiresAt.toLocaleDateString()}. Reason: ${suspension.reason}` 
    });
  }
  
  next();
}

// Apply to all Student Corner routes
app.post('/api/student-corner/posts', 
  authenticateToken,
  requireVerifiedStudent,
  createPost
);
```

