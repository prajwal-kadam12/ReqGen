# ReqGen Design Guidelines

## Design Approach
**System-Based Design**: Material Design principles adapted for enterprise productivity, emphasizing clarity, efficient workflows, and professional aesthetics. Reference: Linear's clean data-heavy interfaces + Notion's document-centric layouts.

## Core Design Principles
1. **Information Hierarchy**: Documents and data take center stage
2. **Workflow Efficiency**: Minimize clicks, maximize clarity
3. **Professional Polish**: Enterprise-grade aesthetic without sterility
4. **Responsive Intelligence**: Graceful adaptation across devices

---

## Typography System

**Font Families**:
- Primary: Inter (headings, UI elements, buttons)
- Secondary: system-ui (body text, form inputs)

**Scale**:
- Page Titles: text-3xl font-bold
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Labels/Meta: text-sm font-medium
- Helper Text: text-xs

---

## Layout & Spacing

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-6
- Card spacing: space-y-4
- Section gaps: gap-8
- Page padding: p-8 (desktop), p-4 (mobile)

**Container Strategy**:
- Sidebar: Fixed width 256px (desktop), collapsible drawer (mobile)
- Main content: max-w-7xl mx-auto
- Cards: Full width within containers
- Modals: max-w-2xl for forms, max-w-4xl for previews

**Grid Patterns**:
- Dashboard document list: Single column table layout
- Generated Files: 2-column grid on tablet+, single on mobile

---

## Component Library

### Navigation
**Sidebar**:
- Logo + "ReqGen" text at top (p-6)
- Navigation items with icons (left) + labels (right)
- Active state: subtle background fill
- Grouped sections with dividers

**Top Navbar**:
- Right-aligned: Notifications bell + Profile dropdown
- Height: h-16, border-bottom separator
- Sticky positioning

### Cards & Containers
**Document Cards**:
- Rounded corners (rounded-lg)
- Soft shadow (shadow-md on hover)
- White background with border
- Padding: p-6
- Status badges: inline with rounded-full styling

**Preview Panel**:
- Two-column split on Note Editor (50/50)
- Border separator between panels
- Scrollable content areas
- Sticky headers

### Forms & Inputs
**Input Fields**:
- Height: h-12
- Border: 1px solid with focus ring
- Rounded: rounded-md
- Consistent padding: px-4

**Buttons**:
- Primary: Solid fill, rounded-md, px-6 py-3
- Secondary: Outlined style
- Icon buttons: Square aspect ratio (h-10 w-10)
- Disabled state: reduced opacity

### Data Display
**Document Table**:
- Row height: h-16
- Zebra striping for readability
- Hover state on rows
- Action buttons right-aligned
- Responsive: Stack to cards on mobile

**Status Indicators**:
- Badges with rounded-full
- Icon + text combinations
- Distinct visual states (Draft/Processing/Complete)

### Modals & Overlays
**Email Modal**:
- Overlay backdrop with blur
- Center-positioned, rounded-xl
- Form layout with clear sections
- Footer with Cancel + Send actions

**Preview Modal**:
- Full-screen on mobile
- Max-width container on desktop
- Close button top-right
- Letterhead display at document top

---

## Page-Specific Layouts

### Login Page
- Centered card (max-w-md)
- Logo above form
- Role selector as button group
- "Remember me" checkbox
- Minimal, focused design

### Dashboard
- Two-section layout: CTA card + document list
- "Create New Document" prominent card at top
- Document list as table with sortable columns
- Quick actions (Download, Email) as icon buttons

### Note Editor
- Split-screen: Original (left) | Refined (right)
- Fixed action bar between panels
- "Refine with AI" button centered
- Format selector dropdown before generation

### Generated Files
- Search bar at top (w-full max-w-md)
- Filter chips below search
- Grid of document previews
- Hover reveals full action menu

### Settings (Admin)
- Left sidebar: Setting categories
- Main panel: Active setting forms
- Logo upload: Drag-and-drop zone
- API key input: Masked with reveal toggle

---

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px (single column, drawer sidebar)
- Tablet: 768px - 1024px (condensed layouts)
- Desktop: 1024px+ (full layouts)

**Mobile Adaptations**:
- Hamburger menu for sidebar
- Stacked forms and panels
- Bottom navigation for primary actions
- Full-screen modals

---

## Micro-Interactions (Minimal)
- Subtle fade-in on page load
- Smooth transitions on hover states (duration-200)
- Loading spinner during AI refinement
- Success checkmark on document save
- **No scroll animations or parallax effects**

---

## Icons
**Library**: Lucide React
**Usage**:
- Navigation: 20px (w-5 h-5)
- Buttons: 16px (w-4 h-4)
- Status indicators: 16px
- Consistent stroke width

---

## Images
**No hero images** - This is a productivity tool focused on document workflows.

**Image Usage**:
- Company logo (Settings page): Max 200px width
- Document thumbnails (Generated Files): 16:9 ratio preview
- Empty states: Simple illustrations for no documents

---

## Accessibility
- Focus states visible on all interactive elements
- Sufficient contrast ratios (WCAG AA)
- Keyboard navigation throughout
- Screen reader labels on icon-only buttons
- Error messages with clear instructions

---

## Professional Polish
- Consistent border-radius throughout
- Subtle shadows for elevation hierarchy
- Professional iconography
- Clean whitespace, never cramped
- Refined empty states with helpful CTAs