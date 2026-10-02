(() => {
 'use strict';
 const journey=document.getElementById('journey');if(!journey||!window.Elev8Motion)return;
 const canvas=document.createElement('canvas');canvas.id='photoMotion';canvas.setAttribute('aria-hidden','true');journey.insertBefore(canvas,journey.querySelector('.day-sky'));
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false});
 if(!gl){canvas.remove();return;}
 let active=false,lost=false,width=0,height=0;
 const images=[...document.querySelectorAll('.journey-plate img')];
 const vertex='attribute vec2 point;varying vec2 screenUV;void main(){screenUV=vec2((point.x+1.0)*.5,(1.0-point.y)*.5);gl_Position=vec4(point,0.0,1.0);}';
 const fragment=`precision highp float;
 varying vec2 screenUV;
 uniform sampler2D photo,earthSurface,earthClouds;
 uniform vec2 viewport,imageSize;
 uniform float plateHeight,plateTop,camera,seam,scene,time,earthPhase,earthSpin,earthMapReady,daylight,descent,twilight,sunRising,solarAltitude,sunAzimuth;
 float band(float a,float b,float feather,float x){return smoothstep(a,a+feather,x)*(1.0-smoothstep(b-feather,b,x));}
 vec2 globeUV(vec3 normal){
   float tilt=.408407,latitude=1.04719755;
   vec3 axis=vec3(normal.x*cos(tilt)-normal.y*sin(tilt),normal.x*sin(tilt)+normal.y*cos(tilt),normal.z);
   vec3 world=vec3(axis.x,axis.y*cos(latitude)-axis.z*sin(latitude),axis.y*sin(latitude)+axis.z*cos(latitude));
   return vec2(fract(atan(world.x,world.z)/6.2831853+.5+earthSpin/6.2831853),clamp(.5-asin(clamp(world.y,-1.0,1.0))/3.14159265,.001,.999));
 }
 vec3 warmLight(){return mix(vec3(1.0,.35,.19),vec3(1.0,.63,.32),sunRising);}
 vec3 skyColor(float heightAbove,float horizontal){
   float height=clamp(heightAbove,0.0,1.0);
   vec3 night=mix(vec3(.045,.066,.13),vec3(.008,.018,.045),pow(height,.65));
   vec3 day=mix(vec3(.61,.80,.95),vec3(.10,.30,.62),pow(height,.62));
   vec3 high=mix(vec3(.22,.12,.31),vec3(.13,.21,.40),sunRising);
   vec3 dusk=mix(warmLight(),high,smoothstep(.03,.94,height));
   float solarGlow=exp(-pow((horizontal-sunAzimuth)/.30,2.0))*exp(-height*5.5);
   vec3 sky=mix(night,day,daylight);
   sky=mix(sky,dusk,twilight*(.82+.18*solarGlow));
   return sky+vec3(1.0,.79,.49)*solarGlow*(daylight*.045+twilight*.10);
 }
 float movingCloud(vec2 uv){
   // Two satellite cloud layers advect at different heights and speeds.
   // The independent weather clock never moves the land or the limb.
   vec2 low=vec2(fract(uv.x+time*.00085),clamp(uv.y+.0015*sin(time*.043+uv.x*19.0),.001,.999));
   vec2 high=vec2(fract(uv.x-time*.00135+.13),clamp(uv.y*.98+.016,.001,.999));
   float dense=texture2D(earthClouds,low).r;
   float cirrus=texture2D(earthClouds,high).r;
   return clamp(dense*.88+smoothstep(.28,.84,cirrus)*.21,0.0,1.0);
 }
 vec3 airClouds(vec3 sky,vec2 uv,float horizon,float heightScale,float visibility){
   float height=clamp((horizon-uv.y)/heightScale,0.0,1.0);
   // Use the existing photograph's real cloud detail for the close sky.
   // A global satellite map would stretch into scratches at this viewpoint.
   float drift=sin(time*.045)*.075;
   vec2 coords=scene<.5?vec2(.12+uv.x*.76+drift,.60+height*.24):vec2(.12+uv.x*.76+drift,.035+height*.16);
   vec3 detail=texture2D(photo,clamp(coords,vec2(.001),vec2(.999))).rgb;
   float clouds=min(detail.r,min(detail.g,detail.b));
   float density=smoothstep(.26,.70,clouds)*(1.0-smoothstep(scene<.5?.18:.42,scene<.5?.52:.90,height));
   float sunward=exp(-pow((uv.x-sunAzimuth)/.38,2.0));
   vec3 tint=mix(vec3(.10,.15,.25),vec3(.89,.95,1.0),daylight);
   // Low Sun lights cloud undersides: retain cool upper shadows.
   tint=mix(tint,warmLight()*(.56+clouds*.40),twilight*(.60+.25*sunward)*(1.0-height*.5));
   sky=mix(sky,tint,density*visibility*.58);
   // Soft shafts follow holes in the moving cloud photograph, not stripes.
   float aperture=1.0-smoothstep(.22,.74,clouds);
   sky+=warmLight()*pow(aperture,3.0)*sunward*exp(-height*3.0)*visibility*(twilight*.035+daylight*.015);
   return sky;
 }
 float riverCenter(float y){
   if(y<.429)return mix(.59,.60,clamp((y-.397)/.032,0.0,1.0));
   if(y<.45)return mix(.60,.675,(y-.429)/.021);
   if(y<.48)return mix(.675,.76,(y-.45)/.03);
   if(y<.51)return mix(.76,.69,(y-.48)/.03);
   if(y<.54)return mix(.69,.61,(y-.51)/.03);
   return mix(.61,.71,clamp((y-.54)/.024,0.0,1.0));
 }
 void main(){
   vec2 local=vec2(screenUV.x*viewport.x,screenUV.y*viewport.y+camera-plateTop);
   if(local.y<0.0||local.y>plateHeight)discard;
   float fit=max(viewport.x/imageSize.x,plateHeight/imageSize.y);
   vec2 drawn=imageSize*fit;
   vec2 uv=(local-vec2((viewport.x-drawn.x)*.5,(plateHeight-drawn.y)*.5))/drawn;
   vec2 warped=uv;float shimmer=0.0;
   if(scene<.5){
     // Earth's photograph stays rigid. Only a separately sampled cloud
     // layer drifts; no rubber-sheet deformation or synthetic storm vortex.
   }else if(scene<1.5){
     float clouds=1.0-smoothstep(.225,.28,uv.y);
     float openSky=smoothstep(.06,.23,uv.x)*(1.0-smoothstep(.92,.99,uv.x));
     warped.x+=clouds*openSky*(sin(time*.18+uv.y*14.0)*.029+sin(time*.3+uv.x*8.0)*.006);
     warped.y+=clouds*openSky*sin(time*.16+uv.x*15.0)*.004;
     float width=mix(.003,.015,clamp((uv.y-.40)/.16,0.0,1.0));
     float river=(1.0-smoothstep(width*.55,width,abs(uv.x-riverCenter(uv.y))))*band(.397,.564,.008,uv.y);
     float flow=sin(uv.y*940.0-time*4.0)+.5*sin(uv.x*650.0+uv.y*320.0-time*2.7);
     warped.x+=river*flow*2.6/drawn.x;
     warped.y+=river*sin(uv.y*760.0-time*3.0)*1.8/drawn.y;
     shimmer=river*pow(max(0.0,sin(uv.y*510.0-time*3.2+uv.x*31.0)),12.0)*.085;
     float edgeTrees=(1.0-smoothstep(.12,.32,uv.x))+smoothstep(.70,.95,uv.x);
     float canopy=band(.49,.90,.07,uv.y);
     float roots=1.0-smoothstep(.74,.9,uv.y);
     float wind=sin(time*.72+uv.x*31.0)+.35*sin(time*1.23+uv.y*24.0);
     warped.x+=clamp(edgeTrees,0.0,1.0)*canopy*roots*wind*4.5/drawn.x;
     warped.y+=canopy*roots*sin(time*.8+uv.x*36.0)*1.0/drawn.y;
   }else{
     vec2 pool=(uv-vec2(.55,.883))/vec2(.39,.061);
     float water=1.0-smoothstep(.82,1.0,dot(pool,pool));
     float ripple=sin(length(pool)*29.0-time*2.5);
     warped.x+=water*(sin(uv.y*920.0-time*1.8)+.5*ripple)*3.2/drawn.x;
     warped.y+=water*sin(uv.x*440.0-time*1.4)*1.6/drawn.y;
     shimmer=water*(pow(max(0.0,ripple),18.0)*.028+sin(uv.y*700.0-time*1.8)*.015);
   }
   vec4 color=texture2D(photo,clamp(warped,vec2(.001),vec2(.999)));
   if(scene<.5){
     vec4 ground=color;
     float atmosphere=band(.555,1.02,.055,uv.y);
     float depth=clamp((uv.y-.55)/.45,0.0,1.0);
     // Perspective: distant clouds near the limb move less than foreground.
     float drift=sin(time*.055)*(.006+depth*.024);
     vec2 cloudUV=clamp(uv+vec2(drift,0.0),vec2(.001),vec2(.999));
     vec3 cloud=texture2D(photo,cloudUV).rgb;
     float luminance=min(cloud.r,min(cloud.g,cloud.b));
     float cloudMask=smoothstep(.38,.72,luminance)*atmosphere;
     // Translucent advection preserves the photographed cloud silhouettes
     // and does not slide coastlines or smear the original sky/limb.
     color.rgb=mix(ground.rgb,cloud,cloudMask*.72);
     vec3 exposure=mix(vec3(.19,.26,.42),vec3(1.0),daylight);
     color.rgb*=mix(vec3(1.0),exposure,atmosphere);
     color.rgb+=warmLight()*cloudMask*twilight*.20;
     float baseLight=min(ground.r,min(ground.g,ground.b));
     float ocean=(1.0-smoothstep(.24,.50,baseLight))*smoothstep(.02,.13,ground.b-ground.r)*atmosphere;
     // From orbit, individual waves are unresolved: only broad specular
     // illumination changes are visible, so avoid patterned wave refraction.
     float reflection=exp(-pow((uv.x-(.33+sin(earthPhase*.12)*.018))/.13,2.0));
     float glint=(.5+.5*sin(earthPhase*.4+uv.y*9.0))*reflection*ocean*.018;
     color.rgb+=vec3(1.0,.94,.84)*glint;
     if(earthMapReady>.5){
       // A genuine projected sphere: the surface texture rotates about an
       // axis while the atmosphere drifts independently above it.
       float radius=.82;
       vec2 sphere=vec2((uv.x-.5)*imageSize.x/imageSize.y,uv.y-(.52+radius))/radius;
       float r2=dot(sphere,sphere);
       if(r2<1.0&&uv.y>.52){
         vec3 normal=vec3(sphere.x,-sphere.y,sqrt(max(0.0,1.0-r2)));
         vec2 mapUV=globeUV(normal);
         vec3 land=texture2D(earthSurface,mapUV).rgb;
         // Intersect a slightly higher sphere for real cloud-height parallax.
         vec2 cloudSphere=sphere/1.012;
         vec3 cloudNormal=vec3(cloudSphere.x,-cloudSphere.y,sqrt(max(0.0,1.0-dot(cloudSphere,cloudSphere))));
         vec2 weatherUV=globeUV(cloudNormal);
         float cloud=movingCloud(weatherUV);
         float shadow=movingCloud(vec2(fract(mapUV.x-.0024*(sunAzimuth-.5)),mapUV.y+.0016));
         // Illumination follows the same rising/setting Sun as the horizon.
         vec3 light=normalize(vec3((sunAzimuth-.5)*2.4,.10+max(0.0,solarAltitude)*.72,.30+daylight*.65));
         float diffuse=max(0.0,dot(normal,light));
         float ambient=.16+.15*daylight+.08*twilight;
         vec3 groundColor=land*(ambient+(.77*daylight+.18*twilight)*diffuse)*(1.0-shadow*(.10+.15*daylight));
         groundColor=mix(groundColor,groundColor*vec3(1.12,.67,.40),twilight*.32);
         float water=(1.0-smoothstep(.025,.13,land.r))*smoothstep(.01,.05,land.b-land.r);
         vec3 halfLight=normalize(light+vec3(0.0,0.0,1.0));
         float specular=pow(max(0.0,dot(normal,halfLight)),80.0)*water*.20*(1.0-cloud)*daylight;
         float cloudLight=max(0.0,dot(cloudNormal,light));
         vec3 cloudColor=mix(vec3(.10,.16,.27),vec3(.91,.96,1.0)*(.50+.50*cloudLight),daylight);
         cloudColor=mix(cloudColor,warmLight()*(.46+.51*cloudLight),twilight*.78);
         vec3 globe=mix(groundColor,cloudColor,smoothstep(.12,.88,cloud)*.92)+vec3(1.0,.92,.77)*specular;
         float limb=pow(1.0-normal.z,4.0);
         vec3 air=mix(vec3(.10,.20,.36),vec3(.30,.62,.92),daylight);
         air=mix(air,warmLight()*.80,twilight);
         float source=exp(-pow((uv.x-sunAzimuth)/.43,2.0));
         globe=mix(globe,air,limb*(.35+.30*source));
         // Preserve the photographic blue atmospheric rim and blend at the
         // lower seam where the scroll journey leaves the orbital scene.
         float blend=smoothstep(.535,.575,uv.y)*smoothstep(.0,.14,normal.z);
         // Retain close-up photographic cloud detail above the lower-
         // resolution satellite globe, with coherent translation only.
         vec3 detail=texture2D(photo,clamp(uv+vec2(sin(time*.055)*.024,0.0),vec2(.001),vec2(.999))).rgb;
         float detailMask=smoothstep(.38,.70,min(detail.r,min(detail.g,detail.b)))*.12;
         detail*=exposure;
         detail=mix(detail,detail*warmLight()*1.3,twilight*.55);
         globe=mix(globe,detail,detailMask);
         color.rgb=mix(color.rgb,globe,blend);
       }
     }
     float sky=1.0-smoothstep(.505,.54,uv.y);
     float immersion=smoothstep(.35,.80,descent);
     float skyHeight=clamp((.525-uv.y)/.525,0.0,1.0);
     float lowAir=exp(-skyHeight*7.0);
     float air=clamp(immersion+(1.0-immersion)*lowAir*(daylight*.91+twilight*.92),0.0,1.0);
     vec3 litSky=skyColor(skyHeight,uv.x);
     litSky=airClouds(litSky,uv,.525,.525,immersion+(1.0-immersion)*lowAir*.80);
     color.rgb=mix(color.rgb,litSky,sky*air);
     // A narrow photo-aligned atmospheric rim changes hue and brightness;
     // low-angle aerosols glow only toward the actual Sun, not across space.
     float rim=exp(-pow((uv.y-.525)/.018,2.0));
     float source=exp(-pow((uv.x-sunAzimuth)/.34,2.0));
     vec3 rimColor=mix(vec3(.21,.48,.83),warmLight(),twilight);
     color.rgb=mix(color.rgb,rimColor*(.57+.43*source),rim*(.28+.37*twilight));
     color.rgb+=warmLight()*twilight*source*exp(-abs(uv.y-.545)*32.0)*.055;
   }else if(scene<1.5){
     // Preserve the photographed cloud shapes while grading both the sky
     // and terrain consistently with the same sunrise/day/sunset/night state.
     float sky=1.0-smoothstep(.225,.29,uv.y);
     float horizon=smoothstep(.02,.27,uv.y);
     float cloudLight=dot(color.rgb,vec3(.2126,.7152,.0722));
     float cloudShape=smoothstep(.30,.64,min(color.r,min(color.g,color.b)));
     vec3 nightGrade=vec3(.18,.25,.42);
     vec3 exposure=mix(nightGrade,vec3(.98,1.02,1.04),daylight);
     color.rgb*=exposure;
     float height=clamp((.27-uv.y)/.27,0.0,1.0);
     vec3 litSky=skyColor(height,uv.x);
     // Keep the real photographed clouds, lighting their undersides with
     // sunrise gold or sunset coral while upper shadows remain cool.
     float underLight=twilight*(.40+.60*horizon)*(.55+.45*exp(-pow((uv.x-sunAzimuth)/.4,2.0)));
     vec3 warm=warmLight();
     vec3 litCloud=mix(color.rgb,warm*(.18+.88*cloudLight),underLight*.73);
     color.rgb=mix(color.rgb,litSky,sky*(1.0-cloudShape)*(.20+.28*daylight+twilight*.15));
     color.rgb=mix(color.rgb,litCloud,sky*cloudShape);
     // A faint higher cloud veil travels independently over the photo sky.
     vec3 layered=airClouds(color.rgb,uv,.27,.27,.42);
     color.rgb=mix(color.rgb,layered,sky);
     color.rgb+=warm*twilight*(1.0-sky)*.028;
   }
   color.rgb+=vec3(.75,.88,1.0)*shimmer;
   float alpha=scene>.5?clamp(local.y/max(1.0,seam),0.0,1.0):1.0;
   gl_FragColor=vec4(color.rgb,alpha);
 }`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw new Error('Photo motion shader unavailable');}return s;}
 let program;
 try{const v=shader(gl.VERTEX_SHADER,vertex),f=shader(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Photo motion link unavailable');}
 catch(_){canvas.remove();return;}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const point=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,2,gl.FLOAT,false,0,0);
 const uniforms=Object.fromEntries(['viewport','imageSize','plateHeight','plateTop','camera','seam','scene','time','earthPhase','earthSpin','earthMapReady','daylight','descent','twilight','sunRising','solarAltitude','sunAzimuth','photo','earthSurface','earthClouds'].map(n=>[n,gl.getUniformLocation(program,n)]));
 gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);gl.uniform1i(uniforms.photo,0);
 const textures=images.map(()=>({texture:null,source:''}));
 const globeTextures=[];
 gl.uniform1i(uniforms.earthSurface,1);gl.uniform1i(uniforms.earthClouds,2);
 ['assets/earth-surfacemap.webp','assets/earth-cloudmap.webp'].forEach((source,i)=>{
   const map=new Image();map.decoding='async';map.onload=()=>{
     if(lost)return;
     const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i+1);gl.bindTexture(gl.TEXTURE_2D,texture);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
     try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,map);globeTextures[i]=texture;}catch(_){gl.deleteTexture(texture);}
     gl.activeTexture(gl.TEXTURE0);
   };map.src=source;
 });
 function upload(image,i){
   gl.activeTexture(gl.TEXTURE0);
   if(lost||!image.complete||!image.naturalWidth||textures[i].source===image.currentSrc)return;
   if(textures[i].texture)gl.deleteTexture(textures[i].texture);
   const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);textures[i]={texture:t,source:image.currentSrc};if(i===0){active=true;journey.dataset.photoMotion='gpu';}}catch(_){gl.deleteTexture(t);}
 }
 function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,innerWidth<720?1.15:1.35);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);images.forEach(upload);}
 images.forEach((image,i)=>image.addEventListener('load',()=>upload(image,i)));
 // Warm distant scenery after the critical hero has had a chance to load.
 const warm=()=>images.slice(1).forEach(image=>{image.loading='eager';});
 if('requestIdleCallback'in window)requestIdleCallback(warm,{timeout:2200});else setTimeout(warm,1500);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;active=false;journey.dataset.photoMotion='fallback';canvas.style.display='none';});
 // Keep the static images and inexpensive 2D fallback if the GPU context is lost.
 window.Elev8PhotoMotion={get active(){return active&&!lost;}};
 function render(time){
   if(!active||lost)return;
   const state=window.elev8miJourney;if(!state)return;
   gl.activeTexture(gl.TEXTURE0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(uniforms.viewport,width,height);gl.uniform1f(uniforms.camera,state.camera);gl.uniform1f(uniforms.plateHeight,state.plateHeight);gl.uniform1f(uniforms.seam,state.seam);gl.uniform1f(uniforms.time,time);
   const clock=window.elev8miCelestial;
   gl.uniform1f(uniforms.descent,(state.camera+height*.5)/state.plateHeight);
   gl.uniform1f(uniforms.twilight,clock?.twilight||0);gl.uniform1f(uniforms.sunRising,clock?.sunRising?1:0);
   gl.uniform1f(uniforms.solarAltitude,clock?.solarAltitude??-.4);gl.uniform1f(uniforms.sunAzimuth,clock?.sunAzimuth??.5);
   gl.uniform1f(uniforms.earthSpin,(clock?.time??time)*Math.PI*2/(clock?.earthSpinSeconds||120));
   gl.uniform1f(uniforms.earthMapReady,globeTextures[0]&&globeTextures[1]?1:0);gl.uniform1f(uniforms.daylight,clock?.daylight||0);
   gl.uniform1f(uniforms.earthPhase,(clock?.time??time)*Math.PI*2/(clock?.earthYearSeconds||17.5));
   images.forEach((image,i)=>{const top=i*(state.plateHeight-state.seam);if(!textures[i].texture||top-state.camera>height||top+state.plateHeight-state.camera<0)return;
     gl.bindTexture(gl.TEXTURE_2D,textures[i].texture);gl.uniform2f(uniforms.imageSize,image.naturalWidth,image.naturalHeight);gl.uniform1f(uniforms.plateTop,top);gl.uniform1f(uniforms.scene,i);gl.drawArrays(gl.TRIANGLES,0,6);
   });
 }
 window.addEventListener('resize',resize,{passive:true});resize();
 window.Elev8Motion.add(render,{fps:30});
})();
