import{a as v}from"./index.DK-fsZOb.js";var i={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var p;function y(){if(p)return n;p=1;var t=v(),c=Symbol.for("react.element"),R=Symbol.for("react.fragment"),l=Object.prototype.hasOwnProperty,x=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,d={key:!0,ref:!0,__self:!0,__source:!0};function _(o,r,f){var e,u={},s=null,m=null;f!==void 0&&(s=""+f),r.key!==void 0&&(s=""+r.key),r.ref!==void 0&&(m=r.ref);for(e in r)l.call(r,e)&&!d.hasOwnProperty(e)&&(u[e]=r[e]);if(o&&o.defaultProps)for(e in r=o.defaultProps,r)u[e]===void 0&&(u[e]=r[e]);return{$$typeof:c,type:o,key:s,ref:m,props:u,_owner:x.current}}return n.Fragment=R,n.jsx=_,n.jsxs=_,n}var a;function E(){return a||(a=1,i.exports=y()),i.exports}var q=E();const O="/museum_sun".replace(/\/+$/,""),S=(t="/")=>t.startsWith("/")?`${O}${t}`:t;export{q as j,S as u};
