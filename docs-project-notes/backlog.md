# PD2 Grail Tracker — Backlog

## 🔲 Data Still Needed

*(All core data has been added)*

---

## 🎯 Future Features

### High Priority

- [ ] **Sort Options** — Sort items by Name (A-Z), Date Found (newest/oldest), Tier (currently only runewords are alphabetically sorted)
- [ ] **Statistics Dashboard** — Show most recent finds (last 5-10 items), completion rate by tier (Normal/Exceptional/Elite), rarest items still missing (based on drop sources)

### Nice to Have

- [ ] **Notes/Comments** — Allow users to add notes to individual items (e.g., "found in Chaos Sanctuary", "perfect roll", "corrupted with +1 skills")
- [ ] **Bulk Operations** — Mark entire category as found/missing, mark all items of a specific tier as found
- [ ] **Visual Improvements** — Item images/icons (if sprite sheets available), color-coded progress bars showing tier distribution
- [ ] **Data Insights** — Show which special drop sources you're still missing items from, highlight items only available from specific sources
- [ ] **Backup Reminder** — Periodic reminder to export data (localStorage-based), optional auto-export to downloads folder
- [ ] **Enhanced Filters** — Filter by special drop source (DClone, Rathma, Imbue, etc.), combine filters (e.g., "Missing Elite items")

---

## ❓ Needs Clarification / Research

*(All items have been clarified)*

---

<details>
<summary>✅ Completed</summary>

- [x] **Unique Weapons** — `grail-data-weapons.js` (all categories: 1H/2H Axes, Swords, Maces, Daggers, Spears, Polearms, Bows, Crossbows, Javelins, Throwing, Staves, Wands, Scepters, Claws, Orbs)
- [x] **Unique Armor** — `grail-data-armor.js` (Body Armor, Helms, Shields, Belts, Boots, Gloves, Quivers, Barbarian Helms, Druid Pelts, Necromancer Heads, Paladin Shields)
- [x] **Unique Jewelry** — `grail-data-jewelry.js` (Rings, Amulets)
- [x] **Set Items** — `grail-data-sets.js` (32 sets, 128 items, with tiers and comment headers per set)
- [x] **Runewords** — `grail-data-runewords.js` (107 runewords with rune recipes)
- [x] **Data split into separate files** — `grail-data.js` initializes `window.RAW_DATA = []`, all category files use `.push()`
- [x] **index.html updated** — loads all data files in correct order
- [x] **Jewels completeness** — 4 Rainbow Facets (one per element)
- [x] **Charms completeness** — Annihilus, Corrupted Annihilus, Hellfire Torch, Gheed's Fortune
- [x] **Misc Items** — `grail-data-misc.js` (Demonic Cube, Tomes, Keys, Boss Essences, and other unique misc items)
- [x] **DATA_STRUCTURE.md** — updated to match current data format and file structure

</details>

---

## 📝 Technical Notes

**File Structure:**
- `grail-tracker/` - Main application
- `docs/` - Documentation
- `Sources/` - HTML source files from PD2 wiki
- `Extracted/` - Intermediate extracted JSON + JS data files

**localStorage Keys:**
- `pd2grail_v1` - Found items (array of indices)
- `pd2grail_data_v1` - Item data cache
- `pd2grail_dates_v1` - Timestamps for found items
- `pd2grail_data_version` - Version flag (current: 8)

**Data Format:**
```javascript
{t:'type', tab:'tab', c:'category', tier:'tier', n:'name', b:'base', src:'source', runes:'recipe'}
// t types: 'u' (unique), 's' (set), 'w' (runeword), 'r' (rune)
// src values: 'DClone', 'Rathma', 'Imbue', 'Cow', 'Lucion' (optional, special drops only)
// tier: 'Normal', 'Exceptional', 'Elite' (omit for jewelry/charms/runes/runewords)
// runes: rune recipe string e.g. 'Jah - Ith - Ber' (runewords only)
```

**Special Drop Items (src property):**
- See `docs/SPECIAL_DROPS.md` for full list
