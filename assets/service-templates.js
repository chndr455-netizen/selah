import { SLOTS } from './content.js';
export const SEGMENT_TYPES = {worship:'Worship',praise:'Praise',medley:'Medley',instrumental:'Instrumental',prayer:'Doa',word:'Firman Tuhan',communion:'Perjamuan Kudus',custom:'Custom'};
// Starters are local, editable suggestions. Non-musical segments are never required.
export const STARTERS = [
 {id:'starter-sunday',name:'Ibadah Minggu',segments:SLOTS.map(s=>({name:s.n,type:s.t==='W'?'worship':'praise',recommendation:{category:s.c,type:s.t}}))},
 {id:'starter-night',name:'Praise & Worship Night',segments:[{name:'Pujian',type:'praise'},{name:'Medley',type:'medley'},{name:'Penyembahan',type:'worship'}]},
 {id:'starter-special',name:'Ibadah Khusus',segments:[{name:'Pembukaan',type:'worship'},{name:'Pujian',type:'praise'},{name:'Penutup',type:'worship'}]},
 {id:'starter-blank',name:'Custom / Blank',segments:[]}
];
