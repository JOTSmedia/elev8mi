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
 uniform sampler2D photo;
 uniform vec2 viewport,imageSize;
 uniform float plateHeight,plateTop,camera,seam,scene,time;
 float band(float a,float b,float feather,float x){return smoothstep(a,a+feather,x)*(1.0-smoothstep(b-feather,b,x));}
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
     float clouds=band(.55,1.0,.035,uv.y);
     warped.x+=clouds*(sin(time*.13+uv.y*11.0)*.019+sin(time*.23+uv.x*17.0)*.004);
     warped.y+=clouds*sin(time*.12+uv.x*13.0)*.003;
   }else if(scene<1.5){
     float clouds=1.0-smoothstep(.225,.28,uv.y);
     warped.x+=clouds*(sin(time*.18+uv.y*14.0)*.029+sin(time*.3+uv.x*8.0)*.006);
     warped.y+=clouds*sin(time*.16+uv.x*15.0)*.004;
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
 const uniforms=Object.fromEntries(['viewport','imageSize','plateHeight','plateTop','camera','seam','scene','time','photo'].map(n=>[n,gl.getUniformLocation(program,n)]));
 gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);gl.uniform1i(uniforms.photo,0);
 const textures=images.map(()=>({texture:null,source:''}));
 function upload(image,i){
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
   gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(uniforms.viewport,width,height);gl.uniform1f(uniforms.camera,state.camera);gl.uniform1f(uniforms.plateHeight,state.plateHeight);gl.uniform1f(uniforms.seam,state.seam);gl.uniform1f(uniforms.time,time%1000);
   images.forEach((image,i)=>{const top=i*(state.plateHeight-state.seam);if(!textures[i].texture||top-state.camera>height||top+state.plateHeight-state.camera<0)return;
     gl.bindTexture(gl.TEXTURE_2D,textures[i].texture);gl.uniform2f(uniforms.imageSize,image.naturalWidth,image.naturalHeight);gl.uniform1f(uniforms.plateTop,top);gl.uniform1f(uniforms.scene,i);gl.drawArrays(gl.TRIANGLES,0,6);
   });
 }
 window.addEventListener('resize',resize,{passive:true});resize();
 window.Elev8Motion.add(render,{fps:30});
})();
