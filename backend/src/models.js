import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model, models } = mongoose;
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;

const activeStatus = { type: String, enum: ["active", "inactive"], default: "active" };
const userStatus = { type: String, enum: ["active", "blocked", "pending", "inactive", "suspended"], default: "active", index: true };
const publishStatus = { type: String, enum: ["draft", "published"], default: "draft" };
const seo = { seoTitle: String, seoDescription: String, seoKeywords: [String] };
const socialLinks = new Schema(
  { facebook: String, instagram: String, youtube: String, linkedin: String, website: String },
  { _id: false }
);

const heroBannerSchema = new Schema(
  {
    title: String,
    subtitle: String,
    buttonText: String,
    buttonLink: String,
    desktopImage: { type: String, required: true },
    tabletImage: String,
    mobileImage: String,
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

const permissions = {
  canCreateCourse: { type: Boolean, default: false },
  canEditCourse: { type: Boolean, default: false },
  canDeleteCourse: { type: Boolean, default: false },
  canCreateLesson: { type: Boolean, default: true },
  canEditLesson: { type: Boolean, default: true },
  canCreateBlog: { type: Boolean, default: false },
  canCreateVideoBlog: { type: Boolean, default: false },
  canViewStudents: { type: Boolean, default: true },
  canViewAnalytics: { type: Boolean, default: false },
  canReplyToComments: { type: Boolean, default: false },
  canReplyToChats: { type: Boolean, default: false },
  canUploadResources: { type: Boolean, default: false },
  canViewStudentProgress: { type: Boolean, default: false },
  canSendReminders: { type: Boolean, default: false },
  canMarkDoubtsResolved: { type: Boolean, default: false },
  canEscalateToAdmin: { type: Boolean, default: false }
};

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: String,
    mobile: String,
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["main_admin", "teacher", "student", "devotee", "user"], default: "student", index: true },
    profileImage: String,
    bio: String,
    expertise: [String],
    specialization: [String],
    teacherType: { type: String, enum: ["primary", "support", "guest", "mentor"], default: "primary" },
    status: userStatus,
    emailVerified: { type: Boolean, default: true, index: true },
    otpVerifiedAt: Date,
    mustChangePassword: { type: Boolean, default: false },
    lastActiveAt: Date,
    isOnline: { type: Boolean, default: false },
    lastSeen: Date,
    adminNotes: String,
    blockedAt: Date,
    blockedReason: String,
    assignedCourses: [{ type: ObjectId, ref: "Course" }],
    createdByAdminId: { type: ObjectId, ref: "User" },
    permissions
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    thumbnail: String,
    bannerImage: String,
    shortDescription: String,
    description: String,
    category: String,
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    teacher: { type: ObjectId, ref: "User" },
    primaryTeacherId: { type: ObjectId, ref: "User" },
    supportTeacherIds: [{ type: ObjectId, ref: "User" }],
    assignedTeacherIds: [{ type: ObjectId, ref: "User" }],
    completionMode: { type: String, enum: ["manual", "auto", "quiz", "assignment"], default: "manual" },
    requiredWatchPercentage: { type: Number, default: 80 },
    certificateEnabled: { type: Boolean, default: true },
    teacherPermissions: { type: Mixed, default: {} },
    duration: String,
    priceType: { type: String, enum: ["Free", "Paid"], default: "Free" },
    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
    featured: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: false },
    status: publishStatus,
    whatYouWillLearn: [String],
    faq: [{ question: String, answer: String }],
    resources: [{ title: String, url: String }],
    createdBy: { type: ObjectId, ref: "User" },
    enrollmentType: { type: [String], default: ["free"] },
    verificationInstructions: String,
    requiredDocumentName: String,
    allowedFileTypes: [String],
    maxFileSize: Number,
    ...seo
  },
  { timestamps: true }
);

