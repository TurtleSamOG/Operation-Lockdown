/* Lightweight shared feedback: no network calls or dependencies. */
(() => {
  const STATUS_TEXT = {checking:'Checking API',online:'API reachable',offline:'API unreachable'};
  const el = (tag, cls, txt) => { const node = document.createElement(tag); if(cls) node.className=cls; if(txt!==undefined) node.textContent=txt; return node; };
  let lastConnection = 'checking';
  let toastRoot = null;
  function ensureToastRoot(){
    if(toastRoot) return toastRoot;
    toastRoot = el('div','toast-stack');toastRoot.setAttribute('aria-live','polite');toastRoot.setAttribute('aria-atomic','false');
    document.body.appendChild(toastRoot);return toastRoot;
  }
  function notify(text, type='info', title='') {
    const root=ensureToastRoot();
    const card=el('div',`toast ${['success','error','info'].includes(type)?type:'info'}`);
    const sign=el('span','toast-symbol',type==='success'?'✓':type==='error'?'!':'i'); sign.setAttribute('aria-hidden','true');
    const content=el('div'); content.style.flex='1';content.appendChild(el('strong','',title||({success:'Action successful',error:'Action failed',info:'Mission update'}[type]||'Update')));
    content.appendChild(el('span','',String(text).slice(0,420)));
    const close=el('button','','×');close.type='button';close.setAttribute('aria-label','Dismiss notification');close.onclick=()=>card.remove();
    card.append(sign,content,close);root.prepend(card);
    while(root.childElementCount>4) root.lastChild.remove();
    // Show notifications until user dismisses them; important while testing.
    return card;
  }
  function connection(value){
    if(!['checking','online','offline'].includes(value))return;
    lastConnection=value;
    document.querySelectorAll('[data-connection-status]').forEach(x=>{x.dataset.status=value;x.textContent=STATUS_TEXT[value];x.title=value==='online'?'The latest API request reached PHP; database readiness is checked separately':value==='offline'?'Could not contact the PHP server':'Waiting for the first API request';});
  }
  function busy(button, active, loadingText='Working…'){
    if(!button)return;
    if(active){if(button.dataset.waiting==='true')return;button.dataset.waiting='true';button.dataset.originalText=button.textContent;button.disabled=true;button.setAttribute('aria-busy','true');button.textContent=loadingText;}
    else{button.disabled=false;button.removeAttribute('aria-busy');button.textContent=button.dataset.originalText||button.textContent;delete button.dataset.originalText;delete button.dataset.waiting;}
  }
  function line(boxId, message, type='info'){
    const target=document.getElementById(boxId);if(!target)return;
    target.textContent=message;target.className=`message ${type}`;
    target.setAttribute('role','status');
  }
  function stamp(){return new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());}
  function log(targetId,text,type='info'){
    const container=document.getElementById(targetId);if(!container)return;
    const item=el('div',`log-entry ${type==='success'?'good':type==='error'?'bad':''}`);
    item.append(document.createTextNode(text),el('time','',stamp()));container.prepend(item);
    while(container.childElementCount>8)container.lastChild.remove();
  }
  window.LockdownUI = {notify,connection,busy,line,log,stamp};
  document.addEventListener('lockdown:connection',e=>{
    const next=e.detail?.status;
    if(next && next!==lastConnection){const prev=lastConnection;connection(next);
      if(next==='offline')notify('The last request could not reach the server. Check Laragon and your database connection.','error','Connection problem');
      else if(prev==='offline'&&next==='online')notify('The application can contact the server again.','success','Connection restored');
    }
  });
  document.addEventListener('DOMContentLoaded',()=>{
    ensureToastRoot();connection(navigator.onLine?'checking':'offline');
    window.addEventListener('offline',()=>connection('offline'));
    window.addEventListener('online',()=>connection('checking'));
  });
})();
