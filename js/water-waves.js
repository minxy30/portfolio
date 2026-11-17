(() => {
  const canvas=document.getElementById('water-canvas'); if(!canvas)return;
  const ctx=canvas.getContext('2d'); let dpr=1,w=0,h=0,ripples=[];
  const resize=()=>{dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
  const add=(x,y)=>{if(document.body.dataset.theme==='light')ripples.push({x,y,r:2,a:.28});};
  addEventListener('resize',resize); addEventListener('pointerdown',e=>add(e.clientX,e.clientY),{passive:true}); addEventListener('pointermove',e=>{if(e.buttons)add(e.clientX,e.clientY)},{passive:true});
  function frame(){ctx.clearRect(0,0,w,h);if(document.body.dataset.theme==='light'){ripples=ripples.filter(q=>q.a>.008);for(const q of ripples){q.r+=1.35;q.a*=.965;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.strokeStyle=`rgba(77,139,151,${q.a})`;ctx.lineWidth=1.2;ctx.stroke();ctx.beginPath();ctx.arc(q.x,q.y,q.r*.56,0,Math.PI*2);ctx.strokeStyle=`rgba(255,255,255,${q.a*.42})`;ctx.stroke();}}requestAnimationFrame(frame)} resize(); frame();
})();

