export const colors = {
  a:{a: "#FFFFFF",
  b: "#000000",
  c: "#9D9D9D",
  d: "#BE2633",
  e: "#E06F8B",
  f: "#493C2B",
  g: "#A46422",
  h: "#EB8931",
  i: "#F7E26B",
  j: "#44891A",
  k: "#A3CE27",
  l: "#005784",
  m: "#31A2F2",
  n: "#B2DCEF",
  o: "#b452cd",
  p: "#8968cd"},

  b:{a: "#712424",
  b: "#a85454",
  c: "#ea9191",
  d: "#5f4747",
  e: "#848484",
  f: "#b2aeae",
  g: "#2f3330",
  h: "#4d4d4d",
  i: "#5c5c5c",
  j: "#5c5f44",
  k: "#898551",
  l: "#ada864",
  m: "#1c1c1c",
  n: "#656565",
  o: "#ffffff",
  p: "#31A2F2",},

  c:{a: "#ffffff",
  b: "#e57373",
  c: "#ba68c8",
  d: "#7986cb",
  e: "#4fc3f7",
  f: "#4dd0e1",
  g: "#4db6ac",
  h: "#81c784",
  i: "#aed581",
  j: "#dce775",
  k: "#fff176",
  l: "#ffd54f",
  m: "#ffb74d",
  n: "#ff8a65",
  o: "#a1887f",
  p: "#e0e0e0",},

  d:{a: "#FFFFFF",
  b: "#C0C0C0",
  c: "#808080",
  d: "#000000",
  e: "#FF0000",
  f: "#800000",
  g: "#FFFF00",
  h: "#808000",
  i: "#00FF00",
  j: "#008000",
  k: "#00FFFF",
  l: "#008080",
  m: "#0000FF",
  n: "#000080",
  o: "#FF00FF",
  p: "#800080",},

  e:{a: "#51574a",
  b: "#447c69",
  c: "#74c493",
  d: "#8e8c6d",
  e: "#e4bf80",
  f: "#e9d78e",
  g: "#e2975d",
  h: "#f19670",
  i: "#e16552",
  j: "#c94a53",
  k: "#be5168",
  l: "#a34974",
  m: "#993767",
  n: "#65387d",
  o: "#4e2472",
  p: "#9163b6",},

  f:{a: "#faf7f3",
  b: "#c4c4cc",
  c: "#9399ac",
  d: "#59556d",
  e: "#bda27e",
  f: "#cfaeff",
  g: "#ad6dfb",
  h: "#fceeab",
  i: "#ffcccc",
  j: "#f3b0cf",
  k: "#9bf45e",
  l: "#60d181",
  m: "#4ea780",
  n: "#deeff5",
  o: "#80baf0",
  p: "#4e96bc",}
}


var now = new Date();

var hour = now.getHours()+now.getMinutes()/60;
var month = now.getMonth()
var month_days = now.getDate()

var black = Math.floor(42.5*hour-1.77*(hour*hour));

if(black>255){
  black=255;
}
if(black<0){
  black=0;
}

var month_colors = [
  [175, 236, 240], //Jan
  [175, 240, 233], //Feb
  [175, 240, 208], //March
  [207, 240, 175], //April
  [233, 240, 175], //May
  [240, 229, 175], //Jun
  [240, 223, 175], //Jul
  [240, 213, 175], //Aug
  [240, 193, 175], //Sept
  [240, 175, 240], //Oct
  [209, 175, 240], //Nov
  [175, 181, 240], //Dec
]

var this_color = month_colors[month]
var next_color
if (month+1===12){
  next_color = month_colors[0]
}else{
  next_color = month_colors[month+1]
}

var red = this_color[0] + month_days*(this_color[0] - next_color[0])/31
var green = this_color[1] + month_days*(this_color[1] - next_color[1])/31
var blue = this_color[2] + month_days*(this_color[2] - next_color[2])/31

export const backgroundColor = {red, green, blue, black}
