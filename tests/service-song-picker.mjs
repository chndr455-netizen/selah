import assert from 'node:assert/strict';
import {songTypeForSegment,songMatchesSegment,groupServiceSongs,incompatibleEntries} from '../assets/service-song-picker.js';
import {segment,songEntry,makeService,validateService,makeTemplate,validatePlanning,formatService} from '../assets/service-model.js';
const songs=[
 {id:'p',title:'Bersorak',artist:'Tim Musik',key:'D',type:'P',cats:['O']},
 {id:'w2',title:'Ába',artist:'Pencipta',key:'G',type:'W',cats:['G']},
 {id:'w1',title:'Bapa',artist:'Tim Musik',key:'D',type:'W',cats:['O','S']}
];const original=JSON.stringify(songs);
assert.equal(songTypeForSegment('worship'),'W');assert.equal(songTypeForSegment('praise'),'P');
for(const type of ['free','medley','instrumental','prayer','word','communion','custom'])assert.equal(songTypeForSegment(type),'');
assert.equal(songMatchesSegment(songs[0],'worship'),false);assert.equal(songMatchesSegment(songs[1],'praise'),false);assert(songMatchesSegment(undefined,'worship'));
const worship=groupServiceSongs(songs,{type:'worship',category:'O'});assert.deepEqual(worship.recommended.map(s=>s.id),['w1']);assert.deepEqual(worship.others.map(s=>s.id),['w2']);
const praise=groupServiceSongs(songs,{type:'praise',category:'G'});assert.deepEqual(praise.recommended,[]);assert.deepEqual(praise.others.map(s=>s.id),['p']);
const free=groupServiceSongs(songs,{type:'free',category:'O'});assert.deepEqual(free.recommended.map(s=>s.id),['w1','p']);assert.deepEqual(free.others.map(s=>s.id),['w2']);
assert.equal(groupServiceSongs(songs,{type:'free'}).others.length,3);assert.deepEqual(groupServiceSongs(songs,{type:'worship',query:'ABA g'}).others.map(s=>s.id),['w2']);
assert.deepEqual(groupServiceSongs(songs,{type:'worship',query:'  MUSIK d  '}).others.map(s=>s.id),['w1']);assert.deepEqual(groupServiceSongs(songs,{type:'worship',query:'bersorak'}),{recommended:[],others:[]});assert.deepEqual(groupServiceSongs([]),{recommended:[],others:[]});
const entries=['w1','p','missing',''].map(id=>songEntry(id));entries[0].key='B';entries[0].notes='Keep';const entriesBefore=JSON.stringify(entries);
assert.deepEqual(incompatibleEntries(entries,songs,'worship').map(e=>e.songId),['p']);assert.deepEqual(incompatibleEntries(entries,songs,'praise').map(e=>e.songId),['w1']);assert.deepEqual(incompatibleEntries(entries,songs,'free'),[]);assert.equal(JSON.stringify(entries),entriesBefore);assert.equal(JSON.stringify(songs),original);
// Existing type/category mismatches and missing references survive validation; choices filter only in the UI.
const s=segment('worship');s.songs=entries;const plan=makeService({name:'Test',segments:[s]});assert.deepEqual(validateService(plan),plan);assert.equal(validatePlanning({schema:2,set:plan,setlists:[plan],templates:[]},songs).set.segments[0].songs[1].songId,'p');
const bebas=segment('free');bebas.songs=entries;const next=makeService({name:'Bebas',segments:[bebas]}),template=makeTemplate(next);assert.deepEqual(validatePlanning({schema:2,set:next,setlists:[next],templates:[template]},songs).templates[0],template);assert.match(formatService(next,songs),/\(Bebas\)/);
console.log('OK: Worship/Praise/Bebas filtering, category groups without exclusions, normalized search, preserved selections/overrides/orphans, and Bebas backup/template validation.');
