# Grail Tracker Data Structure

## Overview
This document describes the data structure used in `grail-data.js` for tracking Diablo 2 items in the Holy Grail tracker.

## Data Format
Each item in the `RAW_DATA` array follows this structure:

```javascript
{
  t: "type",        // Item type: "u" (unique), "s" (set), "w" (runeword), "r" (rune)
  tab: "tab_name",  // Which tab: "weapons", "armor", "jewelry", "sets", "runewords", "runes"
  c: "category",    // Category or set name
  tier: "tier",     // Tier: "Normal", "Exceptional", "Elite" (only for uniques)
  n: "name",        // Item name
  b: "base"         // Base item type or rune formula
}
```

## Categories Overview

### Unique Weapons (`t:"u"`, `tab:"weapons"`)
- **1H Axes** - One-handed axes (Normal, Exceptional, Elite)
- **2H Axes** - Two-handed axes (Normal, Exceptional, Elite)
- **1H Swords** - One-handed swords (Normal, Exceptional, Elite)
- **2H Swords** - Two-handed swords (Normal, Exceptional, Elite)
- **1H Maces** - One-handed maces (Normal, Exceptional, Elite)
- **2H Maces** - Two-handed maces (Normal, Exceptional, Elite)
- **Daggers** - Daggers and knives (Normal, Exceptional, Elite)
- **Spears** - Spears (Normal, Exceptional, Elite)
- **Polearms** - Polearms (Normal, Exceptional, Elite)
- **Bows** - All bows including ceremonial/matriarchal (Normal, Exceptional, Elite)
- **Crossbows** - Crossbows (Normal, Exceptional, Elite)
- **Javelins** - Javelins including ceremonial/matriarchal (Normal, Exceptional, Elite)
- **Throwing** - Throwing axes and knives (Normal, Exceptional, Elite)
- **Staves** - Staves (Normal, Exceptional, Elite)
- **Wands** - Wands (Normal, Exceptional, Elite)
- **Scepters** - Scepters (Normal, Exceptional, Elite)
- **Claws** - Assassin claws (Normal, Exceptional, Elite)
- **Orbs** - Sorceress orbs (Normal, Exceptional, Elite)

### Unique Armor (`t:"u"`, `tab:"armor"`)
- **Body Armor** - Chest armor (Normal, Exceptional, Elite)
- **Helms** - Helmets (Normal, Exceptional, Elite)
- **Shields** - Shields (Normal, Exceptional, Elite)
- **Belts** - Belts (Normal, Exceptional, Elite)
- **Boots** - Boots (Normal, Exceptional, Elite)
- **Gloves** - Gloves (Normal, Exceptional, Elite)
- **Quivers** - Arrows and bolts (Normal, Exceptional, Elite)
- **Barbarian Helms** - Barbarian-specific helms (Exceptional, Elite)
- **Druid Pelts** - Druid-specific pelts (Normal, Exceptional, Elite)
- **Necromancer Heads** - Necromancer-specific heads (Exceptional, Elite)
- **Paladin Shields** - Paladin-specific shields (Normal, Exceptional, Elite)

### Unique Jewelry (`t:"u"`, `tab:"jewelry"`)
- **Rings** - Unique rings (no tier)
- **Amulets** - Unique amulets (no tier)

**Note:** Charms and Jewels are tracked separately in their own files.

### Set Items (`t:"s"`, `tab:"sets"`)
Set items are grouped by set name in the `c` field. Each set contains multiple items.

**Example Sets:**
- Sigon's Complete Steel
- Tal Rasha's Wrappings
- Immortal King
- Natalya's Odium
- M'avina's Battle Hymn
- Griswold's Legacy
- Trang-Oul's Avatar
- Aldur's Watchtower
- And many more...

### Runewords (`t:"w"`, `tab:"runewords"`)
Runewords are categorized by where they can be socketed:
- **Weapon** - Runewords for weapons
- **Shield** - Runewords for shields
- **Helm** - Runewords for helms
- **Body Armor** - Runewords for body armor

The `b` field contains the rune formula (e.g., "Eth • Tir • Lo • Mal • Ral").

### Runes (`t:"r"`, `tab:"runes"`)
**Status:** Currently excluded from initial import. May be added later.

## Data Entry Guidelines

### Tier Information
- **Normal** - Base game items (levels 1-40)
- **Exceptional** - Mid-tier items (levels 25-60)
- **Elite** - High-tier items (levels 60+)

### Naming Conventions
- Item names should match in-game names exactly
- Use proper apostrophes (') not backticks (`)
- Preserve special characters and spacing

### Base Types
- Use the exact base item name (e.g., "Hand Axe", "Gothic Plate", "Diadem")
- For runewords, use the rune formula with bullet separators (•)

## File Structure

Data is split across multiple files, all loaded in `index.html`:

```
grail-tracker/
  grail-data.js          → window.RAW_DATA = []  (initializer only)
  grail-data-weapons.js  → unique weapons
  grail-data-armor.js    → unique armor
  grail-data-jewelry.js  → rings & amulets
  grail-data-charms.js   → charms (placeholder)
  grail-data-jewels.js   → jewels (placeholder)
  grail-data-sets.js     → set items
  grail-data-runewords.js → runewords (placeholder)
  grail-data-runes.js    → runes (placeholder)
  grail-data-misc.js     → misc (placeholder)
```

All category files use `window.RAW_DATA.push(...)` to append to the array.

## Next Steps
- [ ] Fill in charms, jewels, runewords, runes, misc placeholders
- [ ] Verify all data against S13 wiki
- [ ] Test in grail tracker application
