# Design System - Cozy Festive Theme

A cozy, warm design system perfect for Christmas and New Year parties! 🎄🎉

## Colors

### Festive Primary Colors

- `festive-red`: `#c41e3a` - Classic holiday red
- `festive-green`: `#2d5016` - Deep evergreen
- `festive-gold`: `#d4af37` - Warm gold accents
- `festive-navy`: `#1a2332` - Deep navy blue
- `festive-burgundy`: `#722f37` - Rich burgundy

### Warm Cozy Colors

- `warm-cream`: `#fef7f0` - Soft cream background
- `warm-beige`: `#f5e6d3` - Warm beige
- `warm-brown`: `#8b6f47` - Earthy brown
- `warm-burgundy`: `#722f37` - Rich burgundy

### Accent Colors

- `accent-gold-light`: `#f4d03f` - Bright gold
- `accent-red-light`: `#e74c3c` - Bright red
- `accent-green-light`: `#52b788` - Fresh green

### Neutral Colors

Available from `neutral-50` (lightest) to `neutral-900` (darkest)

## Usage in Tailwind

```tsx
// Background colors
className = "bg-festive-red";
className = "bg-festive-gold";
className = "bg-warm-cream";

// Text colors
className = "text-festive-red";
className = "text-festive-gold";

// Border colors
className = "border-festive-gold";

// Card colors
className = "bg-card-bg border-card-border";
```

## Utility Classes

### Buttons

```tsx
// Primary button (red with gold hover)
<button className="btn-primary">Click me</button>

// Secondary button (neutral colors)
<button className="btn-secondary">Click me</button>
```

### Cards

```tsx
<div className="card">Card content</div>
```

### Inputs

```tsx
<input className="input" placeholder="Enter text..." />
```

## CSS Variables

All colors are available as CSS variables:

```css
var(--festive-red)
var(--festive-gold)
var(--warm-cream)
var(--card-bg)
var(--card-border)
/* etc. */
```

## Dark Mode

The design system automatically adapts to dark mode using `prefers-color-scheme`. Colors are adjusted for optimal contrast and readability in dark mode.

## Examples

### Festive Card

```tsx
<div className="card bg-gradient-to-br from-warm-cream to-warm-beige border-festive-gold/20">
  Content
</div>
```

### Team Card

```tsx
<div className="rounded-lg border-2 border-card-border bg-gradient-to-br from-neutral-50 to-neutral-100 p-5 hover:border-festive-gold transition-all">
  Team content
</div>
```

### Gradient Text

```tsx
<h1 className="bg-gradient-to-r from-festive-red via-festive-gold to-festive-green bg-clip-text text-transparent">
  Festive Title
</h1>
```
