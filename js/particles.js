/* Persistent fluid particle field, v6. One canvas, dense points, no libraries. */
(() => {
  const canvas=document.getElementById('particle-canvas');if(!canvas)return;
  const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});if(!ctx)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const mouse={x:-10000,y:-10000,lastX:-10000,lastY:-10000,dx:0,dy:0,active:false};
  let w=0,h=0,ratio=1,points=[],last=0,raf=0;
  const rand=i=>{const n=Math.sin(i*127.1+48.79)*43758.5453;return n-Math.floor(n)};
  function resize(){
    w=innerWidth;h=innerHeight;ratio=Math.min(devicePixelRatio||1,w<600?1.25:1.5);
    canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
    points=[];
    // Dense, ultra-small dots. 2.5k+ on phones; ~9k on desktop.
    let cols=w<600?54:Math.max(90,Math.min(155,Math.round(w/10.5)));
    let rows=w<600?47:Math.max(46,Math.min(75,Math.round(h/11.4)));
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const id=row*cols+col,jx=(rand(id+83)-.5)*4,jy=(rand(id+312)-.5)*4;
      const bx=((col+.5)/cols)*w+jx,by=((row+.5)/rows)*h+jy;
      points.push({bx,by,x:bx,y:by,vx:0,vy:0,k:rand(id*5+19),s:rand(id*7+3)});
    }
  }
  function move(x,y){mouse.dx=mouse.x>-1000?x-mouse.x:0;mouse.dy=mouse.y>-1000?y-mouse.y:0;mouse.lastX=mouse.x;mouse.lastY=mouse.y;mouse.x=x;mouse.y=y;mouse.active=true}
  addEventListener('pointermove',e=>move(e.clientX,e.clientY),{passive:true});
  addEventListener('pointerdown',e=>move(e.clientX,e.clientY),{passive:true});
  addEventListener('pointerout',e=>{if(!e.relatedTarget)mouse.active=false},{passive:true});
  addEventListener('touchmove',e=>{if(e.touches[0])move(e.touches[0].clientX,e.touches[0].clientY)},{passive:true});
  const TAU=Math.PI*2;
  function frame(t){
    raf=requestAnimationFrame(frame);
    if(document.hidden||t-last<(w<600?26:19))return;last=t;
    const tm=t*.001,dark=document.body.dataset.theme==='dark',moving=!reduce.matches;
    ctx.clearRect(0,0,w,h);
    if(mouse.active&&!reduce.matches){
      const radius=w<600?112:180;
      const glow=ctx.createRadialGradient(mouse.x,mouse.y,0,mouse.x,mouse.y,radius*2);
      glow.addColorStop(0,dark?'rgba(86,230,217,.18)':'rgba(37,133,163,.19)');glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=glow;ctx.fillRect(mouse.x-radius*2,mouse.y-radius*2,radius*4,radius*4);
    }
    // batching color groups improves draw speed on large screens
    for(let group=0;group<2;group++){
      ctx.fillStyle=dark?(group?'rgba(173,186,255,.67)':'rgba(98,221,228,.66)'):(group?'rgba(93,90,153,.54)':'rgba(35,112,143,.60)');
      for(const dot of points){if((dot.k>.84?1:0)!==group)continue;
        let tx=dot.bx,ty=dot.by;
        if(moving){tx+=Math.sin(dot.by*.015+tm*.51+dot.s*TAU)*7.5;ty+=Math.cos(dot.bx*.018-tm*.43+dot.s*3)*5.9}
        if(mouse.active&&moving){const dx=tx-mouse.x,dy=ty-mouse.y,rsq=dx*dx+dy*dy,rad=w<600?132:218;
          if(rsq<rad*rad){const r=Math.sqrt(rsq)+.001,strength=Math.pow(1-r/rad,2);
            tx+=((dx/r)*57-(dy/r)*61)*strength+Math.max(-35,Math.min(35,mouse.dx))*strength*1.8;
            ty+=((dy/r)*57+(dx/r)*61)*strength+Math.max(-35,Math.min(35,mouse.dy))*strength*1.8;
          }
        }
        const ease=moving?.075:1;
        dot.vx=(dot.vx+(tx-dot.x)*ease)*.73;dot.vy=(dot.vy+(ty-dot.y)*ease)*.73;
        dot.x+=dot.vx;dot.y+=dot.vy;
        const size=dot.s>.85?1.8:dot.s>.45?1.28:.95;
        ctx.fillRect(dot.x,dot.y,size,size);
      }
    }
    mouse.dx*=.48;mouse.dy*=.48;
  }
  addEventListener('resize',resize,{passive:true});resize();requestAnimationFrame(frame);
})();
