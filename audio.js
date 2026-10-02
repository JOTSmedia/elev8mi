(() => {
'use strict';
const button=document.getElementById('toneBtn'),hero=document.getElementById('heroTone'),mode=document.getElementById('audioMode'),volume=document.getElementById('vol'),tuner=document.getElementById('tuner');
if(!button)return;
let context,master,timer,playing=false,next=0,index=0,oscillator,request=0;
const sources=new Set(),cache=new Map(),beat=60/68;
// Original fingerpicked instrumental, C major / A minor / F / G. C5 = 528 Hz.
const chords=[[0,4,7,12],[9,12,16,19],[5,9,12,17],[7,11,14,19]],pattern=[0,2,1,3,2,1,3,2];
function frequency(semitones){return 264*Math.pow(2,semitones/12);}
function stringBuffer(frequency){
 const key=frequency.toFixed(3);if(cache.has(key))return cache.get(key);
 const rate=context.sampleRate,length=Math.ceil(rate*3.8),buffer=context.createBuffer(1,length,rate),data=buffer.getChannelData(0),period=rate/frequency-.5,n=Math.floor(period),fraction=period-n;
 let seed=Math.round(frequency*1000)|0;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return seed/2147483648;};
 for(let i=0;i<n+2;i++)data[i]=noise()*.64;
 for(let i=n+2;i<length;i++){const a=data[i-n],b=data[i-n-1],c=data[i-n-2];data[i]=.4978*((1-fraction)*(a+b)+fraction*(b+c));}
 // A short pluck attack removes hard edges; damping comes from the string model.
 for(let i=0;i<length;i++)data[i]*=Math.min(1,i/(rate*.003))*Math.min(1,(length-i)/(rate*.08));
 cache.set(key,buffer);return buffer;
}
function target(){return (Number(volume?.value??55)/100)*.33;}
function pluck(semitones,time,level){const source=context.createBufferSource(),gain=context.createGain();source.buffer=stringBuffer(frequency(semitones));gain.gain.value=level;source.connect(gain);gain.connect(master);sources.add(source);source.onended=()=>{sources.delete(source);source.disconnect();gain.disconnect();};source.start(time);}
const instruments=['guitar','cello','violin','piano','tone'];
function wave(kind){const key='wave:'+kind;if(cache.has(key))return cache.get(key);const real=new Float32Array(13),imag=new Float32Array(13);for(let h=1;h<imag.length;h++)imag[h]=Math.pow(h,kind==='cello'?-1.55:-1.05)*(kind==='cello'&&h%2===0?.72:1);const result=context.createPeriodicWave(real,imag);cache.set(key,result);return result;}
function bowed(semitones,time,duration,kind){
 const source=context.createOscillator(),filter=context.createBiquadFilter(),gain=context.createGain(),vibrato=context.createOscillator(),depth=context.createGain();
 source.setPeriodicWave(wave(kind));source.frequency.value=frequency(semitones);filter.type='lowpass';filter.frequency.value=kind==='cello'?1700:3300;filter.Q.value=.45;
 vibrato.frequency.value=kind==='cello'?4.7:5.5;depth.gain.value=kind==='cello'?6:9;vibrato.connect(depth);depth.connect(source.detune);
 const attack=kind==='cello'?.24:.16,level=kind==='cello'?.27:.22;gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(level,time+attack);gain.gain.setValueAtTime(level*.86,time+duration*.72);gain.gain.linearRampToValueAtTime(0,time+duration+.25);
 source.connect(filter);filter.connect(gain);gain.connect(master);
 sources.add(source);sources.add(vibrato);source.onended=()=>{sources.delete(source);source.disconnect();filter.disconnect();gain.disconnect();depth.disconnect();};vibrato.onended=()=>{sources.delete(vibrato);vibrato.disconnect();};source.start(time);vibrato.start(time);source.stop(time+duration+.28);vibrato.stop(time+duration+.28);
}
function piano(semitones,time,level){
 const gain=context.createGain();gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(level,time+.008);gain.gain.exponentialRampToValueAtTime(Math.max(.001,level*.17),time+.65);gain.gain.exponentialRampToValueAtTime(.0001,time+2.8);gain.connect(master);
 let alive=3;[1,2.001,3.006].forEach((ratio,i)=>{const source=context.createOscillator(),partial=context.createGain();source.type='sine';source.frequency.value=frequency(semitones)*ratio;partial.gain.value=[1,.25,.09][i];source.connect(partial);partial.connect(gain);sources.add(source);source.onended=()=>{sources.delete(source);source.disconnect();partial.disconnect();if(--alive===0)gain.disconnect();};source.start(time);source.stop(time+2.85);});
}
function schedule(){if(!playing||selected()==='tone')return;const kind=selected();while(next<context.currentTime+.16){const chord=chords[Math.floor(index/16)%4],step=index%8;if(kind==='guitar'){pluck(chord[pattern[step]],next,.58);if(index%8===0)pluck(chord[0]-12,next,.44);}else if(kind==='piano'){piano(chord[pattern[step]],next,.19);if(index%8===0)piano(chord[0]-12,next,.14);}else if(index%4===0){const melody=chord[[0,2,3,1][Math.floor(index/4)%4]];bowed(melody+(kind==='cello'?-24:0),next,beat*1.75,kind);}index++;next+=beat/2;}timer=setTimeout(schedule,45);}
function selected(){return instruments.includes(mode?.value)?mode.value:'guitar';}
function labels(){const label=selected()==='tone'?'528 Hz tone':`${selected()} · C5 tuned to 528 Hz`;button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',`${playing?'Stop':'Play'} ${label}`);hero?.setAttribute('aria-pressed',String(playing));if(hero)hero.textContent=`${playing?'STOP':'PLAY'} ${selected().toUpperCase()}${selected()==='tone'?' · 528 HZ':''}`;tuner?.classList.toggle('on',playing);}
function stop(){request++;playing=false;clearTimeout(timer);timer=undefined;if(context&&master){const now=context.currentTime;master.gain.cancelScheduledValues(now);master.gain.setTargetAtTime(0,now,.025);for(const source of sources){try{source.stop(now+.15);}catch(_){}}if(oscillator){try{oscillator.stop(now+.15);}catch(_){}oscillator=null;}}labels();}
async function start(){const ticket=++request;try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;context??=new Ctx();if(!master){master=context.createGain();master.gain.value=0;master.connect(context.destination);}await context.resume();if(ticket!==request||document.hidden)return;playing=true;master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(target(),context.currentTime,.08);if(selected()!=='tone'){next=context.currentTime+.03;index=0;schedule();}else{oscillator=context.createOscillator();oscillator.frequency.value=528;const gain=context.createGain();gain.gain.value=.20;oscillator.connect(gain);gain.connect(master);oscillator.onended=()=>gain.disconnect();oscillator.start();}labels();}catch(_){stop();button.setAttribute('aria-label','Audio unavailable');}}
button.addEventListener('click',()=>playing?stop():start());hero?.addEventListener('click',()=>playing?stop():start());mode?.addEventListener('change',()=>{const resume=playing;stop();if(resume)start();});volume?.addEventListener('input',()=>{if(playing)master.gain.setTargetAtTime(target(),context.currentTime,.06);});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);labels();
window.Elev8Audio={stop,get playing(){return playing;},get mode(){return selected();}};
})();
