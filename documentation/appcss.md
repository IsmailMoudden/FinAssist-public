# User Interface Styling (CSS)

## File: `static/src/css/app.css`

### Purpose
Define the FinAssist user experience with Tailwind CSS (via CDN) plus handcrafted rules that deliver a modern, dark-theme workspace optimized for document navigation, PDF review, and chat.

### Structure
- **Primary layout**: three-column split covering the document list, PDF viewer, and assistant panel.
- **Card and depth effects**: `.card-3d` introduces elevation, hover scaling, and subtle motion.
- **Chat styling**: custom bubbles, avatar placeholders, and the `.message-appear` animation for streaming responses.
- **Badges and drag-and-drop**: visual feedback for document context chips and drop zones.
- **PDF viewer**: `.textLayer` adjustments for precise text selection, responsive scaling, and scroll behavior.
- **Dark theme**: consistent palette, shadows, and typography tuned for low-light readability.

### Technical Notes
- Tailwind is loaded through the CDN for rapid prototyping, which means no tree-shaking or purging in the current build.
- Custom rules hide scrollbars, polish transitions, and enhance responsive behavior beyond Tailwind defaults.
- Components (sidebar, viewer, chat) have isolated class prefixes to ease maintenance.
- State-specific classes (selected, hover, dragging) ensure predictable interactions across touch and desktop.

### Current Limitations
- CSS is not minified, and unused Tailwind utilities remain because CDN mode is used.
- No theme tokens or CSS custom properties for runtime theming.
- Animations rely on basic transitions and could benefit from a motion system.

### Potential Improvements
- Move to a Tailwind CLI/PostCSS build with purge enabled for production deployments.
- Introduce dedicated loading and AI-feedback animations tied to application state.
- Expand accessibility coverage (focus states, contrast ratios, ARIA attributes).
- Modularize the CSS to align with component boundaries, easing future framework migrations.
