/* Original Canvas 2D field: persistent particles with fluid cursor displacement.
   Built for static GitHub Pages, no third-party shader dependency. */
(() => {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer={x:-1000,y:-1000,px:-1000,py:-1000,vx:0,vy:0,active:false};
  const dots=[];let w=0,h=0,ratio=1,raf=0,last=0,time=0;
  const rand=(s)=>{let x=Math.sin(s*137.173+29.8)*43758.5453;return x-Math.floor(x)};
  function resize(){
    w=innerWidth;h=innerHeight;ratio=Math.min(devicePixelRatio||1,1.6);
    canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    dots.length=0;
    const rows=w<600?15:27, columns=w<600?54:85;
    for(let r=0;r<rows;r++)for(let c=0;c<columns;c++){
      const i=r*columns+c, u=c/(columns-1), v=r/(rows-1);
      const bx=w*(.035+u*.93),by=h*(.13+v*.72);
      dots.push({bx,by,x:bx,y:by,vx:0,vy:0,u,v,seed:rand(i+9),a:.28+rand(i*2)*.65});
    }
  }
  function onPointer(x,y){pointer.vx=x-pointer.x;pointer.vy=y-pointer.y;pointer.px=pointer.x;pointer.py=pointer.y;pointer.x=x;pointer.y=y;pointer.active=true}
  document.addEventListener('pointermove',e=>onPointer(e.clientX,e.clientY),{passive:true});
  document.addEventListener('pointerdown',e=>onPointer(e.clientX,e.clientY),{passive:true});
  document.addEventListener('pointerleave',()=>{pointer.active=false},{passive:true});
  document.addEventListener('touchmove',e=>{if(e.touches.length)onPointer(e.touches[0].clientX,e.touches[0].clientY)},{passive:true});
  function frame(t){
    raf=requestAnimationFrame(frame);
    if(document.hidden)return;
    if(t-last<(w<600?29:18))return;
    last=t;time=t*.001;
    ctx.clearRect(0,0,w,h);
    const dark=document.body.dataset.theme==='dark';
    const baseColor=dark?'110,225,231':'29,121,143';
    const accent=dark?'213,157,241':'161,146,197';
    const localRadius=Math.min(260,Math.max(135,w*.22));
    const moving=!reduce.matches;
    if(pointer.active){
      const g=ctx.createRadialGradient(pointer.x,pointer.y,4,pointer.x,pointer.y,localRadius*1.4);
      g.addColorStop(0,dark?'rgba(67,185,208,.085)':'rgba(68,198,200,.105)');g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(pointer.x,pointer.y,localRadius*1.4,0,Math.PI*2);ctx.fill();
    }
    for(const p of dots){
      const flow=moving?(Math.sin(p.u*17+time*.68+p.v*4.2)*16+Math.cos(p.v*14-time*.45+p.seed*6)*10):0;
      const swirl=moving?Math.sin(p.u*24+time*.39+p.v*13)*12:0;
      let tx=p.bx+flow*(.4+.6*p.v),ty=p.by+swirl;
      if(pointer.active){
        const dx=tx-pointer.x,dy=ty-pointer.y,d2=dx*dx+dy*dy;
        if(d2<localRadius*localRadius){
          const d=Math.sqrt(d2)+1,k=Math.pow(1-d/localRadius,2);
          // Curl around pointer plus small repulsion: liquid particles that trail the cursor.
          tx+=(dx/d*43-dy/d*37)*k;
          ty+=(dy/d*43+dx/d*37)*k;
          if(moving){tx+=Math.max(-10,Math.min(10,pointer.vx))*k*1.2;ty+=Math.max(-10,Math.min(10,pointer.vy))*k*1.2}
        }
      }
      const stiffness=moving?.044:1;
      p.vx=(p.vx+(tx-p.x)*stiffness)*.83;
      p.vy=(p.vy+(ty-p.y)*stiffness)*.83;
      p.x+=p.vx;p.y+=p.vy;
      const opacity=p.a*(dark?.31:.29);
      ctx.fillStyle=`rgba(${p.seed>.85?accent:baseColor},${opacity})`;
      ctx.beginPath();ctx.arc(p.x,p.y,(p.seed>.85?1.35:.95)*(w<600?.86:1),0,Math.PI*2);ctx.fill();
    }
    pointer.vx*=.62;pointer.vy*=.62;
  }
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)last=0});
  resize();raf=requestAnimationFrame(frame);
})();
