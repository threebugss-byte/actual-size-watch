/* Left dorsal hand in millimetres. The template is independent of wrist input. */
(function(root){
  'use strict';
  const blend=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25};
  const ellipsoid=(x,y,z,cx,cy,cz,rx,ry,rz)=>{
    x-=cx;y-=cy;z-=cz;
    const q=Math.hypot(x/rx,y/ry,z/rz),r=Math.hypot(x/(rx*rx),y/(ry*ry),z/(rz*rz));
    return r>1e-8?q*(q-1)/r:-Math.min(rx,ry,rz);
  };
  const fingers=[
    [[86,-22,-2,7.9],[110,-23,0,7.2],[131,-23.5,-1.6,6.3],[149,-23,-4.5,5.6]],
    [[89,-6,-1,8],[117,-6,1,7.3],[141,-5.8,-1.5,6.3],[163,-5.5,-5,5.6]],
    [[87,10,-2,7.6],[113,10.5,0,6.9],[136,11,-2,6],[154,11.5,-5.5,5.3]],
    [[81,24,-3,6.8],[103,25,-1,6],[121,26,-3,5.2],[135,26.5,-6,4.7]],
    [[43,-21,-4,13],[60,-37,-5,10.7],[81,-49,-5,8.1],[101,-51,-7,6.5]]
  ];
  const segments=fingers.flatMap(f=>f.slice(1).map((p,i)=>{
    const q=f[i],dx=p[0]-q[0],dy=p[1]-q[1],dz=p[2]-q[2];
    return {q,p,dx,dy,dz,len2:dx*dx+dy*dy+dz*dz};
  }));
  function field(x,y,z){
    const t=Math.max(0,Math.min(1,x/60));
    const ry=30+Math.max(0,-x)*.047-9*t,rz=20+Math.max(0,-x)*.027-11*t;
    const q=Math.hypot(y/ry,z/rz),r=Math.hypot(y/(ry*ry),z/(rz*rz));
    const radial=r>1e-8?q*(q-1)/r:-rz,cap=Math.max(-140-x,x-60);
    let d=Math.min(Math.max(radial,cap),0)+Math.hypot(Math.max(radial,0),Math.max(cap,0));
    d=blend(d,ellipsoid(x,y,z,64,0,-2,41,31,12),8);
    d=blend(d,ellipsoid(x,y,z,53,-16,-6,25,19,12),5);
    for(const s of segments){
      const t=Math.max(0,Math.min(1,((x-s.q[0])*s.dx+(y-s.q[1])*s.dy+(z-s.q[2])*s.dz)/s.len2));
      const distance=Math.hypot(x-s.q[0]-t*s.dx,y-s.q[1]-t*s.dy,z-s.q[2]-t*s.dz)-(s.q[3]+t*(s.p[3]-s.q[3]));
      d=blend(d,distance,3.2);
    }
    return d;
  }
  function createTemplate(T){
    const step=2.2,min=[-145,-64,-31],max=[174,47,31];
    const nx=Math.ceil((max[0]-min[0])/step)+1,ny=Math.ceil((max[1]-min[1])/step)+1,nz=Math.ceil((max[2]-min[2])/step)+1;
    const count=nx*ny*nz,values=new Float32Array(count),coords=new Float32Array(count*3);
    const id=(x,y,z)=>(x*ny+y)*nz+z;
    for(let x=0;x<nx;x++)for(let y=0;y<ny;y++)for(let z=0;z<nz;z++){
      const i=id(x,y,z),px=min[0]+x*step,py=min[1]+y*step,pz=min[2]+z*step;
      coords[i*3]=px;coords[i*3+1]=py;coords[i*3+2]=pz;values[i]=field(px,py,pz);
    }
    const positions=[],indices=[],edgeCache=new Map();
    function edge(i,j){
      const key=Math.min(i,j)*count+Math.max(i,j);if(edgeCache.has(key))return edgeCache.get(key);
      const t=values[i]/(values[i]-values[j]),index=positions.length/3;
      for(let axis=0;axis<3;axis++)positions.push(coords[i*3+axis]+t*(coords[j*3+axis]-coords[i*3+axis]));
      edgeCache.set(key,index);return index;
    }
    function triangle(i,j,k,inside){
      const ax=positions[j*3]-positions[i*3],ay=positions[j*3+1]-positions[i*3+1],az=positions[j*3+2]-positions[i*3+2];
      const bx=positions[k*3]-positions[i*3],by=positions[k*3+1]-positions[i*3+1],bz=positions[k*3+2]-positions[i*3+2];
      const dx=coords[inside*3]-positions[i*3],dy=coords[inside*3+1]-positions[i*3+1],dz=coords[inside*3+2]-positions[i*3+2];
      if((ay*bz-az*by)*dx+(az*bx-ax*bz)*dy+(ax*by-ay*bx)*dz>0)indices.push(i,k,j);else indices.push(i,j,k);
    }
    const tetrahedra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
    for(let x=0;x<nx-1;x++)for(let y=0;y<ny-1;y++)for(let z=0;z<nz-1;z++){
      const cube=[id(x,y,z),id(x+1,y,z),id(x+1,y+1,z),id(x,y+1,z),id(x,y,z+1),id(x+1,y,z+1),id(x+1,y+1,z+1),id(x,y+1,z+1)];
      const negative=cube.filter(i=>values[i]<0).length;if(negative===0||negative===8)continue;
      for(const tet of tetrahedra){
        const inside=[],outside=[];for(const v of tet)(values[cube[v]]<0?inside:outside).push(cube[v]);
        if(inside.length===1){const i=inside[0];triangle(edge(i,outside[0]),edge(i,outside[1]),edge(i,outside[2]),i)}
        else if(inside.length===3){const o=outside[0];triangle(edge(o,inside[0]),edge(o,inside[1]),edge(o,inside[2]),inside[0])}
        else if(inside.length===2){const [i,j]=inside,[u,v]=outside,p=edge(i,u),q=edge(i,v),r=edge(j,u),s=edge(j,v);triangle(p,q,r,i);triangle(q,s,r,i)}
      }
    }
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    return geometry;
  }
  function deform(template,a,b){
    const geometry=template.clone(),points=geometry.attributes.position;
    for(let i=0;i<points.count;i++){
      const x=points.getX(i),t=Math.max(0,Math.min(1,(x-5)/37));
      const weight=1-t*t*(3-2*t);
      points.setY(i,points.getY(i)*(1+(a/30-1)*weight));points.setZ(i,points.getZ(i)*(1+(b/20-1)*weight));
    }
    points.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();return geometry;
  }
  const nails=fingers.map((f,i)=>{const p=f[2],q=f[3],t=.69;return {x:p[0]+(q[0]-p[0])*t,y:p[1]+(q[1]-p[1])*t,z:p[2]+(q[2]-p[2])*t+p[3]+(q[3]-p[3])*t-.15,length:i===4?10:9,width:i===3?6.2:i===4?8.4:8,angle:Math.atan2(q[1]-p[1],q[0]-p[0]),slope:Math.atan2(q[2]-p[2],q[0]-p[0])}});
  const api={createTemplate,deform,nails};
  root.WatchHand=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
