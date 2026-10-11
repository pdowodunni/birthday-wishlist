// Wishlist items. Edit this file to add, remove or change gifts.
// Each item: [id, name, note, options]. Options: link [label,url], sizes [..], done (already got), multi (cash).
export const GROUPS=[
 {key:"other",title:"Cash",items:[
  ["cash","Cash","Transfer to OPay 9067667742. Anyone can send, no booking needed.",{multi:true}]]},
 {key:"perfume",title:"Perfumes",items:[
  ["rayhaan","Rayhaan Elixir","by Rayhaan, eau de parfum 100ml"],
  ["azure","Azure Royal","by Ahmed Al Maghribi"],
  ["vanilla","Vanilla Soufflé","by Maison Lamiero"],
  ["deeper","Deeper Than Words","by Maison Yusif"],
  ["rise","Rise","the orange bottle in the photo"],
  ["blackstone","Black Stone","by Ramón Bejar"],
  ["swy","Stronger With You Intensely","by Emporio Armani"],
  ["oud","Oud Maracujá","by Maison Crivelli (the oil version is fine too)"],
  ["tears","Tears","by Comme des Garçons"],
  ["netaniel","Netaniel","by Bealuxe"],
  ["cosmos","VII Queen Anne Cosmos Flower","by Clive Christian"]]},
 {key:"wear",title:"Clothes, shoes & rings",items:[
  ["fila","Fila (Gòbì)","Yoruba cap, styles like the catalog. Tap to see it",{link:["@filayoruba on Instagram","https://instagram.com/filayoruba"]}],
  ["shoes","Dress shoes","Size 42, styles like these. Tap to see more",{link:["@ay_quadri on Instagram","https://instagram.com/ay_quadri"]}],
  ["birk","Birkenstock slides","Size 42"],
  ["shirts","White office shirts","Size M, slim fit"],
  ["ankara","Ankara pants","Size M (medium), styles like these. Tap to see more"],
  ["rings","itel Smart Ring","Silver, size 7",{link:["Jumia","https://www.jumia.com.ng/itel-smart-ring-health-monitor-wellness-waterproof-silver-400368480.html"]}],
  ["bag","oraimo MegaCarry backpack","Expandable, waterproof business backpack. Black",{link:["oraimo store","https://ng.oraimo.com/product/oraimo-megacarry-expandable-business-backpack-ohdb-001?ean=4894947110948"]}]]},
 {key:"tech",title:"Tech & gadgets",items:[
  ["pixel","Google Pixel Watch 5",""],
  ["ssd","Portable SSD","SanDisk or similar. Pick a size when you book",{sizes:["128GB","256GB","512GB","1TB"]}],
  ["magsafe","Oraimo MagSafe power bank",""],
  ["tank","itel Power Tank","portable power station"],
  ["ghost","Ghost of Tsushima Director's Cut","PS5 game"],
  ["earbuds","Noise-cancelling headphones","Like Anker Soundcore, but any brand is fine"],
  ["claude","Claude Max subscription","one month or more"],
  ["ps5","PS5 (1TB)","Already got it",{done:true}],
  ["pads","2 PS5 controllers","Already got it",{done:true}],
  ["fc26","EA Sports FC 26","Already got it",{done:true}]]},
 {key:"books",title:"Books",items:[
  ["trial","The Trial","Franz Kafka"],
  ["meta","The Metamorphosis","Franz Kafka"],
  ["karamazov","The Brothers Karamazov","Fyodor Dostoevsky"],
  ["crime","Crime and Punishment","Fyodor Dostoevsky"],
  ["underground","Notes from Underground","Fyodor Dostoevsky"],
  ["fear","Fear and Trembling","Søren Kierkegaard"],
  ["redrising","Red Rising","Pierce Brown",{link:["Rovingheights Books","https://rhbooks.com.ng/product/red-rising/"]}]]}
];
export const SHOP={perfume:["@elixirs_ng on Instagram","https://instagram.com/elixirs_ng"],books:["Rovingheights Books","https://rhbooks.com.ng/"]};
export const PHOTOS={
"redrising": ["/img/redrising-0.jpg"],
"cash": [
"/img/cash-0.gif"
],
"rayhaan": [
"/img/rayhaan-0.jpg",
"/img/rayhaan-1.jpg"
],
"azure": [
"/img/azure-0.jpg"
],
"vanilla": [
"/img/vanilla-0.jpg"
],
"deeper": [
"/img/deeper-0.jpg"
],
"rise": [
"/img/rise-0.jpg"
],
"blackstone": [
"/img/blackstone-0.jpg"
],
"swy": [
"/img/swy-0.jpg"
],
"oud": [
"/img/oud-0.jpg"
],
"tears": [
"/img/tears-0.jpg"
],
"netaniel": [
"/img/netaniel-0.jpg"
],
"cosmos": [
"/img/cosmos-0.jpg"
],
"fila": [
"/img/fila-0.jpg",
"/img/fila-1.jpg"
],
"shoes": [
"/img/shoes-0.jpg",
"/img/shoes-1.jpg",
"/img/shoes-2.jpg"
],
"birk": [
"/img/birk-0.jpg"
],
"shirts": [
"/img/shirts-0.jpg"
],
"ankara": [
"/img/ankara-0.jpg",
"/img/ankara-1.jpg",
"/img/ankara-2.jpg",
"/img/ankara-3.jpg"
],
"rings": [
"/img/rings-0.jpg",
"/img/rings-1.jpg",
"/img/rings-2.jpg"
],
"bag": [
"/img/bag-0.jpg"
],
"pixel": [
"/img/pixel-0.jpg"
],
"ssd": [
"/img/ssd-0.jpg"
],
"magsafe": [
"/img/magsafe-0.jpg"
],
"tank": [
"/img/tank-0.jpg"
],
"ghost": [
"/img/ghost-0.jpg"
],
"earbuds": [
"/img/earbuds-0.jpg"
],
"claude": [
"/img/claude-0.jpg"
],
"ps5": [
"/img/ps5-0.jpg"
],
"pads": [
"/img/pads-0.jpg"
],
"fc26": [
"/img/fc26-0.jpg"
],
"trial": [
"/img/trial-0.jpg"
],
"meta": [
"/img/meta-0.jpg"
],
"karamazov": [
"/img/karamazov-0.jpg"
],
"crime": [
"/img/crime-0.jpg"
],
"underground": [
"/img/underground-0.jpg"
],
"fear": [
"/img/fear-0.jpg"
]
};
export const ACCOUNT={bank:"OPay",number:"9067667742"};
export const ALL=GROUPS.flatMap(g=>g.items.map(([id,name,note,o])=>({id,name,note,group:g.key,...(SHOP[g.key]?{link:SHOP[g.key]}:{}),...(o||{})})));
export const BOOKABLE_IDS=ALL.filter(i=>!i.multi&&!i.done).map(i=>i.id);