const lessonSchema = new Schema(
  {
    course: { type: ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: String,
    videoType: { type: String, enum: ["youtube", "upload"], default: "youtube" },
    youtubeUrl: String,
    videoUrl: String,
    uploadedVideo: String,
    thumbnail: String,
    pdfFile: String,
    attachmentFile: String,
    resources: [{ title: String, url: String, type: String }],
    duration: String,
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    isPreview: { type: Boolean, default: false },
    status: activeStatus,
    publishStatus: { type: String, enum: ["draft", "published"], default: "published", index: true },
    commentsEnabled: { type: Boolean, default: true },
    notesEnabled: { type: Boolean, default: true },
    chatEnabled: { type: Boolean, default: true },
    completionThreshold: { type: Number, default: 80 },
    createdBy: { type: ObjectId, ref: "User" }
  },
  { timestamps: true }
);
lessonSchema.index({ course: 1, slug: 1 }, { unique: true });

const enrollmentSchema = new Schema(
  {
    student: { type: ObjectId, ref: "User", required: true },
    course: { type: ObjectId, ref: "Course", required: true },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
    completedAt: Date
  },
  { timestamps: true }
);
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const progressSchema = new Schema(
  {
    student: { type: ObjectId, ref: "User", required: true },
    course: { type: ObjectId, ref: "Course", required: true },
    lesson: { type: ObjectId, ref: "Lesson", required: true },
    isCompleted: { type: Boolean, default: false },
    status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started", index: true },
    lastPosition: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    watchPercent: { type: Number, default: 0 },
    watchSeconds: { type: Number, default: 0 },
    watchedIntervals: { type: [{ start: Number, end: Number, _id: false }], default: [] },
    completedAt: Date,
    quizPassed: { type: Boolean, default: false },
    assignmentSubmitted: { type: Boolean, default: false },
    lastWatchedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
progressSchema.index({ student: 1, course: 1, lesson: 1 }, { unique: true });

const otpCodeSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User" },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    purpose: { type: String, enum: ["register", "forgot_password"], required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    verifiedAt: Date,
    consumedAt: Date
  },
  { timestamps: true }
);
otpCodeSchema.index({ email: 1, purpose: 1, createdAt: -1 });

const passwordResetRequestSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User" },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    message: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    adminNote: String,
    resolvedBy: { type: ObjectId, ref: "User" },
    resolvedAt: Date,
    tempPasswordSetAt: Date
  },
  { timestamps: true }
);

const noteSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User", required: true, index: true },
    course: { type: ObjectId, ref: "Course", required: true, index: true },
    lesson: { type: ObjectId, ref: "Lesson", required: true, index: true },
    title: String,
    content: { type: String, required: true },
    timestamp: { type: Number, default: 0 }
  },
  { timestamps: true }
);
noteSchema.index({ user: 1, lesson: 1, createdAt: -1 });

const commentSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User", required: true, index: true },
    course: { type: ObjectId, ref: "Course", required: true, index: true },
    lesson: { type: ObjectId, ref: "Lesson", required: true, index: true },
    parentComment: { type: ObjectId, ref: "Comment", default: null, index: true },
    text: { type: String, required: true },
    fileUrl: String,
    fileName: String,
    adminReply: String,
    adminReplyUser: { type: ObjectId, ref: "User" },
    adminReplyAt: Date,
    status: { type: String, enum: ["pending", "replied", "resolved", "escalated"], default: "pending", index: true },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium", index: true },
    isPinned: { type: Boolean, default: false, index: true },
    adminNote: String,
    assignedToType: { type: String, enum: ["admin", "teacher"], default: "admin", index: true },
    assignedTeacherId: { type: ObjectId, ref: "User", index: true },
    repliedById: { type: ObjectId, ref: "User" },
    repliedByRole: { type: String, enum: ["admin", "teacher"] }
  },
  { timestamps: true }
);
commentSchema.index({ lesson: 1, status: 1, createdAt: -1 });

