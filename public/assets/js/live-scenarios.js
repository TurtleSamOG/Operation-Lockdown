/** Live attack scenario text (shared by the student takeover, leaderboard debrief and facilitator buttons).
 * Questions and option LABELS only — which option is right lives on the server (api/live-attack.php).
 * Option ids must match the server's allowed options.
 */
export const LIVE_SCENARIOS = {
  ransomware:{icon:'🦠', title:'Ransomware outbreak', blurb:'Contain it, handle the ransom demand, recover safely',
    intro:'FIN-07 and three other PCs just showed this screen. Files on the shared drive are being renamed to .locked.',
    banner:{kind:'ransom', head:'YOUR FILES HAVE BEEN ENCRYPTED', body:'Send 3 Bitcoin within 48 hours or your data is gone forever. Do not contact the police.'},
    items:[
      {id:'d1', q:'What do you do FIRST?', opts:[['reboot', 'Restart every computer to clear it'], ['isolate', 'Disconnect the infected machines from the network'], ['email', 'Email all staff a warning from the infected PCs']]},
      {id:'d2', q:'The criminals demand payment. What does Northstar do?', opts:[['pay', 'Pay — it’s the fastest way to get the files back'], ['negotiate', 'Negotiate a lower price'], ['refuse', 'Don’t pay — report it to the police / NCSC']]},
      {id:'d3', q:'How do you get the files back?', opts:[['newest', 'Restore the newest backup straight away'], ['tested', 'Restore the newest backup that passed a test restore, once the network is clean'], ['wait', 'Leave the files and hope a free decryptor appears']]},
    ]},
  phishing:{icon:'🎣', title:'Phishing wave', blurb:'Sort 5 emails into phishing and legitimate',
    intro:'Five emails just landed in every staff inbox at once. Mark each one Phishing or Legitimate.',
    items:[
      {id:'e1', mail:['Microsoft 365 <security@micros0ft-support.example>', 'Your password expires TODAY — confirm now', 'Click here within 1 hour to keep access to your mailbox.']},
      {id:'e2', mail:['Facilities <facilities@northstarsystems.example>', 'Fire drill Thursday 10:00', 'No action needed — just leave by the nearest exit when the alarm sounds.']},
      {id:'e3', mail:['Accounts <ap@quick-supplies-ltd.example>', 'Overdue invoice — see attachment', '📎 Invoice_8400.zip — please pay today to avoid late fees.']},
      {id:'e4', mail:['Payroll <payroll@northstarsystems.example>', 'Your November payslip is ready', 'Log in to the staff portal as usual to view it. We never ask for passwords by email.']},
      {id:'e5', mail:['Helen Ward <helen.ward.ceo@gmail.example>', 'Quick favour — confidential', 'I need 10 gift cards for a client today. Don’t tell anyone, I’ll explain later.']},
    ].map(x => ({...x, q:x.mail[1], opts:[['phish', '🎣 Phishing'], ['legit', '✓ Legitimate']]}))},
  ddos:{icon:'🌊', title:'DDoS flood on the staff portal', blurb:'Stop the flood, communicate, spot the hidden twist',
    intro:'The staff portal is drowning in traffic: 40,000 requests a second from 9,000 different addresses. Staff can’t log in.',
    banner:{kind:'graph'},
    items:[
      {id:'d1', q:'How do you stop the flood?', opts:[['block', 'Block the single busiest IP address'], ['protect', 'Switch on the hosting provider’s DDoS protection'], ['shutdown', 'Turn the portal off until tomorrow']]},
      {id:'d2', q:'Staff and customers are asking what’s going on.', opts:[['silent', 'Say nothing until it’s fixed'], ['status', 'Post a short status update and when the next update will be'], ['blame', 'Tell customers it’s a supplier’s fault']]},
      {id:'d3', q:'⚠ While you’re busy, an alert fires: an ADMIN login to the portal from an unknown country.', opts:[['later', 'Probably noise — deal with it after the flood'], ['investigate', 'Investigate the admin login right now'], ['resetall', 'Reset every staff password in the company immediately']]},
    ]},
  usb:{icon:'💾', title:'USB sticks found in the car park', blurb:'Curiosity vs. security: what happens to “found” USBs',
    intro:'A cleaner found six USB sticks in the staff car park, labelled “PAYROLL 2026 — CONFIDENTIAL”. One has already gone missing.',
    banner:{kind:'note', head:'🧷 PAYROLL 2026 — CONFIDENTIAL', body:'6 × 32 GB USB sticks, found by bay 14 at 09:41'},
    items:[
      {id:'d1', q:'What should happen to the sticks?', opts:[['plugin', 'Plug one in to see whose payroll it is'], ['handin', 'Hand them, unplugged, to IT security'], ['bin', 'Throw them in the bin']]},
      {id:'d2', q:'IT security wants to see what’s on them. Where?', opts:[['ownlaptop', 'On the IT manager’s own laptop'], ['sandbox', 'On an isolated “sandbox” machine connected to nothing important'], ['server', 'On the file server, it has the best antivirus']]},
      {id:'d3', q:'You discover someone in Sales already plugged one in an hour ago.', opts:[['ignore', 'Nothing has happened yet, so leave it'], ['isolate', 'Disconnect that PC from the network and report it for checking'], ['reformat', 'Tell them to wipe their PC themselves']]},
    ]},
  vishing:{icon:'📞', title:'Phone call from “IT support”', blurb:'A convincing caller wants an MFA code',
    intro:'Several staff are getting calls from “Dave in IT”. He knows their names and job titles and asks them to read out the code just sent to their phone.',
    banner:{kind:'note', head:'📞 Incoming call · “IT Service Desk”', body:'“Hi, it’s Dave from IT. We’re fixing the outage — I just need the six-digit code we sent you.”'},
    items:[
      {id:'d1', q:'What should staff do?', opts:[['givecode', 'Read out the code — he knew their name, so he’s real'], ['verify', 'Refuse, hang up and call IT back on the number they already know'], ['halfcode', 'Give him half the code to test him']]},
      {id:'d2', q:'Dave says: “If you don’t, your account will be locked in 5 minutes.”', opts:[['comply', 'Better comply — losing access would be worse'], ['pressure', 'Recognise it: urgency is a pressure tactic, not a reason'], ['argue', 'Argue with him until he gives up']]},
      {id:'d3', q:'Afterwards, what should happen?', opts:[['report', 'Report the call to IT security straight away'], ['nobody', 'Say nothing — no harm done'], ['social', 'Post a warning on social media with the caller’s number']]},
    ]},
  dataleak:{icon:'📤', title:'Customer data posted online', blurb:'A leak, the law, and finding the source',
    intro:'A journalist emails: a file on a public paste site lists 2,000 Northstar customer names, emails and phone numbers.',
    banner:{kind:'note', head:'📰 Email from: news desk, Bristol Evening Post', body:'“Can you confirm this is your customer data? We plan to publish at 5pm.”'},
    items:[
      {id:'d1', q:'What do you do first?', opts:[['verify', 'Check a few records against your systems to confirm whether it’s real'], ['emailall', 'Email all 2,000 customers immediately saying you’ve been hacked'], ['ignore', 'Ignore it — it could be fake']]},
      {id:'d2', q:'It’s real personal data. Who must be told, by law?', opts:[['ico', 'The Information Commissioner’s Office, within 72 hours'], ['wait', 'Nobody until you’ve finished investigating next month'], ['ceoonly', 'Only the CEO']]},
      {id:'d3', q:'How do you stop it happening again?', opts:[['source', 'Find and close the source of the leak'], ['resetsilent', 'Reset every customer password and say nothing'], ['takedown', 'Just get the paste site to delete the file']]},
    ]},
  insider:{icon:'🚪', title:'Leaver still has access', blurb:'An ex-employee is still logging in',
    intro:'J. Hart left Northstar last Friday. At 09:20 today their account logged in from home and downloaded the full customer price list.',
    banner:{kind:'note', head:'🔔 Login alert · j.hart', body:'Status in HR: LEFT 21 Nov · Account status: ACTIVE · 3 files downloaded'},
    items:[
      {id:'d1', q:'What do you do right now?', opts:[['disable', 'Disable the account immediately'], ['emailthem', 'Email J. Hart asking why they logged in'], ['waithr', 'Wait for HR to confirm they really left']]},
      {id:'d2', q:'What next?', opts:[['audit', 'Check the logs for everything the account accessed since they left, and keep them as evidence'], ['deletelogs', 'Delete the logs so the leak doesn’t look bad'], ['nothing', 'Nothing — the account is disabled now']]},
      {id:'d3', q:'How do you stop it happening again?', opts:[['process', 'A leaver checklist that removes every account and badge on their last day'], ['everyoneadmin', 'Give managers admin rights so they can remove access themselves'], ['banusb', 'Ban USB sticks']]},
    ]},
  supplychain:{icon:'📦', title:'Poisoned software update', blurb:'A trusted supplier’s update is malicious',
    intro:'The company that makes your warehouse label-printer software announces its latest update was tampered with by attackers. Your PCs are installing it right now.',
    banner:{kind:'note', head:'⚠ SECURITY ADVISORY · LabelPro 7.4.2', body:'“Version 7.4.2 contains malicious code. Do not install it. Clean-up guidance follows.”'},
    items:[
      {id:'d1', q:'The rollout is 40% done. What now?', opts:[['finish', 'Finish the rollout quickly so everyone is on the same version'], ['pause', 'Stop the rollout immediately'], ['disableav', 'Turn off antivirus so the update installs cleanly']]},
      {id:'d2', q:'Which machines are affected?', opts:[['assumenone', 'Assume none — the update only just started'], ['inventory', 'Find exactly which machines already installed 7.4.2'], ['reinstallall', 'Reinstall every computer in the company, just in case']]},
      {id:'d3', q:'How do you clean up?', opts:[['vendor', 'Follow the supplier’s security advisory and install their fixed version'], ['review', 'Leave the supplier a one-star review'], ['ignore', 'Ignore it — it’s their problem, not ours']]},
    ]},
  deepfake:{icon:'🎙️', title:'Deepfake CEO voice note', blurb:'It sounds exactly like the boss',
    intro:'Finance received a WhatsApp voice note that sounds exactly like Helen Ward, the CEO: “Move £25,000 to our new supplier today. It’s confidential — don’t mention it to anyone.”',
    banner:{kind:'note', head:'🎙️ WhatsApp · “Helen Ward” · 0:14', body:'▶ ▂▃▅▇▅▃▂▃▅▇▇▅▃▂▁ “...don’t mention it to anyone.”'},
    items:[
      {id:'d1', q:'What should Finance do?', opts:[['pay', 'Pay — it’s definitely her voice'], ['callback', 'Call Helen back on her known number to check'], ['reply', 'Reply on WhatsApp: “Is this really you?”']]},
      {id:'d2', q:'Which clues matter most?', opts:[['soundsreal', 'It sounds exactly like her, so it’s genuine'], ['flags', 'Unusual channel + urgency + secrecy + money = red flags'], ['cantfake', 'Voice notes can’t be faked, so it’s safe']]},
      {id:'d3', q:'Which rule would stop this in future?', opts:[['twoperson', 'Two people must approve any new payment'], ['payfaster', 'Pay faster so suppliers aren’t kept waiting'], ['whatsapp', 'Allow payment requests by WhatsApp only from the CEO']]},
    ]},
};
export const optionLabel = (type, itemId, value) => LIVE_SCENARIOS[type]?.items.find(i => i.id === itemId)?.opts.find(o => o[0] === value)?.[1] || value;
export const itemLabel = (type, itemId) => LIVE_SCENARIOS[type]?.items.find(i => i.id === itemId)?.q || itemId;
