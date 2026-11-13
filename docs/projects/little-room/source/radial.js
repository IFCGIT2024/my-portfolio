/* Context menus for Little Room. UI only; the planner owns all changes. */
(function (root) {
  'use strict';
  let active = null;
  function make(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function closeMenu(restore = true) {
    if (!active) return;
    const { overlay, previous, keyHandler } = active;
    document.removeEventListener('keydown', keyHandler, true);
    overlay.remove(); active = null;
    if (restore && previous && typeof previous.focus === 'function' && previous.isConnected) previous.focus({preventScroll:true});
  }
  function dialogInput(options) {
    closeMenu(false);
    const previous = document.activeElement;
    const overlay = make('div', 'room-menu-overlay room-menu-modal');
    const panel = make('form', 'room-menu-prompt');
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal','true');
    const title=make('h2',null,options.title); const id='room-menu-input-'+Math.random().toString(36).slice(2);
    title.id=id+'-title'; panel.setAttribute('aria-labelledby',title.id); panel.appendChild(title);
    const description=make('p',null,options.description); panel.appendChild(description);
    const label=make('label',null,options.label); label.htmlFor=id; panel.appendChild(label);
    const input=make('input','room-menu-input'); input.id=id; input.name='value'; input.type=options.type; input.value=options.value ?? '';
    if(options.type==='text'){input.maxLength=80;input.required=true;input.autocomplete='off'}
    if(options.type==='number'){input.required=true;input.inputMode='decimal';input.min=options.min;input.max=options.max;input.step=options.step||'any'}
    panel.appendChild(input);
    if(options.type==='color'){
      const colors=make('div','room-menu-swatches'); colors.setAttribute('aria-label','Suggested colours');
      for(const color of ['#cfac9c','#e9a892','#d9b78f','#e8d9b3','#a8c7a0','#6f9a80','#8cb7bc','#a6a0c7','#f1e8da','#5f6e62']){
        const swatch=make('button','room-menu-swatch');swatch.type='button';swatch.style.backgroundColor=color;swatch.title=color;swatch.setAttribute('aria-label','Use '+color);swatch.addEventListener('click',()=>{input.value=color});colors.appendChild(swatch)
      }
      panel.appendChild(colors);
    }
    const actions=make('div','room-menu-prompt-actions');
    const cancel=make('button','room-menu-cancel','Cancel');cancel.type='button';
    const save=make('button','room-menu-save',options.confirm || 'Save');save.type='submit';
    actions.append(cancel,save); panel.appendChild(actions); overlay.appendChild(panel);document.body.appendChild(overlay);
    const keyHandler=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeMenu()}};
    document.addEventListener('keydown',keyHandler,true);active={overlay,previous,keyHandler};
    cancel.addEventListener('click',()=>closeMenu()); overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)closeMenu()});
    panel.addEventListener('submit',e=>{e.preventDefault();let value=input.value;if(options.type==='text')value=value.trim();if(!value)return;closeMenu();options.onSave(value)});
    if(options.type==='text'||options.type==='number')input.focus({preventScroll:true});else save.focus({preventScroll:true});
  }
  function circleMenu({x,y,title,description,actions}) {
    closeMenu(); const previous=document.activeElement;
    const overlay=make('div','room-menu-overlay');
    const panel=make('div','room-radial');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',title);
    const caption=make('p','room-radial-caption',title); panel.appendChild(caption);
    if(description)panel.setAttribute('aria-description',description);
    const center=make('button','room-radial-center');center.type='button';center.setAttribute('aria-label','Close menu');center.textContent='×';center.addEventListener('click',()=>closeMenu());panel.appendChild(center);
    const radius=window.innerWidth<380?90:100;
    if(window.innerHeight<340||window.innerWidth<300)panel.classList.add('room-radial-compact');
    const insetX=radius+51,insetY=radius+52;
    const cx=Math.max(insetX,Math.min(window.innerWidth-insetX,Number.isFinite(x)?x:window.innerWidth/2));
    const cy=Math.max(insetY+20,Math.min(window.innerHeight-insetY,Number.isFinite(y)?y:window.innerHeight/2));
    panel.style.left=`${cx}px`;panel.style.top=`${cy}px`;panel.style.setProperty('--radial-radius',`${radius}px`);
    const buttons=[];
    actions.forEach((action,index)=>{
      const angle=(-90+index*360/actions.length)*Math.PI/180;
      const button=make('button','room-radial-action');button.type='button';button.setAttribute('aria-label',action.label);
      button.style.left=`${Math.cos(angle)*radius}px`;button.style.top=`${Math.sin(angle)*radius}px`;
      const icon=make('span','room-radial-icon',action.icon), label=make('span','room-radial-label',action.label);button.append(icon,label);
      if(action.disabled){button.disabled=true;button.title=action.disabledReason||'Unavailable'}
      button.addEventListener('click',()=>{closeMenu();action.run()});panel.appendChild(button);buttons.push(button);
    });
    overlay.appendChild(panel);document.body.appendChild(overlay);
    const keyHandler=e=>{
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeMenu();return}
      if(e.key==='Tab'){
        const enabled=[center,...buttons.filter(b=>!b.disabled)];const at=enabled.indexOf(document.activeElement);
        if(e.shiftKey&&at<=0){e.preventDefault();enabled[enabled.length-1].focus()}else if(!e.shiftKey&&at===enabled.length-1){e.preventDefault();enabled[0].focus()}
      }
    };
    document.addEventListener('keydown',keyHandler,true);active={overlay,previous,keyHandler};overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)closeMenu()});center.focus({preventScroll:true});
  }
  const isColor=s=>typeof s==='string' && /^#[0-9a-f]{6}$/i.test(s);
  const ObjectMenu={
    open({x,y,item,onAction}) {
      if(!item || typeof onAction!=='function') return;
      const display=String(item.name||item.label||'Your piece').slice(0,80);
      const send=(action,value)=>onAction(action,value);
      const submenu=(title,actions)=>circleMenu({x,y,title,actions:[...actions,{label:'Back',icon:'‹',run:()=>ObjectMenu.open({x,y,item,onAction})}]});
      const number=(label,value,action,min,max)=>dialogInput({title:label,description:'Enter a value, then choose Save.',label,type:'number',value,min,max,step:'0.01',onSave:v=>send(action,v)});
      const actions=[
        {label:'Edit points',icon:'◇',run:()=>send('edit-shape')},
        {label:'Change color',icon:'◉',run:()=>dialogInput({title:'Pick a color',description:item.shape==='image'?'Add a tint to your image.':'Choose a color for this piece.',label:'Color',type:'color',value:isColor(item.color)?item.color:'#cfac9c',onSave:value=>send('color',value)})},
        {label:'Size & angle',icon:'↗',run:()=>submenu('Size & angle',[
          {label:'Width',icon:'↔',run:()=>number('Width in metres',item.widthMetres,'resize-width',0.1,50)},
          {label:'Depth',icon:'↕',run:()=>number('Depth in metres',item.depthMetres,'resize-height',0.1,50)},
          {label:'Rotate 90°',icon:'↻',run:()=>send('rotate')},
          {label:'Set angle',icon:'∠',run:()=>number('Angle in degrees',item.rotation||0,'angle',-36000,36000)}
        ])},
        {label:'Snap & fit',icon:'▦',run:()=>submenu('Snap & fit',[
          {label:'Snap to grid',icon:'▦',run:()=>send('snap-grid')},
          {label:'Snap to wall',icon:'⊣',run:()=>send('snap-wall')},
          {label:'Fit to room',icon:'⌂',run:()=>send('fit-room')}
        ])},
        {label:'More',icon:'⋯',run:()=>submenu('More options',[
          {label:'Rename',icon:'✎',run:()=>dialogInput({title:'Name this piece',description:'Give it a name that makes sense to you.',label:'Piece name',type:'text',value:display,onSave:value=>send('rename',value)})},
          {label:'Duplicate',icon:'⧉',run:()=>send('duplicate')},
          ...(item.type==='custom'?[{label:'Paint',icon:'✿',run:()=>send('paint')}]:[]),
          {label:'Reset outline',icon:'↶',run:()=>send('reset-shape')},
          {label:'Remove piece',icon:'×',run:()=>send('delete')}
        ])}
      ];
      circleMenu({x,y,title:display,description:'Choose an action, tap outside, or press Escape to close.',actions});
    },
    close:closeMenu
  };
  const WallMenu={
    open({x,y,curved,interior=false,onAction}) {
      if(typeof onAction!=='function')return;
      const actions=[
        {label:curved?'Adjust curve':'Curve wall',icon:'⌒',run:()=>onAction('curve')},
        {label:'Straighten',icon:'╱',disabled:!curved,disabledReason:'This wall is already straight.',run:()=>onAction('straighten')},
        {label:'Edit points',icon:'◇',run:()=>onAction('points')},
        ...(interior?[{label:'Remove wall',icon:'×',run:()=>onAction('delete')}]:[]),
        {label:'Finish editing',icon:'✓',run:()=>onAction('done')}
      ];
      circleMenu({x,y,title:'Wall options',description:'Choose how to shape this wall.',actions});
    },
    close:closeMenu
  };
  const NodeMenu={open({x,y,kind,onDelete}){if(typeof onDelete!=='function')return;circleMenu({x,y,title:'Point options',description:'Remove this point or tap outside to keep it.',actions:[{label:'Delete point',icon:'×',run:onDelete}]})},close:closeMenu};
  const OpeningMenu={open({x,y,opening,onAction}){if(!opening||typeof onAction!=='function')return;const name=opening.type==='window'?'Window':'Door';circleMenu({x,y,title:name+' options',actions:[{label:'Set width',icon:'↔',run:()=>dialogInput({title:name+' width',description:'Choose the width in metres.',label:'Width in metres',type:'number',value:opening.widthMetres,min:.1,max:50,step:'0.01',onSave:v=>onAction('width',v)})},{label:'Remove',icon:'×',run:()=>onAction('delete')}]})},close:closeMenu};
  root.ObjectMenu=ObjectMenu;root.WallMenu=WallMenu;root.NodeMenu=NodeMenu;root.OpeningMenu=OpeningMenu;
})(typeof window!=='undefined'?window:globalThis);
