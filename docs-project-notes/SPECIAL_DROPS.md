# Special Drop Source Items

All special drop items now have the `src` property added!

## Diablo Clone (src: 'DClone') ✅
- Overlord's Helm - grail-data-armor.js ✅
- Dark Abyss - grail-data-armor.js ✅
- Hadriel's Hand - grail-data-weapons.js ✅
- Aidan's Scar - grail-data-weapons.js ✅
- Itherael's Path - grail-data-armor.js ✅
- Annihilus - grail-data-charms.js (need to add charms data)

## Rathma (src: 'Rathma') ✅ Confirmed — exclusive drops only
- Cage of the Unsullied - grail-data-armor.js ✅
- Band of Skulls - grail-data-armor.js ✅
- The Third Eye - grail-data-jewelry.js ✅
- Corrupted Annihilus - grail-data-charms.js ✅ (via Tainted Worldstone Shard)
- Tainted Worldstone Shard - grail-data-misc.js ✅

**Note:** Horadrim Navigator, Horadrim Almanac and Skeleton Key have higher drop rates from Rathma but are universal drops — no src label applied.

## Charsi (Imbue Quest Reward)
- Armageddon's Blade - Phase Blade - grail-data-weapons.js ✅ (src: 'Charsi')

## Cow Level (src: 'Cow') ✅
- Cow King's Horns - grail-data-sets.js ✅
- Cow King's Hide - grail-data-sets.js ✅
- Cow King's Hooves - grail-data-sets.js ✅

**To see the labels:** Clear localStorage cache in browser console:
```javascript
localStorage.removeItem('pd2grail_data_v1');
localStorage.removeItem('pd2grail_data_version');
location.reload();
```
