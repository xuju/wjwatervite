(self.webpackChunkRemoteClient=self.webpackChunkRemoteClient||[]).push([[8674],{88674:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>m});var s=r(14983),a=(r(84066),r(77645),r(38215),r(45851),r(74184)),i=r(93100),n=r(26649),o=r(1688),u=r(38703),l=r(59467);const c=(0,n.E)({accumulateAttributes:{name:"accumulateAttributeNames"},attributeParameterValues:!0,directionsTimeAttribute:{name:"directionsTimeAttributeName"},impedanceAttribute:{name:"impedanceAttributeName"},outSpatialReference:{name:"outSR",getter:e=>e.outSpatialReference.wkid},pointBarriers:{name:"barriers"},polylineBarriers:!0,polygonBarriers:!0,restrictionAttributes:{name:"restrictionAttributeNames"},stops:!0,travelMode:!0});var p=r(62636);let f=class extends p.Z{constructor(e){super(e)}solve(e,t){return async function(e,t,r){const s=[],a=[],n={},p={},f=(0,l.en)(e);return t.stops&&t.stops.features&&(0,u.et)(t.stops.features,a,"stops.features",n),t.pointBarriers&&t.pointBarriers.features&&(0,u.et)(t.pointBarriers.features,a,"pointBarriers.features",n),t.polylineBarriers&&t.polylineBarriers.features&&(0,u.et)(t.polylineBarriers.features,a,"polylineBarriers.features",n),t.polygonBarriers&&t.polygonBarriers.features&&(0,u.et)(t.polygonBarriers.features,a,"polygonBarriers.features",n),(0,o.aX)(a).then((e=>{for(const t in n){const r=n[t];s.push(t),p[t]=e.slice(r[0],r[1])}return(0,u.Wf)(p,s)?(0,u.bI)(f.path):Promise.resolve({dontCheck:!0})})).then((e=>{("dontCheck"in e?e.dontCheck:e.hasZ)||(0,u.ef)(p,s);for(const e in p)p[e].forEach(((r,s)=>{t.get(e)[s].geometry=r}));const a={...r,query:{...f.query,...c.toQueryParams(t),f:"json"}},{path:n}=f,o="/solve",l=n.endsWith(o)?n:n+o;return(0,i.default)(l,a)})).then((e=>(0,u.mT)(e)))}(this.url,e,t)}};f=(0,s._)([(0,a.j)("esri.tasks.RouteTask")],f);const m=f}}]);