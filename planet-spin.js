(() => {
 'use strict';
 // NASA sidereal periods (hours), axial obliquity (degrees), atmosphere colors.
 // Signed periods preserve retrograde rotation. Time is logarithmically
 // compressed for legibility; these existing disc photographs are illustrative
 // surface textures, not complete scientific longitude maps.
 const data={Mercury:[1407.6,.034,'#c9bdb0'],Venus:[-5832.5,177.4,'#ffd799'],Earth:[23.9345,23.44,'#84ccff'],Mars:[24.6,25.2,'#ff9e73'],Jupiter:[9.9,3.1,'#e9ba94'],Saturn:[10.7,26.7,'#f1d59d'],Uranus:[-17.2,97.8,'#85edf2'],Neptune:[16.1,28.3,'#84a9ff']};
 const spinning=[];let last=-1;
 function prepare(button){
   const name=button.dataset.planet,parameters=data[name],img=button.querySelector('img');
   if(!parameters||!img||name==='Earth')return;
   button.style.setProperty('--planet-glow',parameters[2]);
   const source=document.createElement('canvas');source.width=source.height=64;
   const sample=source.getContext('2d',{willReadFrequently:true});if(!sample)return;
   const output=document.createElement('canvas');output.width=output.height=48;output.className='spinning-planet';
   const context=output.getContext('2d');if(!context)return;
   const tilt=parameters[1]>90?parameters[1]-180:parameters[1];output.style.transform=`translate(-50%,-50%) rotate(${tilt}deg)`;
   function load(){
     try{
       const fraction=name==='Saturn'?.42:.98,side=Math.min(img.naturalWidth,img.naturalHeight)*fraction;
       sample.drawImage(img,(img.naturalWidth-side)/2,(img.naturalHeight-side)/2,side,side,0,0,64,64);
       const original=sample.getImageData(0,0,64,64).data,pixels=new Uint8ClampedArray(original.length);
       // Unwrap the usable portion of each photographed latitude into a
       // seamless strip; mirror at the seam rather than pulling in empty corners.
       for(let y=0;y<64;y++){const latitude=(y+0.5-32)/32,half=Math.sqrt(Math.max(0,1-latitude*latitude))*30;
         for(let x=0;x<64;x++){const sx=Math.min(63,Math.max(0,Math.round(32+Math.sin((x/64-.5)*Math.PI*2)*half))),from=(y*64+sx)*4,to=(y*64+x)*4;for(let c=0;c<4;c++)pixels[to+c]=original[from+c];}
       }
       const frame=context.createImageData(48,48),mapping=[];
       for(let y=0;y<48;y++)for(let x=0;x<48;x++){
         const nx=(x+0.5-24)/24,ny=(y+0.5-24)/24,r2=nx*nx+ny*ny;if(r2>=1)continue;
         const z=Math.sqrt(1-r2),longitude=Math.atan2(nx,z),latitude=Math.asin(ny);
         mapping.push({out:(y*48+x)*4,u:longitude/(Math.PI*2)+.5,v:Math.min(63,Math.max(0,Math.round((latitude/Math.PI+.5)*63))),light:.35+.65*z});
       }
       // Preserve the ring sprite's plane while only the globe turns.
       if(name!=='Saturn')img.style.visibility='hidden';
       button.append(output);
       const seconds=10*Math.pow(Math.abs(parameters[0])/23.9345,.32),sign=Math.sign(parameters[0]);
       spinning.push({img,output,context,pixels,frame,mapping,seconds,sign,name});
       render(window.Elev8Motion?.time||0);
     }catch(_){output.remove();img.style.visibility='';}
   }
   if(img.complete&&img.naturalWidth)load();else img.addEventListener('load',load,{once:true});
 }
 function render(time){
   spinning.forEach(body=>{
     const size=parseFloat(body.img.style.width)||20;
     body.output.style.width=`${size*(body.name==='Saturn'?.42:1)}px`;
     const offset=time/body.seconds*body.sign;
     for(const point of body.mapping){const x=Math.floor(((point.u+offset)%1+1)%1*64),i=(point.v*64+x)*4,o=point.out;for(let c=0;c<3;c++)body.frame.data[o+c]=body.pixels[i+c]*point.light;body.frame.data[o+3]=255;}
     body.context.putImageData(body.frame,0,0);
   });last=time;
 }
 document.querySelectorAll('.solar-body[data-planet]').forEach(prepare);
 window.Elev8Motion?.add(time=>{if(time===last)return;render(time);},{fps:30});
})();
