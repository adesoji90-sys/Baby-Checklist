// Generates supabase/seed.sql from the checklist below. Run: node scripts/gen-seed.mjs
// Prices are EDITABLE ESTIMATES in Naira, not verified market prices.
import { writeFileSync } from "node:fs";
const E = "essential", I = "important", A = "after_delivery", L = "later";
// [name, qty, estimated unit price (NGN), priority, note?]
const data = [
  ["Baby Clothing", [
    ["Baby vests / singlets / bodysuits", 6, 0, E], ["Rompers", 6, 3000, E], ["Sleepsuits", 6, 0, E, "At least 6."],
    ["Baby trousers", 4, 2000, I], ["Baby tops", 4, 2000, I], ["Baby caps", 3, 1000, E],
    ["Mittens (8 to 10 pairs)", 10, 0, E], ["Socks", 6, 700, E], ["Booties", 2, 1500, I],
    ["Sweaters / cardigans", 2, 4500, I], ["Bibs", 4, 1200, I], ["Muslin cloths", 6, 1500, E],
    ["Receiving blankets", 4, 3000, E], ["Baby shawls", 2, 0, I], ["Swaddle wraps", 3, 0, I], ["Flannels", 4, 0, I], ["Baby hangers", 1, 0, I], ["Going-home outfits", 1, 8000, E]]],
  ["Sleeping and Nursery", [
    ["Baby cot", 1, 90000, I], ["Baby mattress", 1, 35000, I], ["Waterproof mattress protectors", 2, 6000, E],
    ["Cot bedsheets", 4, 5000, E], ["Baby mosquito net", 1, 8000, E], ["Baby blankets", 3, 6000, E],
    ["Baby sleeping bags", 2, 10000, A], ["Baby wardrobe", 1, 60000, A], ["Storage baskets", 3, 4000, I],
    ["Changing mat", 1, 7000, E], ["Night light", 1, 6000, I], ["Bedside cart assistant", 1, 0, I]]],
  ["Feeding and Breastfeeding", [
    ["Feeding bottle sets", 6, 0, E], ["Bottle steriliser", 1, 25000, I], ["Bottle cleaning brush", 1, 2500, E],
    ["Breast pump", 1, 35000, I], ["Breast milk storage bags", 1, 6000, I], ["Nursing bras", 3, 6000, E],
    ["Breast pads", 2, 4500, E], ["Nursing pillow", 1, 20000, I], ["Burp cloths", 6, 1200, E], ["Feeding bibs", 4, 1500, I], ["Pacifier", 2, 0, I], ["Insulated cooler bag", 1, 0, I]]],
  ["Diapers and Changing", [
    ["Disposable diapers (newborn packs)", 8, 0, E, "Buy enough."], ["Cloth nappies", 12, 1500, A], ["Baby wipes", 10, 0, E, "Buy enough."],
    ["Cotton wool", 3, 1500, E], ["Diaper rash cream", 2, 3500, E], ["Changing mat", 1, 7000, E],
    ["Diaper disposal bags", 3, 1200, I], ["Waterproof changing sheets", 3, 4000, I], ["Baby care bag (diaper bag)", 1, 0, I]]],
  ["Bathing and Skincare", [
    ["Baby bathtub", 1, 15000, E], ["Baby towels", 3, 4500, E], ["Washcloths", 6, 800, E],
    ["Baby bath wash", 2, 4500, E], ["Baby shampoo", 1, 4000, I], ["Baby moisturiser", 2, 5000, E],
    ["Petroleum jelly", 2, 1500, E], ["Baby nail clipper", 1, 3000, E], ["Baby hairbrush", 1, 3000, I],
    ["Baby laundry detergent", 2, 4500, E], ["Baby bath set", 1, 0, E], ["Baby body care set", 1, 0, E, "Goat milk baby lotion, oil and body wash or bar soap."], ["Baby sponge", 1, 0, E], ["Baby comb set", 1, 0, I], ["Baby powder and powder puff", 1, 0, I]]],
  ["Healthcare and Safety", [
    ["Digital thermometer", 1, 8000, E], ["Nasal aspirator", 1, 6000, E], ["Baby healthcare kit", 1, 15000, I],
    ["Saline nasal drops", 2, 3000, I, "Only as advised by your healthcare provider."], ["Medical records folder", 1, 3000, E],
    ["Hand sanitiser", 3, 2500, I], ["Room thermometer", 1, 5000, I]]],
  ["Hospital Bag", [
    ["Baby hospital clothes", 4, 2500, E], ["Receiving blankets", 2, 3000, E], ["Baby caps", 2, 1000, E],
    ["Socks and mittens", 3, 1500, E], ["Newborn diapers", 1, 8500, E], ["Baby wipes", 1, 1800, E],
    ["Baby towel", 1, 4500, E], ["Going-home outfit", 1, 8000, E], ["Mother's maternity gowns", 3, 8000, E],
    ["Nursing bras", 2, 6000, E], ["Maternity pads", 3, 3000, E], ["Disposable underwear", 1, 4000, E],
    ["Toiletries", 1, 12000, E], ["Slippers", 1, 3000, E], ["Towels", 2, 5000, E], ["Comfortable going-home clothes", 1, 10000, E], ["Welcoming set (full outfit for delivery day)", 1, 0, E], ["Delivery wear", 1, 0, E], ["Daddy's baby carrier (hospital walk home)", 1, 0, I]]],
  ["Transportation and Outings", [
    ["Baby stroller", 1, 80000, I], ["Rear-facing infant car seat", 1, 70000, E], ["Baby carrier", 1, 25000, I],
    ["Diaper backpack", 1, 20000, A], ["Portable changing mat", 1, 6000, I], ["Stroller mosquito net", 1, 5000, I], ["Baby carrier with iro and oja", 1, 0, I]]],
  ["Nigerian Household Essentials", [
    ["Rechargeable fan", 1, 25000, E], ["Baby clothes drying rack", 1, 12000, I], ["Extra washing bowls", 3, 3000, I],
    ["Baby laundry basket", 1, 6000, I], ["Mosquito protection", 1, 10000, E], ["Rechargeable night light", 1, 6000, I],
    ["Storage baskets", 2, 4000, A], ["Extra bedsheets", 3, 6000, I], ["Thermos flask", 1, 12000, I],
    ["Household handwashing supplies", 1, 8000, I], ["New bedsheet and pillows", 1, 0, I]]],
  ["Mother's Recovery and Postpartum", [
    ["Postpartum underwear", 4, 3500, E], ["Maternity pads", 4, 3000, E], ["Nursing bras", 2, 6000, E],
    ["Breast pads", 2, 4500, E], ["Nipple cream", 1, 7000, E],
    ["Perineal care supplies", 1, 8000, E, "As appropriate / as advised by your midwife or doctor."],
    ["Comfortable nightwear", 3, 8000, I], ["Nursing-friendly clothing", 3, 9000, I],
    ["Breastfeeding support pillow", 1, 20000, I], ["Personal toiletries", 1, 12000, I], ["Sit bath bowl", 1, 0, E], ["Nursing gown", 2, 0, I], ["Postpartum care package", 1, 0, E], ["Nursing two-piece dresses and gowns", 2, 0, I]]],
];
const ZERO = true;
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
let sql = "-- GENERATED by scripts/gen-seed.mjs. Prices are editable estimates, NOT verified market prices.\n";
sql += "-- Safe to run once on an empty database (skips if categories already exist).\n";
sql += "do $seed$\nbegin\n  if exists (select 1 from public.categories) then\n    raise notice 'Categories already exist - seed skipped.';\n    return;\n  end if;\n";
let total = 0, n = 0;
data.forEach(([cat, items], ci) => {
  sql += `  with c as (insert into public.categories (name, sort_order) values (${q(cat)}, ${ci}) returning id)\n`;
  sql += "  insert into public.items (category_id, name, quantity_required, est_unit_price, priority, notes) values\n";
  sql += items.map(([nm, qty, p, pr, note]) => { total += qty * p; n++; return `    ((select id from c), ${q(nm)}, ${qty}, 0, ${q(pr)}, ${note ? q(note) : "null"})`; }).join(",\n") + ";\n";
});
sql += "end\n$seed$;\n";
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`items: ${n}, estimated total: ${total}`);
