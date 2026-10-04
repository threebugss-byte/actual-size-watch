(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const models = [
    // Apple Watch
    {
      brand: 'Apple Watch',
      name: 'Apple Watch Series 11',
      shortName: 'Series 11',
      source: 'https://support.apple.com/en-gb/125093',
      sizes: [[42,36,9.7],[46,39,9.7]],
      cases: [
        {name:'실버', color:'#d8dade', metalness:.8, roughness:.22},
        {name:'제트 블랙', color:'#141518', metalness:.92, roughness:.1},
        {name:'로즈 골드', color:'#e2bcae', metalness:.75, roughness:.26}
      ]
    },
    {
      brand: 'Apple Watch',
      name: 'Apple Watch Ultra 3',
      shortName: 'Ultra 3',
      source: 'https://support.apple.com/en-ie/125095',
      sizes: [[49,44,12]],
      ultra: true,
      cases: [
        {name:'내추럴 티타늄', color:'#b8b4a9', metalness:.75, roughness:.35},
        {name:'블랙 티타늄', color:'#282a2e', metalness:.85, roughness:.25}
      ]
    },
    {
      brand: 'Apple Watch',
      name: 'Apple Watch SE 3',
      shortName: 'SE 3',
      source: 'https://www.apple.com/apple-watch-se-3/specs/',
      sizes: [[40,34,10.7],[44,38,10.7]],
      cases: [
        {name:'미드나이트', color:'#222933', metalness:.8, roughness:.25},
        {name:'스타라이트', color:'#e5ded4', metalness:.8, roughness:.25},
        {name:'실버', color:'#d8dade', metalness:.8, roughness:.25}
      ]
    },
    {
      brand: 'Apple Watch',
      name: 'Apple Watch Series 10',
      shortName: 'Series 10',
      source: 'https://support.apple.com/en-gb/121202',
      sizes: [[42,36,9.7],[46,39,9.7]],
      cases: [
        {name:'실버', color:'#d8dade', metalness:.8, roughness:.22},
        {name:'제트 블랙', color:'#141518', metalness:.92, roughness:.1},
        {name:'로즈 골드', color:'#e2bcae', metalness:.75, roughness:.26}
      ]
    },
    // Galaxy Watch
    {
      brand: 'Galaxy Watch',
      name: 'Galaxy Watch7',
      shortName: 'Watch7',
      source: 'https://www.samsung.com/sec/watches/galaxy-watch7/',
      sizes: [[40.4,40.4,9.7],[44.4,44.4,9.7]],
      round: true,
      cases: [
        {name:'그린', color:'#34463a', metalness:.8, roughness:.25},
        {name:'실버', color:'#d8dade', metalness:.8, roughness:.25},
        {name:'크림', color:'#dfdcd4', metalness:.8, roughness:.25}
      ]
    },
    {
      brand: 'Galaxy Watch',
      name: 'Galaxy Watch Ultra',
      shortName: 'Watch Ultra',
      source: 'https://www.samsung.com/sec/watches/galaxy-watch-ultra/',
      sizes: [[47.4,47.1,12.1]],
      round: true,
      cushion: true,
      ultra: true,
      cases: [
        {name:'티타늄 그레이', color:'#33363c', metalness:.85, roughness:.28},
        {name:'티타늄 화이트', color:'#e4e4e6', metalness:.8, roughness:.25},
        {name:'티타늄 실버', color:'#b8b4a9', metalness:.8, roughness:.3}
      ]
    },
    {
      brand: 'Galaxy Watch',
      name: 'Galaxy Watch6 Classic',
      shortName: 'Watch6 Classic',
      source: 'https://www.samsung.com/sec/watches/galaxy-watch6-classic/',
      sizes: [[42.5,42.5,10.9],[46.5,46.5,10.9]],
      round: true,
      classic: true,
      cases: [
        {name:'블랙', color:'#1e2023', metalness:.85, roughness:.22},
        {name:'실버', color:'#d8dade', metalness:.85, roughness:.2}
      ]
    },
    {
      brand: 'Galaxy Watch',
      name: 'Galaxy Watch FE',
      shortName: 'Watch FE',
      source: 'https://www.samsung.com/sec/watches/galaxy-watch-fe/',
      sizes: [[39.3,40.4,9.8]],
      round: true,
      cases: [
        {name:'블랙', color:'#222427', metalness:.8, roughness:.25},
        {name:'실버', color:'#d8dade', metalness:.8, roughness:.25},
        {name:'핑크 골드', color:'#e5b7b0', metalness:.75, roughness:.28}
      ]
    }
  ];
  const state={model:0,size:0,caseColor:0,otherModel:4,otherSize:0,circ:160,skin:'#cda58b',band:'#343c41',compare:false,hand:'left'};
  const view={yaw:-.22,pitch:.55,zoom:1};
  let renderer,scenes=[],cameras=[],objects=[],a=30,b=20,queued=false;
  const perimeter=(x,y)=>Math.PI*(3*(x+y)-Math.sqrt((3*x+y)*(x+3*y)));
  function wristDimensions(){
    a=state.circ/perimeter(1,.68); b=a*.68;
    $('#circ-value').textContent=(state.circ/10).toFixed(1)+' cm';
  }
  function populateModels(){
    $('#model').replaceChildren();
    $('#compare-model').replaceChildren();
    const groups={};
    models.forEach((m,i)=>{
      const brand=m.brand||'기타';
      if(!groups[brand]){
        const optgroup=document.createElement('optgroup');
        optgroup.label=brand;
        groups[brand]=optgroup;
        $('#model').append(optgroup);
      }
      groups[brand].append(new Option(m.name,i));
      m.sizes.forEach((s,j)=>$('#compare-model').add(new Option(`${m.shortName||m.name} · ${s[0]} mm`,`${i}:${j}`)));
      const link=document.createElement('a');link.href=m.source;link.textContent=m.shortName||m.name;link.target='_blank';link.rel='noopener';$('#sources').append(link);
    });
    $('#compare-model').value='4:0';
  }
  populateModels();
  function sizeButtons(){
    $('#sizes').replaceChildren();models[state.model].sizes.forEach((s,i)=>{const button=document.createElement('button');button.innerHTML=`${s[0]}<small>mm</small>`;button.className=i===state.size?'active':'';button.setAttribute('aria-pressed',String(i===state.size));button.onclick=()=>{state.size=i;sizeButtons();update()};$('#sizes').append(button)});
  }
  function caseButtons(){
    const m=models[state.model];
    $('#case-colors').replaceChildren();
    if(state.caseColor>=m.cases.length) state.caseColor=0;
    m.cases.forEach((c,i)=>{
      const button=document.createElement('button');
      button.style.setProperty('--swatch',c.color);
      button.className=i===state.caseColor?'active':'';
      button.setAttribute('aria-pressed',String(i===state.caseColor));
      button.setAttribute('aria-label',c.name);
      button.onclick=()=>{state.caseColor=i;caseButtons();rebuild();render();};
      $('#case-colors').append(button);
    });
    $('#case-name').textContent=m.cases[state.caseColor].name;
  }
  function update(){
    wristDimensions();const m=models[state.model],s=m.sizes[state.size],other=models[state.otherModel].sizes[state.otherSize];
    $('#case-dimensions').textContent=`${s[1]} × ${s[0]} × ${s[2]} mm`;
    const ratio=s[0]/(2*a);$('#coverage').textContent=Math.round(ratio*100)+'%';
    $('#fit-text').textContent=`손목 너비 약 ${(2*a).toFixed(1)} mm 중 케이스 ${s[0]} mm`;
    $('#compare-text').textContent=state.compare?`비교 모델 ${Math.round(other[0]/(2*a)*100)}% · 두께 ${other[2]} mm`: `양옆 여유 약 ${Math.max(0,(2*a-s[0])/2).toFixed(1)} mm씩`;
    if(!state.compare&&ratio>1)$('#compare-text').textContent=`케이스가 손목 너비보다 ${(s[0]-2*a).toFixed(1)} mm 큽니다`;
    $('#label-a').textContent=`${state.compare?'A · ':''}${m.shortName||m.name} / ${s[0]} mm`;
    $('#label-b').textContent=`B · ${models[state.otherModel].shortName||models[state.otherModel].name} / ${other[0]} mm`;
    ['#label-b','#divider','#compare-options'].forEach(id=>$(id).hidden=!state.compare);
    if(renderer&&!queued){queued=true;requestAnimationFrame(()=>{queued=false;rebuild();render()})}
  }
  $('#model').onchange=()=>{state.model=+$('#model').value;state.size=0;state.caseColor=0;sizeButtons();caseButtons();update()};
  $('#circumference').oninput=()=>{
    state.circ=+$('#circumference').value;
    document.querySelectorAll('.chip-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.circ)===state.circ));
    update();
  };
  document.querySelectorAll('.chip-btn').forEach(btn=>{
    btn.onclick=()=>{
      state.circ=Number(btn.dataset.circ);
      $('#circumference').value=state.circ;
      document.querySelectorAll('.chip-btn').forEach(b=>b.classList.toggle('active',b===btn));
      update();
    };
  });
  $('#compare').onchange=()=>{state.compare=$('#compare').checked;update()};
  $('#compare-model').onchange=()=>{[state.otherModel,state.otherSize]=$('#compare-model').value.split(':').map(Number);update()};
  ['skin','band'].forEach(type=>$('#'+type+'-colors').onclick=e=>{
    const button=e.target.closest('button');if(!button)return;
    state[type]=button.dataset.color;
    $('#'+type+'-colors').querySelectorAll('button').forEach(el=>{el.classList.toggle('active',el===button);el.setAttribute('aria-pressed',String(el===button))});
    const nameEl=$('#'+type+'-name');if(nameEl&&button.dataset.name)nameEl.textContent=button.dataset.name;
    update();
  });
  ['left','right'].forEach(h=>{const btn=$('#hand-'+h);if(btn)btn.onclick=()=>{state.hand=h;$('#hand-left').classList.toggle('active',h==='left');$('#hand-left').setAttribute('aria-pressed',String(h==='left'));$('#hand-right').classList.toggle('active',h==='right');$('#hand-right').setAttribute('aria-pressed',String(h==='right'));rebuild();render();};});
  const captureBtn=$('#capture-btn');if(captureBtn)captureBtn.onclick=()=>{render();const dataUrl=renderer.domElement.toDataURL('image/png');const link=document.createElement('a');const m=models[state.model],s=m.sizes[state.size];link.download=`watch-${(m.shortName||m.name).replace(/\s+/g,'-').toLowerCase()}-${s[0]}mm.png`;link.href=dataUrl;link.click();};
  $('#help').onclick=()=>$('#guide').showModal();$('#close-guide').onclick=()=>$('#guide').close();$('#guide-done').onclick=()=>{$('#guide').close();$('#circumference').focus()};$('#guide').onclick=e=>{if(e.target===$('#guide')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}};
  sizeButtons();caseButtons();update();
  try{
    if(!window.THREE)throw new Error('Three.js 라이브러리(three.min.js)를 불러오지 못했습니다.');
    try{
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
    }catch(err1){
      try{
        renderer=new THREE.WebGLRenderer({alpha:true});
      }catch(err2){
        if(THREE.WebGL1Renderer){
          renderer=new THREE.WebGL1Renderer({alpha:true});
        }else{
          throw err1;
        }
      }
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setClearColor(0x000000,0);
    if(THREE.SRGBColorSpace)renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.25;
    $('#viewport').append(renderer.domElement);
    $('#loading').hidden=true;
  }catch(e){
    console.error('3D Init failed:', e);
    $('#loading').innerHTML=`<div style="padding:16px;text-align:center;line-height:1.5;"><p style="font-weight:600;color:#e53e3e;margin-bottom:6px;">3D 화면 초기화 실패</p><p style="font-size:12px;color:#555;word-break:break-all;margin-bottom:10px;">${e&&(e.message||e)}</p><p style="font-size:11px;color:#888;">(F12 개발자 도구의 Console 탭에서 상세 로그를 확인할 수 있습니다)</p></div>`;
    return;
  }
  const T=THREE;
  const orientation=new T.Quaternion();
  const handTemplate=WatchHand.createTemplate(T);
  function material(color,metalness=0,roughness=.7,side=T.FrontSide){return new T.MeshStandardMaterial({color,metalness,roughness,side})}
  function mesh(group,geometry,mat,x=0,y=0,z=0){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);group.add(m);return m}
  function ellipsoid(group,x,y,z,sx,sy,sz,mat){const m=mesh(group,new T.SphereGeometry(1,28,20),mat,x,y,z);m.scale.set(sx,sy,sz);return m}
  function createArm(group){
    const skin=material(state.skin,0,.82,T.DoubleSide);
    mesh(group,WatchHand.deform(handTemplate,a,b),skin);
    const nailColor=new T.Color(state.skin).lerp(new T.Color('#eee2d9'),.28);
    const nailMaterial=material(nailColor,0,.5,T.DoubleSide);
    for(const nail of WatchHand.nails){
      const surface=ellipsoid(group,nail.x,nail.y,nail.z,nail.length/2,nail.width/2,.45,nailMaterial);
      surface.rotation.z=nail.angle;surface.rotation.y=-nail.slope;
    }
  }
  function roundedShape(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;r=Math.min(r,w/2,h/2);s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
  function roundedBox(w,h,d,r,bevel=.8){const g=new T.ExtrudeGeometry(roundedShape(w-2*bevel,h-2*bevel,r-bevel),{depth:d-2*bevel,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:12});g.translate(0,0,bevel);return g}
  function roundCase(r,d,bevel=.8){const s=new T.Shape();s.absarc(0,0,r-bevel,0,Math.PI*2);const g=new T.ExtrudeGeometry(s,{depth:d-2*bevel,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:40});g.translate(0,0,bevel);return g}
  function bandGeometry(width){const positions=[],indices=[],n=128;for(let i=0;i<=n;i++){const t=i/n*2*Math.PI;for(let j=0;j<4;j++){const outer=j>=2,edge=j%2;positions.push((edge?1:-1)*width/2,(a+(outer?3:1))*Math.sin(t),(b+(outer?3:1))*Math.cos(t));}if(i<n){const k=i*4;for(const [j,l] of [[0,1],[1,3],[3,2],[2,0]])indices.push(k+j,k+l,k+4+j,k+l,k+4+l,k+4+j)}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g}
  function faceTexture(round=false){
    const now=new Date();
    const hours=String(now.getHours()).padStart(2,'0');
    const minutes=String(now.getMinutes()).padStart(2,'0');
    const timeStr=`${hours}:${minutes}`;
    const days=['일','월','화','수','목','금','토'];
    const month=now.getMonth()+1;
    const date=now.getDate();
    const day=days[now.getDay()];

    const c=document.createElement('canvas');c.width=512;c.height=round?512:640;
    const ctx=c.getContext('2d');
    ctx.fillStyle='#06070a';ctx.fillRect(0,0,c.width,c.height);

    if(round){
      ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(256,256,238,0,Math.PI*2);ctx.stroke();

      ctx.textAlign='center';
      ctx.fillStyle='#10d07a';ctx.font='600 28px -apple-system,BlinkMacSystemFont,sans-serif';
      ctx.fillText(`${month}.${date} ${day}`,256,140);

      ctx.fillStyle='#f5f5f7';ctx.font='300 130px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillText(timeStr,256,290);

      ctx.fillStyle='#3086fe';ctx.font='600 25px -apple-system,sans-serif';
      ctx.fillText('♥ 72  ·  85%',256,375);

      ctx.fillStyle='#8e8e93';ctx.font='500 22px -apple-system,sans-serif';
      ctx.fillText('6,420 걸음',256,420);
    }else{
      ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=4;ctx.strokeRect(16,16,480,608);

      ctx.textAlign='center';ctx.fillStyle='#ff453a';ctx.font='600 34px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillText(`${month}월 ${date}일 ${day}`,256,130);

      ctx.fillStyle='#f5f5f7';ctx.font='300 136px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillText(timeStr,256,310);

      const cx=256,cy=445;
      const rings=[{r:44,w:9,color:'#fa114f',p:.78},{r:32,w:9,color:'#a1ff00',p:.62},{r:20,w:9,color:'#00e1f7',p:.85}];
      rings.forEach(({r,w,color,p})=>{
        ctx.strokeStyle=color;ctx.globalAlpha=.22;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
        ctx.globalAlpha=1;ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+Math.PI*2*p);ctx.stroke();
      });
      ctx.globalAlpha=1;ctx.fillStyle='#8e8e93';ctx.font='500 23px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillText('21° 맑음',256,545);
    }
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return texture;
  }
  function createWatch(group,mi,si,ci=0){
    const model=models[mi],[h,w,d]=model.sizes[si],ultra=model.ultra,isRound=Boolean(model.round);
    const caseSpec=model.cases[ci]||model.cases[0];
    const band=material(state.band,0,.88,T.DoubleSide);band.side=T.DoubleSide;mesh(group,bandGeometry(ultra?25:22),band);
    const watch=new T.Group();watch.position.z=b+1;group.add(watch);
    const metal=material(caseSpec.color,caseSpec.metalness,caseSpec.roughness);

    if(isRound){
      const r=w/2;
      if(model.cushion){
        mesh(watch,roundedBox(w,h,d,14,1.2),metal);
        mesh(watch,roundCase(r*.88,1.6,.3),metal,0,0,d-1.2);
        mesh(watch,new T.CircleGeometry(r*.78,36),new T.MeshBasicMaterial({map:faceTexture(true)}),0,0,d+.42);
        const quick=mesh(watch,new T.CylinderGeometry(2.4,2.4,2.5,32),material('#e66025',.4,.35),w/2+1,0,d*.5);quick.rotation.z=Math.PI/2;
        const b1=mesh(watch,roundedBox(1.8,6,2,.6,.2),metal,w/2+.8,7.5,d*.5);b1.rotation.y=Math.PI/2;
        const b2=mesh(watch,roundedBox(1.8,6,2,.6,.2),metal,w/2+.8,-7.5,d*.5);b2.rotation.y=Math.PI/2;
      }else{
        mesh(watch,roundCase(r,d,model.classic?.5:.8),metal);
        mesh(watch,roundCase(r-1.2,1.2,.2),material('#11171e',.2,.18),0,0,d-1);
        if(model.classic) mesh(watch,roundCase(r-.2,1.5,.3),metal,0,0,d-1.1);
        const screenR=r-(model.classic?4.6:3.0);
        mesh(watch,new T.CircleGeometry(screenR,40),new T.MeshBasicMaterial({map:faceTexture(true)}),0,0,d+.22);
        const key1=mesh(watch,roundedBox(1.6,6,2,.6,.2),metal,r+.7,4.8,d*.52);key1.rotation.y=Math.PI/2;
        const redAccent=mesh(watch,roundedBox(.5,4.5,1.4,.3,.1),material('#d93025',.5,.4),r+1.4,4.8,d*.52);redAccent.rotation.y=Math.PI/2;
        const key2=mesh(watch,roundedBox(1.6,6,2,.6,.2),metal,r+.7,-4.8,d*.52);key2.rotation.y=Math.PI/2;
      }
    }else{
      mesh(watch,roundedBox(w,h,d,ultra?8:10,ultra?.8:1.8),metal);
      mesh(watch,roundedBox(w-1.7,h-1.7,1.3,ultra?7:9.6,.45),material('#11171e',.2,.18),0,0,d-1.1);
      const sw=w-(ultra?5.3:4.4),sh=h-(ultra?5.7:4.4),geo=new T.ShapeGeometry(roundedShape(sw,sh,ultra?5:7.5),20);
      const points=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<points.count;i++)uv.setXY(i,(points.getX(i)+sw/2)/sw,(points.getY(i)+sh/2)/sh);
      mesh(watch,geo,new T.MeshBasicMaterial({map:faceTexture(false)}),0,0,d+.22);
      const crown=mesh(watch,new T.CylinderGeometry(3.2,3.2,3.8,36),metal,w/2+1.2,h*.2,d*.55);crown.rotation.z=Math.PI/2;
      const rim=mesh(watch,new T.CylinderGeometry(2.6,2.6,.35,36),material(ultra?'#e68138':(caseSpec.color==='#141518'?'#222':'#4c5663'),.4,.35),w/2+3.2,h*.2,d*.55);rim.rotation.z=Math.PI/2;
      const side=mesh(watch,roundedBox(2.1,9,2.2,1,.3),metal,w/2,-h*.17,d*.45);side.rotation.y=Math.PI/2;
      if(ultra){const action=mesh(watch,roundedBox(2.5,9,2,1,.3),material('#dc7935',.4,.5),-w/2-1,-h*.1,d*.42);action.rotation.y=-Math.PI/2;}
    }

    [-1,1].forEach(sign=>{const curve=new T.CatmullRomCurve3([new T.Vector3(0,sign*(h/2-3),b+2),new T.Vector3(0,sign*(h/2+1),b*.88),new T.Vector3(0,sign*(a+2),0)]);const pts=[],ids=[];for(let i=0;i<=24;i++){const p=curve.getPoint(i/24);pts.push(-10,p.y,p.z,10,p.y,p.z);if(i<24){const k=i*2;ids.push(k,k+1,k+2,k+1,k+3,k+2)}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setIndex(ids);g.computeVertexNormals();mesh(group,g,band)});
  }
  function makeScene(mi,si,ci=0){
    const scene=new T.Scene();scene.add(new T.HemisphereLight(0xffffff,0xaaa39b,2));
    const key=new T.DirectionalLight(0xffffff,3.5);key.position.set(-80,-70,150);scene.add(key);
    const fill=new T.DirectionalLight(0xffffff,1.3);fill.position.set(60,90,60);scene.add(fill);
    const object=new T.Group();scene.add(object);
    const armGroup=new T.Group();createArm(armGroup);
    if(state.hand==='right')armGroup.scale.y=-1;
    object.add(armGroup);
    createWatch(object,mi,si,ci);
    const camera=new T.OrthographicCamera(-100,100,100,-100,.1,1200);camera.up.set(0,0,1);
    return {scene,camera,object};
  }
  function dispose(scene){const materials=new Set(),geometries=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))});geometries.forEach(g=>g.dispose());materials.forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}
  function rebuild(){scenes.forEach(dispose);scenes=[];cameras=[];objects=[];const first=makeScene(state.model,state.size,state.caseColor);scenes.push(first.scene);cameras.push(first.camera);objects.push(first.object);if(state.compare){const second=makeScene(state.otherModel,state.otherSize,0);scenes.push(second.scene);cameras.push(second.camera);objects.push(second.object)}}
  let isActualSize=false;
  function updateActualSizeBtn(){
    const btn=$('#actual-size-btn');
    if(btn){
      btn.classList.toggle('active',isActualSize);
      btn.setAttribute('aria-pressed',String(isActualSize));
    }
  }
  function getPixelsPerMm(){
    const div=document.createElement('div');
    div.style.cssText='position:absolute;left:-9999px;top:-9999px;width:100mm;height:0;visibility:hidden;pointer-events:none;';
    document.body.appendChild(div);
    const px=div.getBoundingClientRect().width/100;
    div.remove();
    return px>0?px:(96/25.4);
  }
  function get1to1Zoom(){
    const box=$('#viewport').getBoundingClientRect();
    const count=scenes.length||1;
    const viewportWidth=box.width/count;
    const aspect=viewportWidth/box.height;
    const baseFrameHeight=Math.max(125,270/aspect);
    return (baseFrameHeight*getPixelsPerMm())/box.height;
  }
  function render(){
    if(!renderer)return;
    if(isActualSize&&!animId){view.zoom=get1to1Zoom()}
    orientation.setFromEuler(new T.Euler(view.pitch,view.yaw,0,'YXZ'));
    const box=$('#viewport').getBoundingClientRect(),width=box.width,height=box.height,count=scenes.length;
    renderer.setSize(width,height,false);renderer.setScissorTest(true);
    for(let i=0;i<count;i++){
      const viewportWidth=width/count,cam=cameras[i],aspect=viewportWidth/height;
      const baseFrameHeight=Math.max(125,270/aspect);
      const frameHeight=baseFrameHeight/view.zoom;
      cam.left=-frameHeight*aspect/2;cam.right=frameHeight*aspect/2;
      cam.top=frameHeight/2;cam.bottom=-frameHeight/2;
      cam.position.set(15,-.028,280);cam.lookAt(15,0,0);
      objects[i].quaternion.copy(orientation);
      cam.updateProjectionMatrix();
      renderer.setViewport(i*viewportWidth,0,viewportWidth,height);
      renderer.setScissor(i*viewportWidth,0,viewportWidth,height);
      renderer.render(scenes[i],cam);
    }
    renderer.setScissorTest(false);
    $('#zoom-label').textContent=isActualSize?'1:1 실물':Math.round(view.zoom*100)+'%';
  }
  const presets={
    three:[-.22,.55],
    top:[0,0],
    side:[0,1.42],
    opposite:[0,-1.42],
    buckle:[0,Math.PI]
  };
  let animId=null, velYaw=0, velPitch=0;
  function smoothTo(targetY,targetP,targetZ=view.zoom,onDone){
    cancelAnimationFrame(animId);
    let diffP=(targetP-view.pitch)%(Math.PI*2);
    if(diffP>Math.PI)diffP-=Math.PI*2;
    if(diffP<-Math.PI)diffP+=Math.PI*2;
    const startP=view.pitch,destP=startP+diffP;
    const startY=view.yaw,startZ=view.zoom;
    let t=0;
    function anim(){
      t+=0.09;
      const ease=0.5-0.5*Math.cos(Math.min(t,1)*Math.PI);
      view.yaw=startY+(targetY-startY)*ease;
      view.pitch=startP+(destP-startP)*ease;
      view.zoom=startZ+(targetZ-startZ)*ease;
      render();
      if(t<1){animId=requestAnimationFrame(anim)}
      else{
        view.yaw=targetY;view.pitch=targetP;view.zoom=targetZ;
        render();if(onDone)onDone();
      }
    }
    anim();
  }
  function setView(name){
    if(!presets[name])return;
    const [y,p]=presets[name];
    smoothTo(y,p);
    document.querySelectorAll('[data-view]').forEach(el=>{
      const active=el.dataset.view===name;
      el.classList.toggle('active',active);
      el.setAttribute('aria-pressed',String(active));
    });
  }
  function dragRotate(dx,dy){
    cancelAnimationFrame(animId);
    const sensitivity=0.0065;
    velYaw=dx*sensitivity;
    velPitch=dy*sensitivity;
    view.yaw=Math.max(-1.4,Math.min(1.4,view.yaw+velYaw));
    view.pitch+=velPitch;
    if(view.pitch>Math.PI)view.pitch-=Math.PI*2;
    if(view.pitch<-Math.PI)view.pitch+=Math.PI*2;
    document.querySelectorAll('[data-view]').forEach(el=>{el.classList.remove('active');el.setAttribute('aria-pressed','false')});
    render();
  }
  function startInertia(){
    cancelAnimationFrame(animId);
    function inertia(){
      if(Math.abs(velYaw)>0.0001||Math.abs(velPitch)>0.0001){
        velYaw*=0.91;velPitch*=0.91;
        view.yaw=Math.max(-1.4,Math.min(1.4,view.yaw+velYaw));
        view.pitch+=velPitch;
        if(view.pitch>Math.PI)view.pitch-=Math.PI*2;
        if(view.pitch<-Math.PI)view.pitch+=Math.PI*2;
        render();
        animId=requestAnimationFrame(inertia);
      }
    }
    animId=requestAnimationFrame(inertia);
  }
  function zoom(factor){
    cancelAnimationFrame(animId);
    isActualSize=false;
    updateActualSizeBtn();
    view.zoom=Math.max(.5,Math.min(3.2,view.zoom*factor));
    render();
  }
  document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>setView(button.dataset.view));
  $('#reset-view').onclick=()=>{
    isActualSize=false;
    updateActualSizeBtn();
    setView('three');
    smoothTo(presets.three[0],presets.three[1],1);
  };
  $('#zoom-in').onclick=()=>zoom(1.15);
  $('#zoom-out').onclick=()=>zoom(1/1.15);
  const actualSizeBtn=$('#actual-size-btn');
  if(actualSizeBtn){
    actualSizeBtn.onclick=()=>{
      isActualSize=!isActualSize;
      updateActualSizeBtn();
      if(isActualSize){
        const z=get1to1Zoom();
        setView('top');
        smoothTo(presets.top[0],presets.top[1],z);
      }else{
        smoothTo(view.yaw,view.pitch,1);
      }
    };
  }
  const vp=$('#viewport'),pointers=new Map();let pinch=0;
  vp.addEventListener('pointerdown',e=>{
    cancelAnimationFrame(animId);velYaw=0;velPitch=0;
    if(e.button!==0&&e.pointerType==='mouse')return;
    vp.focus({preventScroll:true});vp.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){const p=[...pointers.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}
  });
  vp.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId))return;
    const previous=pointers.get(e.pointerId);
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){
      const p=[...pointers.values()],distance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
      if(pinch>0)zoom(distance/pinch);pinch=distance;
    }else{
      dragRotate(e.clientX-previous.x,e.clientY-previous.y);
    }
  });
  const release=e=>{
    pointers.delete(e.pointerId);pinch=0;
    if(pointers.size===0)startInertia();
  };
  vp.addEventListener('pointerup',release);
  vp.addEventListener('pointercancel',release);
  vp.addEventListener('lostpointercapture',release);
  vp.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(-e.deltaY*.001))},{passive:false});
  vp.addEventListener('dblclick',()=>{$('#reset-view').click()});
  vp.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','0'].includes(e.key)){
      e.preventDefault();
      if(e.key==='+'||e.key==='=')return zoom(1.1);
      if(e.key==='-')return zoom(1/1.1);
      if(e.key==='0')return $('#reset-view').click();
      dragRotate(e.key==='ArrowLeft'?-14:e.key==='ArrowRight'?14:0,e.key==='ArrowUp'?-14:e.key==='ArrowDown'?14:0);
    }
  });
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#loading').hidden=false;$('#loading').textContent='3D 화면 연결이 중단되었습니다. 페이지를 새로고침해 주세요.'});
  new ResizeObserver(render).observe(vp);rebuild();render();

  // Keep clock in sync with real current minute
  let currentMinute=new Date().getMinutes();
  setInterval(()=>{
    const m=new Date().getMinutes();
    if(m!==currentMinute){
      currentMinute=m;
      rebuild();
      render();
    }
  },10000);
})();