const chatRoomSchema = new Schema(
  {
    course: { type: ObjectId, ref: "Course", required: true, index: true },
    participants: [{ type: ObjectId, ref: "User", index: true }],
    lastMessage: String,
    lastMessageAt: { type: Date, default: Date.now },
    unreadCounts: { type: Map, of: Number, default: {} },
    assignedToType: { type: String, enum: ["admin", "teacher", "bot"], default: "bot", index: true },
    assignedTeacherId: { type: ObjectId, ref: "User", index: true },
    lastReplyBy: { type: String, enum: ["student", "teacher", "admin", "system", "bot"], default: "system" },
    status: { type: String, enum: ["open", "pending", "resolved", "escalated"], default: "open", index: true },
    botSummary: String,
    adminReviewed: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);
chatRoomSchema.index({ course: 1, lastMessageAt: -1 });

const chatMessageSchema = new Schema(
  {
    room: { type: ObjectId, ref: "ChatRoom", required: true, index: true },
    course: { type: ObjectId, ref: "Course", required: true, index: true },
    sender: { type: ObjectId, ref: "User", required: true, index: true },
    receiver: { type: ObjectId, ref: "User", index: true },
    text: String,
    fileUrl: String,
    fileType: String,
    fileName: String,
    messageType: { type: String, enum: ["text", "file", "system", "bot"], default: "text" },
    senderRole: { type: String, enum: ["student", "teacher", "admin", "system", "bot"], default: "student" },
    isBotMessage: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent", index: true },
    readAt: Date,
    deliveredAt: Date
  },
  { timestamps: true }
);
chatMessageSchema.index({ room: 1, createdAt: -1 });

const notificationSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User", index: true },
    audience: { type: String, enum: ["user", "admin", "all"], default: "user", index: true },
    type: { type: String, default: "info", index: true },
    title: { type: String, required: true },
    message: String,
    link: String,
    read: { type: Boolean, default: false, index: true },
    readAt: Date,
    metadata: Mixed
  },
  { timestamps: true }
);

const fileUploadSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User" },
    url: { type: String, required: true },
    filename: String,
    folder: String,
    mimeType: String,
    size: Number
  },
  { timestamps: true }
);

const upcomingClassSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: String,
    date: Date,
    time: String,
    venue: String,
    speaker: String,
    shortDescription: String,
    fullDescription: String,
    status: activeStatus,
    buttonText: { type: String, default: "View Details" },
    buttonLink: String,
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const pageSectionSchema = new Schema(
  {
    pageName: { type: String, required: true, lowercase: true, trim: true },
    sectionKey: { type: String, required: true, lowercase: true, trim: true },
    sectionTitle: String,
    sectionSubtitle: String,
    content: Mixed,
    image: String,
    images: [String],
    videoUrl: String,
    buttonText: String,
    buttonLink: String,
    sortOrder: { type: Number, default: 0 },
    status: activeStatus,
    settings: Mixed
  },
  { timestamps: true }
);
pageSectionSchema.index({ pageName: 1, sectionKey: 1 }, { unique: true });

const aboutPageSectionSchema = new Schema(
  {
    pageName: { type: String, default: "about" },
    sectionTitle: String,
    sectionSubtitle: String,
    description: String,
    image: String,
    images: [String],
    buttonText: String,
    buttonLink: String,
    sortOrder: { type: Number, default: 0 },
    status: activeStatus
  },
  { timestamps: true }
);

const preacherSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: String,
    designation: String,
    type: { type: String, enum: ["Founder", "Team Member"], default: "Team Member", index: true },
    shortBio: String,
    fullBio: String,
    experience: String,
    specialization: [String],
    email: String,
    phone: String,
    socialLinks,
    status: activeStatus,
    showOnHomepage: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    user: { type: ObjectId, ref: "User" },
    ...seo
  },
  { timestamps: true }
);

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: String,
    shortDescription: String,
    content: String,
    listItems: [String],
    author: { type: ObjectId, ref: "User" },
    category: String,
    tags: [String],
    status: publishStatus,
    featured: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: false },
    ...seo
  },
  { timestamps: true }
);

const videoBlogSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    thumbnail: String,
    videoUrl: String,
    shortDescription: String,
    description: String,
    category: String,
    tags: [String],
    status: publishStatus,
    showOnHomepage: { type: Boolean, default: false },
    ...seo
  },
  { timestamps: true }
);

const imageGallerySchema = new Schema(
  {
    title: { type: String, required: true },
    image: String,
    category: String,
    description: String,
    status: activeStatus,
    showInMediaHighlight: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const videoGallerySchema = new Schema(
  {
    title: { type: String, required: true },
    thumbnail: String,
    videoUrl: String,
    description: String,
    category: String,
    status: activeStatus,
    showInMediaHighlight: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subscribedDate: { type: Date, default: Date.now },
    status: activeStatus
  },
  { timestamps: true }
);

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: String,
    classTitle: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, enum: ["read", "unread"], default: "unread" }
  },
  { timestamps: true }
);

const footerSettingSchema = new Schema(
  {
    singletonKey: { type: String, default: "footer", unique: true },
    logo: String,
    description: String,
    columns: [{ title: String, links: [{ label: String, url: String }] }],
    contactDetails: { address: String, phone: String, email: String },
    socialLinks,
    copyrightText: String,
    copyrightYear: Number,
    newsletterEnabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const siteSettingSchema = new Schema(
  {
    singletonKey: { type: String, default: "site", unique: true },
    logo: String,
    favicon: String,
    siteName: { type: String, default: "ISKCON Juhu IPP" },
    primaryColor: { type: String, default: "#f52246" },
    headerLinks: [{ label: String, url: String, sortOrder: Number, status: activeStatus }],
    loginButtonText: { type: String, default: "Login" },
    registerButtonText: { type: String, default: "Register" },
    socialLinks,
    defaultSeoTitle: String,
    defaultSeoDescription: String,
    customHeaderHtml: String,
    googleSearchConsoleTag: String,
    aboutStats: {
      courses: { type: String, default: "6+" },
      teachers: { type: String, default: "6+" },
      lessons: { type: String, default: "12+" },
      sundayClasses: { type: String, default: "Every Week" }
    }
  },
  { timestamps: true }
);

const legalPageSchema = new Schema(
  { slug: { type: String, required: true, unique: true }, title: { type: String, required: true }, content: String, status: activeStatus, ...seo },
  { timestamps: true }
);

const trafficLogSchema = new Schema(
  { pageUrl: String, ip: String, browser: String, deviceType: String, referrer: String, user: { type: ObjectId, ref: "User" } },
  { timestamps: true }
);

const benefitSchema = new Schema(
  {
    title: { type: String, required: true },
    image: String,
    shortDescription: String,
    fullDescription: String,
    buttonText: String,
    buttonLink: String,
    status: activeStatus,
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const testimonialSchema = new Schema(
  { name: String, designation: String, image: String, quote: String, rating: { type: Number, default: 5 }, status: activeStatus, sortOrder: Number },
  { timestamps: true }
);

const pageSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    pageName: String,
    bannerImage: String,
    excerpt: String,
    content: String,
    status: activeStatus,
    sortOrder: { type: Number, default: 0 },
    ...seo
  },
  { timestamps: true }
);

const courseEnrollmentRequestSchema = new Schema(
  {
    student: { type: ObjectId, ref: "User", required: true, index: true },
    course: { type: ObjectId, ref: "Course", required: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: String,
    documentUrl: String,
    documentType: String,
    paymentPhotoUrl: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    rejectionReason: String,
    reviewedBy: { type: ObjectId, ref: "User" },
    reviewedAt: Date,
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const userActivitySchema = new Schema(
  {
    user: { type: ObjectId, ref: "User", required: true, index: true },
    course: { type: ObjectId, ref: "Course", required: true, index: true },
    lesson: { type: ObjectId, ref: "Lesson", required: true },
    currentVideoTime: { type: Number, default: 0 },
    totalWatchTime: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now, index: true },
    isOnline: { type: Boolean, default: false },
    lastSeen: Date,
    progressPercentage: { type: Number, default: 0 },
    completedLessons: [{ type: ObjectId, ref: "Lesson" }]
  },
  { timestamps: true }
);
userActivitySchema.index({ user: 1, course: 1, lastActiveAt: -1 });

const studentAnalyticsSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User", required: true, index: true },
    course: { type: ObjectId, ref: "Course", required: true, index: true },
    dailyWatchTimes: [{ date: String, minutes: Number }],
    weeklyWatchTime: { type: Number, default: 0 },
    monthlyWatchTime: { type: Number, default: 0 },
    quizScores: [Number],
    assignmentScores: [Number],
    improvementScore: { type: Number, default: 50 },
    engagementScore: { type: Number, default: 50 },
    inactiveDays: { type: Number, default: 0 }
  },
  { timestamps: true }
);
studentAnalyticsSchema.index({ user: 1, course: 1 });

const teacherAnalyticsSchema = new Schema(
  {
    teacher: { type: ObjectId, ref: "User", required: true, index: true },
    course: { type: ObjectId, ref: "Course", required: true, index: true },
    totalChatsHandled: { type: Number, default: 0 },
    totalCommentsReplied: { type: Number, default: 0 },
    averageReplyTime: { type: Number, default: 0 },
    pendingChats: { type: Number, default: 0 },
    pendingComments: { type: Number, default: 0 },
    resolvedCount: { type: Number, default: 0 },
    studentRating: { type: Number, default: 5 },
    escalatedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);
teacherAnalyticsSchema.index({ teacher: 1, course: 1 });

const teacherAssignmentHistorySchema = new Schema(
  {
    course: { type: ObjectId, ref: "Course", required: true },
    oldTeacherIds: [{ type: ObjectId, ref: "User" }],
    newTeacherIds: [{ type: ObjectId, ref: "User" }],
    changedByAdmin: { type: ObjectId, ref: "User" },
    reason: String,
    changedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const teacherPerformanceSchema = new Schema(
  {
    teacher: { type: ObjectId, ref: "User", required: true, index: true },
    course: { type: ObjectId, ref: "Course", required: true, index: true },
    totalChatsHandled: { type: Number, default: 0 },
    totalCommentsReplied: { type: Number, default: 0 },
    totalDoubtsResolved: { type: Number, default: 0 },
    pendingDoubts: { type: Number, default: 0 },
    averageReplyTime: { type: Number, default: 0 },
    studentRatingAverage: { type: Number, default: 5 },
    helpfulReplyPercentage: { type: Number, default: 100 },
    escalatedCount: { type: Number, default: 0 },
    missedReplyCount: { type: Number, default: 0 },
    performanceScore: { type: Number, default: 100 }
  },
  { timestamps: true }
);

const courseProgressSchema = new Schema(
  {
    student: { type: ObjectId, ref: "User", required: true, index: true },
    course: { type: ObjectId, ref: "Course", required: true, index: true },
    totalLessons: { type: Number, default: 0 },
    completedLessons: { type: Number, default: 0 },
    progressPercentage: { type: Number, default: 0 },
    totalWatchTime: { type: Number, default: 0 },
    currentLesson: { type: ObjectId, ref: "Lesson" },
    status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started", index: true },
    completedAt: Date,
    certificateStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none", index: true },
    certificateApprovedAt: Date,
    certificateUrl: String
  },
  { timestamps: true }
);
courseProgressSchema.index({ student: 1, course: 1 }, { unique: true });

const teacherRatingSchema = new Schema(
  {
    student: { type: ObjectId, ref: "User", required: true, index: true },
    teacher: { type: ObjectId, ref: "User", required: true, index: true },
    course: { type: ObjectId, ref: "Course", required: true, index: true },
    conversation: { type: ObjectId, ref: "ChatRoom" },
    comment: { type: ObjectId, ref: "Comment" },
    rating: { type: Number, required: true },
    helpful: { type: Boolean, required: true },
    feedbackText: String,
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const make = (name, schema) => models[name] || model(name, schema);

export const User = make("User", userSchema);
export const HeroBanner = make("HeroBanner", heroBannerSchema);
export const Course = make("Course", courseSchema);
export const CourseEnrollmentRequest = make("CourseEnrollmentRequest", courseEnrollmentRequestSchema);
export const Lesson = make("Lesson", lessonSchema);
export const Enrollment = make("Enrollment", enrollmentSchema);
export const Progress = make("Progress", progressSchema);
export const OtpCode = make("OtpCode", otpCodeSchema);
export const PasswordResetRequest = make("PasswordResetRequest", passwordResetRequestSchema);
export const Note = make("Note", noteSchema);
export const Comment = make("Comment", commentSchema);
export const ChatRoom = make("ChatRoom", chatRoomSchema);
export const ChatMessage = make("ChatMessage", chatMessageSchema);
export const Notification = make("Notification", notificationSchema);
export const FileUpload = make("FileUpload", fileUploadSchema);
export const UpcomingClass = make("UpcomingClass", upcomingClassSchema);
export const PageSection = make("PageSection", pageSectionSchema);
export const AboutPageSection = make("AboutPageSection", aboutPageSectionSchema);
export const Preacher = make("Preacher", preacherSchema);
export const Blog = make("Blog", blogSchema);
export const VideoBlog = make("VideoBlog", videoBlogSchema);
export const ImageGallery = make("ImageGallery", imageGallerySchema);
export const VideoGallery = make("VideoGallery", videoGallerySchema);
export const Subscriber = make("Subscriber", subscriberSchema);
export const ContactMessage = make("ContactMessage", contactMessageSchema);
export const FooterSetting = make("FooterSetting", footerSettingSchema);
export const SiteSetting = make("SiteSetting", siteSettingSchema);
export const LegalPage = make("LegalPage", legalPageSchema);
export const TrafficLog = make("TrafficLog", trafficLogSchema);
export const Benefit = make("Benefit", benefitSchema);
export const Testimonial = make("Testimonial", testimonialSchema);
export const Page = make("Page", pageSchema);
export const UserActivity = make("UserActivity", userActivitySchema);
export const StudentAnalytics = make("StudentAnalytics", studentAnalyticsSchema);
export const TeacherAnalytics = make("TeacherAnalytics", teacherAnalyticsSchema);
export const TeacherAssignmentHistory = make("TeacherAssignmentHistory", teacherAssignmentHistorySchema);
export const TeacherPerformance = make("TeacherPerformance", teacherPerformanceSchema);
export const CourseProgress = make("CourseProgress", courseProgressSchema);
export const TeacherRating = make("TeacherRating", teacherRatingSchema);

export const modelRegistry = {
  users: User,
  banners: HeroBanner,
  courses: Course,
  lessons: Lesson,
  enrollments: Enrollment,
  progress: Progress,
  notes: Note,
  comments: Comment,
  "chat-rooms": ChatRoom,
  "chat-messages": ChatMessage,
  notifications: Notification,
  "password-reset-requests": PasswordResetRequest,
  "file-uploads": FileUpload,
  "upcoming-classes": UpcomingClass,
  "home-sections": PageSection,
  "page-sections": PageSection,
  "about-sections": AboutPageSection,
  "course-requests": CourseEnrollmentRequest,
  pages: Page,
  preachers: Preacher,
  blogs: Blog,
  "video-blogs": VideoBlog,
  "gallery-images": ImageGallery,
  "gallery-videos": VideoGallery,
  subscribers: Subscriber,
  "contact-messages": ContactMessage,
  "legal-pages": LegalPage,
  benefits: Benefit,
  testimonials: Testimonial,
  "user-activities": UserActivity,
  "student-analytics": StudentAnalytics,
  "teacher-analytics": TeacherAnalytics,
  "teacher-assignment-histories": TeacherAssignmentHistory,
  "teacher-performances": TeacherPerformance,
  "course-progress": CourseProgress,
  "teacher-ratings": TeacherRating
};
