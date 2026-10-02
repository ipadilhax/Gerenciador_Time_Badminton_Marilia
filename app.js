const STORAGE_KEY="badminton_marilia_v2";
const state=loadState();
let currentView="dashboard",currentTournamentId=null,currentCategoryId=null,modalSaveHandler=null;

function blankState(){return{teams:[],athletes:[],categories:[],tournaments:[]}}
function loadState(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY));return x||blankState()}catch{return blankState()}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderAll()}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,9)}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function dateBR(s){if(!s)return"Data não definida";const d=new Date(s+"T12:00:00");return isNaN(d)?"Data não definida":d.toLocaleDateString("pt-BR")}
function teamOf(id){return state.teams.find(x=>x.id===id)}
function athleteOf(id){return state.athletes.find(x=>x.id===id)}
function categoryOf(id=currentCategoryId){return state.categories.find(x=>x.id===id)}
function categoryTypeLabel(c){return c?.type==="doubles"?"Duplas":"Simples"}
function categoryLabel(c){if(!c)return"Categoria";const type=categoryTypeLabel(c),gender=c.gender||"Gênero não definido",desc=(c.description||"").trim();return desc?`${type} · ${gender} · ${desc}`:`${type} · ${gender}`}
function tournamentOf(id=currentTournamentId){return state.tournaments.find(x=>x.id===id)}
function entryOf(t,c){return t?.entries?.find(x=>x.categoryId===c)}
function notify(msg){const e=document.getElementById("toast");e.textContent=msg;e.classList.add("show");clearTimeout(notify.t);notify.t=setTimeout(()=>e.classList.remove("show"),2800)}
function go(view){currentView=view;document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id==="view-"+view));document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===view));window.scrollTo(0,0)}
function openModal(title,body,handler,eyebrow="CADASTRO"){document.getElementById("modalTitle").textContent=title;document.getElementById("modalEyebrow").textContent=eyebrow;document.getElementById("modalBody").innerHTML=body;modalSaveHandler=handler;document.getElementById("appDialog").showModal()}
document.getElementById("dialogForm").addEventListener("submit",e=>{if(e.submitter?.id==="modalSave"){e.preventDefault();if(modalSaveHandler?.()!==false)document.getElementById("appDialog").close()}})
function field(label,name,value="",type="text",extra=""){return`<div class="field"><label for="${name}">${label}</label><input id="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`}
function selectField(label,name,options,value=""){return`<div class="field"><label for="${name}">${label}</label><select id="${name}">${options.map(o=>`<option value="${esc(o.value)}" ${o.value===value?"selected":""}>${esc(o.label)}</option>`).join("")}</select></div>`}
function empty(title,desc){return`<div class="empty-state"><strong>${title}</strong>${desc}</div>`}

function renderAll(){renderDashboard();renderTournaments();renderCategories();renderTeams();renderAthletes();if(currentTournamentId&&document.getElementById("view-tournament-detail").classList.contains("active"))renderTournamentDetail();if(currentCategoryId&&document.getElementById("view-bracket").classList.contains("active"))renderBracket()}
function renderDashboard(){document.getElementById("statTournaments").textContent=state.tournaments.length;document.getElementById("statCategories").textContent=state.categories.length;document.getElementById("statAthletes").textContent=state.athletes.length;document.getElementById("statTeams").textContent=state.teams.length;document.getElementById("recentTournaments").innerHTML=state.tournaments.length?state.tournaments.slice().reverse().slice(0,4).map(tournamentCard).join(""):empty("Nenhum campeonato cadastrado","Crie seu primeiro campeonato.")}
function tournamentCard(t){return`<article class="tournament-card"><div class="tourney-icon">🏆</div><div class="tourney-info"><h3>${esc(t.name)}</h3><p>${dateBR(t.date)}${t.location?" · "+esc(t.location):""} · ${t.entries?.length||0} categoria(s)</p></div><span class="pill">${esc(t.status||"Em preparação")}</span><div class="tourney-actions"><button class="btn btn-outline" onclick="openTournament('${t.id}')">Abrir campeonato →</button><button class="text-button danger" onclick="deleteTournament('${t.id}')">Excluir</button></div></article>`}
function renderTournaments(){document.getElementById("tournamentList").innerHTML=state.tournaments.length?state.tournaments.slice().reverse().map(tournamentCard).join(""):empty("Nenhum campeonato cadastrado","Use “Novo campeonato”.")}
function renderCategories(){document.getElementById("categoryCount").textContent=state.categories.length;document.getElementById("categoryList").innerHTML=state.categories.length?state.categories.map(c=>`<div class="simple-row"><div class="tourney-icon">▤</div><div class="row-main"><strong class="category-highlight">${esc(categoryTypeLabel(c))}</strong><strong class="category-highlight">${esc(c.gender||"Gênero não definido")}</strong>${c.description?`<strong class="category-highlight">${esc(c.description)}</strong>`:""}<span class="category-legacy-name">${esc(c.name||"")}</span></div><div class="row-actions"><button class="text-button" onclick="editCategory('${c.id}')">Editar</button><button class="text-button danger" onclick="deleteCategory('${c.id}')">Excluir</button></div></div>`).join(""):empty("Nenhuma categoria","Cadastre uma categoria simples ou de duplas.")}
function renderTeams(){document.getElementById("teamCount").textContent=state.teams.length;document.getElementById("teamList").innerHTML=state.teams.length?state.teams.map(t=>`<div class="simple-row"><div class="tourney-icon">⌂</div><div class="row-main"><strong>${esc(t.name)}</strong><span>${esc(t.city)}</span></div><span class="pill">${state.athletes.filter(a=>a.teamId===t.id).length} atleta(s)</span><div class="row-actions"><button class="text-button" onclick="editTeam('${t.id}')">Editar</button><button class="text-button danger" onclick="deleteTeam('${t.id}')">Excluir</button></div></div>`).join(""):empty("Nenhuma equipe cadastrada","Cadastre as equipes antes dos atletas.")}
function renderAthletes(){const q=(document.getElementById("athleteSearch")?.value||"").toLowerCase(),g=document.getElementById("athleteGenderFilter")?.value||"";const list=state.athletes.filter(a=>(a.name+" "+(teamOf(a.teamId)?.name||"")).toLowerCase().includes(q)&&(!g||a.gender===g));document.getElementById("athleteCount").textContent=list.length;document.getElementById("athleteList").innerHTML=list.length?`<table class="data-table"><thead><tr><th>ATLETA</th><th>EQUIPE</th><th>CIDADE</th><th>GÊNERO</th><th>AÇÕES</th></tr></thead><tbody>${list.map(a=>{const t=teamOf(a.teamId);return`<tr><td><span class="avatar">${esc(a.name.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase())}</span><span class="athlete-name">${esc(a.name)}</span></td><td>${esc(t?.name||"Sem equipe")}</td><td>${esc(t?.city||"—")}</td><td>${esc(a.gender)}</td><td><button class="text-button" onclick="editAthlete('${a.id}')">Editar</button><button class="text-button danger" onclick="deleteAthlete('${a.id}')">Excluir</button></td></tr>`}).join("")}</tbody></table>`:empty("Nenhum atleta encontrado","Cadastre atletas e vincule-os a uma equipe.")}

function newTeam(){openModal("Nova equipe",field("Nome da equipe","teamName","","text",'required placeholder="Ex.: Badminton Marília"')+field("Cidade","teamCity","","text",'required placeholder="Ex.: Marília - SP"'),()=>{const n=document.getElementById("teamName").value.trim(),c=document.getElementById("teamCity").value.trim();if(!n||!c){notify("Preencha nome e cidade.");return false}state.teams.push({id:uid(),name:n,city:c});save();notify("Equipe cadastrada.")})}
function editTeam(id){const t=teamOf(id);openModal("Editar equipe",field("Nome da equipe","teamName",t.name,"text","required")+field("Cidade","teamCity",t.city,"text","required"),()=>{t.name=document.getElementById("teamName").value.trim();t.city=document.getElementById("teamCity").value.trim();if(!t.name||!t.city)return false;save();notify("Equipe atualizada.")})}
function deleteTeam(id){if(!confirm("Excluir esta equipe? Os atletas ficarão sem equipe."))return;state.teams=state.teams.filter(t=>t.id!==id);state.athletes.forEach(a=>{if(a.teamId===id)a.teamId=""});save()}
function newAthlete(){if(!state.teams.length){notify("Cadastre uma equipe antes.");return}openModal("Novo atleta",field("Nome completo","athleteName","","text","required")+selectField("Equipe","athleteTeam",state.teams.map(t=>({value:t.id,label:`${t.name} — ${t.city}`})))+selectField("Gênero","athleteGender",[{value:"Masculino",label:"Masculino"},{value:"Feminino",label:"Feminino"}]),()=>{const n=document.getElementById("athleteName").value.trim();if(!n){notify("Informe o nome.");return false}state.athletes.push({id:uid(),name:n,teamId:document.getElementById("athleteTeam").value,gender:document.getElementById("athleteGender").value});save();notify("Atleta cadastrado.")})}
function editAthlete(id){const a=athleteOf(id);openModal("Editar atleta",field("Nome completo","athleteName",a.name,"text","required")+selectField("Equipe","athleteTeam",state.teams.map(t=>({value:t.id,label:`${t.name} — ${t.city}`})),a.teamId)+selectField("Gênero","athleteGender",[{value:"Masculino",label:"Masculino"},{value:"Feminino",label:"Feminino"}],a.gender),()=>{a.name=document.getElementById("athleteName").value.trim();a.teamId=document.getElementById("athleteTeam").value;a.gender=document.getElementById("athleteGender").value;if(!a.name)return false;save();notify("Atleta atualizado.")})}
function deleteAthlete(id){if(!confirm("Excluir este atleta?"))return;state.athletes=state.athletes.filter(a=>a.id!==id);save()}

function newCategory(){openModal("Nova categoria",selectField("Tipo","categoryType",[{value:"single",label:"Simples"},{value:"doubles",label:"Duplas"}])+selectField("Gênero da categoria","categoryGender",[{value:"Masculino",label:"Masculino"},{value:"Feminino",label:"Feminino"},{value:"Mista",label:"Mista"}])+field("Descrição","categoryDesc","","text",'required placeholder="Ex.: Adulto / Sub-19 / Aberto"'),()=>{const d=document.getElementById("categoryDesc").value.trim();if(!d){notify("Informe a descrição da categoria.");return false}state.categories.push({id:uid(),name:d,type:document.getElementById("categoryType").value,gender:document.getElementById("categoryGender").value,description:d});save();notify("Categoria cadastrada.")})}
function editCategory(id){const c=categoryOf(id);openModal("Editar categoria",selectField("Tipo","categoryType",[{value:"single",label:"Simples"},{value:"doubles",label:"Duplas"}],c.type)+selectField("Gênero da categoria","categoryGender",[{value:"Masculino",label:"Masculino"},{value:"Feminino",label:"Feminino"},{value:"Mista",label:"Mista"}],c.gender)+field("Descrição","categoryDesc",c.description||c.name||"","text","required"),()=>{const d=document.getElementById("categoryDesc").value.trim();if(!d){notify("Informe a descrição da categoria.");return false}c.name=d;c.type=document.getElementById("categoryType").value;c.gender=document.getElementById("categoryGender").value;c.description=d;save();notify("Categoria atualizada.")})}
function deleteCategory(id){if(!confirm("Excluir esta categoria?"))return;state.categories=state.categories.filter(c=>c.id!==id);state.tournaments.forEach(t=>t.entries=(t.entries||[]).filter(e=>e.categoryId!==id));save()}

function newTournament(existing=null){openModal(existing?"Editar campeonato":"Novo campeonato",field("Nome do campeonato","tournamentName",existing?.name||"","text","required")+field("Data do campeonato","tournamentDate",existing?.date||"","date","required")+field("Local (opcional)","tournamentLocation",existing?.location||"","text",'placeholder="Ginásio / cidade"'),()=>{const n=document.getElementById("tournamentName").value.trim(),d=document.getElementById("tournamentDate").value;if(!n||!d){notify("Informe nome e data.");return false}if(existing){existing.name=n;existing.date=d;existing.location=document.getElementById("tournamentLocation").value.trim()}else state.tournaments.push({id:uid(),name:n,date:d,location:document.getElementById("tournamentLocation").value.trim(),entries:[],status:"Em preparação"});save();notify(existing?"Campeonato atualizado.":"Campeonato cadastrado.")},"CAMPEONATO")}
function deleteTournament(id){if(!confirm("Excluir o campeonato e todas as chaves dele?"))return;state.tournaments=state.tournaments.filter(t=>t.id!==id);save()}
function openTournament(id){currentTournamentId=id;renderTournamentDetail();go("tournament-detail")}
function renderTournamentDetail(){const t=tournamentOf();document.getElementById("detailTitle").textContent=t.name;document.getElementById("detailMeta").textContent=`${dateBR(t.date)}${t.location?" · "+t.location:""} · ${t.entries?.length||0} categoria(s)`;document.getElementById("tournamentCategories").innerHTML=t.entries?.length?t.entries.map(e=>{const c=categoryOf(e.categoryId);return`<article class="category-card"><h3 class="category-triple"><span>${esc(categoryTypeLabel(c))}</span><span>${esc(c.gender||"Gênero não definido")}</span><span>${esc(c.description||c.name||"Sem descrição")}</span></h3><div class="category-card-footer"><span class="pill">${e.bracket?.participants?.length||0} participante(s)</span><div><button class="text-button" onclick="openBracket('${c.id}')">Abrir chave →</button><button class="text-button danger" onclick="removeTournamentCategory('${c.id}')">Remover</button></div></div></article>`}).join(""):empty("Nenhuma categoria adicionada","Adicione as categorias deste campeonato.")}
function addCategoryToTournament(){const t=tournamentOf(),available=state.categories.filter(c=>!t.entries?.some(e=>e.categoryId===c.id));if(!available.length){notify("Todas as categorias já estão adicionadas.");return}openModal("Adicionar categorias",`<div class="check-list">${available.map(c=>`<label><input type="checkbox" name="catCheck" value="${c.id}"><span><strong>${esc(categoryTypeLabel(c))}</strong> · <strong>${esc(c.gender||"Gênero não definido")}</strong> · <strong>${esc(c.description||c.name||"Sem descrição")}</strong></span></label>`).join("")}</div>`,()=>{const ids=[...document.querySelectorAll("[name=catCheck]:checked")].map(x=>x.value);if(!ids.length){notify("Selecione uma categoria.");return false}t.entries=t.entries||[];ids.forEach(id=>t.entries.push({categoryId:id,bracket:null}));save();renderTournamentDetail();notify("Categoria(s) adicionada(s).")})}
function removeTournamentCategory(id){const t=tournamentOf();if(!confirm("Remover esta categoria do campeonato?"))return;t.entries=t.entries.filter(e=>e.categoryId!==id);save();renderTournamentDetail()}

function openBracket(id){currentCategoryId=id;renderBracket();go("bracket")}
function currentEntry(){return entryOf(tournamentOf(),currentCategoryId)}
function renderBracket(){const t=tournamentOf(),c=categoryOf(),e=currentEntry();if(!t||!c||!e)return;document.getElementById("bracketTitle").textContent=categoryLabel(c);document.getElementById("bracketEyebrow").textContent=t.name.toUpperCase();document.getElementById("bracketMeta").textContent=`${categoryLabel(c)} · ${dateBR(t.date)}${t.location?" · "+t.location:""}`;if(!e.bracket){document.getElementById("bracketWorkspace").hidden=true;document.getElementById("bracketSetup").hidden=false;renderSetup(e,c);return}document.getElementById("bracketSetup").hidden=true;document.getElementById("bracketWorkspace").hidden=false;renderBracketContent()}

function eligible(a,c){return c.gender==="Mista"||a.gender===c.gender}
function participantName(p){return p?.name||"A definir"}
function participantTeam(p){return p?.team||""}
function teamSet(p){return new Set((p?.teamIds||[]).filter(Boolean))}
function participantsConflict(a,b){if(!a||!b)return false;const A=teamSet(a),B=teamSet(b);for(const x of A)if(B.has(x))return true;return false}
function makeParticipantFromAthlete(a){const t=teamOf(a.teamId);return{id:"p_"+a.id,kind:"single",athleteIds:[a.id],name:a.name,team:t?.name||"Sem equipe",teamIds:a.teamId?[a.teamId]:[],gender:a.gender}}
function makePair(a,b){const ta=teamOf(a.teamId),tb=teamOf(b.teamId);return{id:"p_"+uid(),kind:"pair",athleteIds:[a.id,b.id],name:`${a.name} / ${b.name}`,team:`${ta?.name||"Sem equipe"} / ${tb?.name||"Sem equipe"}`,teamIds:[a.teamId,b.teamId].filter(Boolean),gender:"Mista"}}

function renderSetup(e,c){const root=document.getElementById("bracketSetup");const selected=e.selectedParticipants||[];let participantsHTML="";
if(c.type==="single"){const ids=new Set(selected.map(p=>p.athleteIds?.[0]));const athletes=state.athletes.filter(a=>eligible(a,c)).sort((a,b)=>a.name.localeCompare(b.name));participantsHTML=`<input id="participantSearch" class="search-input" style="max-width:none;margin-bottom:9px" placeholder="Filtrar por nome ou equipe…"><div class="participant-box" id="participantList">${athletes.length?athletes.map(a=>{const t=teamOf(a.teamId);return`<label class="participant-row" data-search="${esc((a.name+" "+(t?.name||"")).toLowerCase())}"><input type="checkbox" name="singleParticipant" value="${a.id}" ${ids.has(a.id)?"checked":""}><span class="row-main"><strong>${esc(a.name)}</strong><span>${esc(t?.name||"Sem equipe")} · ${esc(a.gender)}</span></span></label>`}).join(""):empty("Nenhum atleta elegível","Cadastre atletas do gênero da categoria.")}</div>`}
else participantsHTML=pairBuilderHTML(e,c);
root.innerHTML=`<h2>Configurar chaveamento</h2><p>${c.type==="doubles"?"Monte cada dupla com exatamente dois atletas. Duplas femininas usam duas mulheres, masculinas dois homens e mistas um homem + uma mulher. Os atletas podem ser de equipes diferentes.":"Selecione os atletas participantes desta categoria."}</p><div class="setup-grid"><div class="field"><label>Formato do chaveamento</label><div class="radio-cards format-cards"><label class="radio-card format-card"><input type="radio" name="format" value="auto" checked><span class="format-icon">⚡</span><span class="format-copy"><strong>Automático</strong><small>Até 16: mata-mata. Acima de 16: grupos + mata-mata.</small></span><span class="format-check">✓</span></label><label class="radio-card format-card"><input type="radio" name="format" value="knockout"><span class="format-icon">🏆</span><span class="format-copy"><strong>Mata-mata direto</strong><small>Confrontos eliminatórios desde a primeira rodada.</small></span><span class="format-check">✓</span></label><label class="radio-card format-card"><input type="radio" name="format" value="groups"><span class="format-icon">▦</span><span class="format-copy"><strong>Grupos + mata-mata</strong><small>Primeiro todos jogam no grupo; depois vem a fase eliminatória.</small></span><span class="format-check">✓</span></label></div></div><div class="field"><label>Terceiro lugar</label><div class="radio-cards format-cards third-format-cards"><label class="radio-card format-card third-format-card"><input type="radio" name="thirdRule" value="match" checked><span class="format-icon">🥉</span><span class="format-copy"><strong>Disputa de 3º lugar</strong><small>Os dois perdedores das semifinais jogam para definir o terceiro colocado.</small></span><span class="format-check">✓</span></label><label class="radio-card format-card third-format-card"><input type="radio" name="thirdRule" value="both"><span class="format-icon">🏅</span><span class="format-copy"><strong>Dois terceiros lugares</strong><small>Não há partida extra; os dois perdedores das semifinais ficam em 3º.</small></span><span class="format-check">✓</span></label></div><div class="hint">O sorteio tenta deixar atletas da mesma equipe o mais distante possível, evitando o primeiro confronto sempre que a quantidade de participantes permitir.</div></div><div class="field full"><label>${c.type==="doubles"?"Duplas participantes":"Atletas participantes"}</label>${participantsHTML}<small id="selectedCount"></small></div></div><div class="setup-actions"><button class="btn btn-primary" id="drawBracketBtn">🎲 Sortear e gerar chave</button></div>`;
if(c.type==="single"){document.getElementById("participantSearch").addEventListener("input",function(){const q=this.value.toLowerCase();document.querySelectorAll(".participant-row").forEach(r=>r.hidden=!r.dataset.search.includes(q))});document.querySelectorAll("[name=singleParticipant]").forEach(x=>x.addEventListener("change",updateSelectedCount))}
else wirePairBuilder();
document.getElementById("drawBracketBtn").onclick=()=>createBracket(e,c)}
function updateSelectedCount(){const n=document.querySelectorAll("[name=singleParticipant]:checked").length;document.getElementById("selectedCount").textContent=`${n} atleta(s) selecionado(s)`}

function pairBuilderHTML(e,c){const pairs=e.selectedParticipants||[];const used=pairs.flatMap(p=>p.athleteIds||[]);const eligibleAthletes=state.athletes.filter(a=>eligible(a,c));const opts=eligibleAthletes.map(a=>`<option value="${a.id}">${esc(a.name)} — ${esc(teamOf(a.teamId)?.name||"Sem equipe")}</option>`).join("");return`<div class="pair-builder"><div class="pair-builder-grid"><div class="field"><label>Atleta 1</label><select id="pairA"><option value="">Selecione…</option>${opts}</select></div><div class="field"><label>Atleta 2</label><select id="pairB"><option value="">Selecione…</option>${opts}</select></div><button type="button" class="btn btn-outline" id="addPairBtn">＋ Adicionar dupla</button></div><div class="hint">${c.gender==="Mista"?"Dupla mista: 1 masculino + 1 feminino.":"Dupla "+c.gender.toLowerCase()+": os dois atletas devem ser "+c.gender.toLowerCase()+"."} Os dois podem ser de equipes diferentes.</div><div class="pair-list" id="pairList">${pairs.length?pairs.map((p,i)=>`<div class="pair-row"><div><strong>${esc(p.name)}</strong><small>${esc(p.team)}</small></div><button type="button" class="text-button danger" data-remove-pair="${i}">Remover</button></div>`).join(""):empty("Nenhuma dupla montada","Adicione duas pessoas por vez.")}</div></div>`}
function wirePairBuilder(){document.getElementById("addPairBtn").onclick=addPair;document.querySelectorAll("[data-remove-pair]").forEach(b=>b.onclick=()=>{const e=currentEntry();e.selectedParticipants.splice(Number(b.dataset.removePair),1);renderSetup(e,categoryOf())})}
function addPair(){const c=categoryOf(),e=currentEntry(),a=athleteOf(document.getElementById("pairA").value),b=athleteOf(document.getElementById("pairB").value);if(!a||!b){notify("Selecione os dois atletas.");return}if(a.id===b.id){notify("Uma dupla precisa de dois atletas diferentes.");return}if((e.selectedParticipants||[]).some(p=>(p.athleteIds||[]).includes(a.id)||(p.athleteIds||[]).includes(b.id))){notify("Um atleta não pode estar em duas duplas nesta categoria.");return}if(c.gender==="Mista"&&a.gender===b.gender){notify("A dupla mista precisa de um homem e uma mulher.");return}if(c.gender!=="Mista"&&(a.gender!==c.gender||b.gender!==c.gender)){notify("Os dois atletas precisam ser do gênero da categoria.");return}e.selectedParticipants=e.selectedParticipants||[];e.selectedParticipants.push(makePair(a,b));renderSetup(e,c);notify("Dupla adicionada.")}
function createBracket(e,c){
  try{
    if(!e||!c){notify("Não foi possível identificar a categoria do chaveamento.");return}
    let participants=[];
    if(c.type==="single"){
      const ids=[...document.querySelectorAll('[name="singleParticipant"]:checked')].map(x=>x.value).filter(Boolean);
      participants=ids.map(athleteOf).filter(Boolean).map(makeParticipantFromAthlete);
    }else{
      participants=(e.selectedParticipants||[]).filter(p=>p&&Array.isArray(p.athleteIds)&&p.athleteIds.length===2);
    }
    if(participants.length<2){notify(c.type==="doubles"?"Monte pelo menos duas duplas antes de sortear.":"Selecione pelo menos dois atletas antes de sortear.");return}
    const format=document.querySelector('[name="format"]:checked')?.value||"auto";
    const actual=format==="auto"?(participants.length>16?"groups":"knockout"):format;
    if(actual==="knockout"&&participants.length>16){notify("Mata-mata direto comporta no máximo 16 participantes.");return}
    if(actual==="groups"&&participants.length<3){notify("Para grupos, use pelo menos 3 participantes.");return}
    const third=document.querySelector('[name="thirdRule"]:checked')?.value||"match";
    const bracket=actual==="groups"?buildGroups(participants,third):buildKnockout(participants,third);
    if(!bracket||!Array.isArray(bracket.rounds)&&actual==="knockout")throw new Error("estrutura de chave inválida");
    e.selectedParticipants=participants;
    e.bracket=bracket;
    e.bracket.originalFormat=format;
    e.bracket.createdAt=new Date().toISOString();
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    renderBracket();
    notify("✓ Chave sorteada com sucesso!");
  }catch(err){
    console.error("Erro ao gerar chaveamento:",err);
    notify("Erro ao sortear: "+(err?.message||"verifique os participantes."));
  }
}
function randomShuffle(a){const x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function arrangementScore(order){let score=0;const n=order.length;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(participantsConflict(order[i],order[j])){const d=j-i;score+=d===1?10000:d<=2?1200:d<=4?250:d<=8?50:5}return score}
function firstRoundPairings(parts){
  const rest=parts.slice();
  const pairs=[];
  while(rest.length){
    rest.sort((a,b)=>teamSet(b).size-teamSet(a).size);
    const a=rest.shift();
    let idx=rest.findIndex(x=>!participantsConflict(a,x));
    if(idx<0)idx=0;
    const b=rest.splice(idx,1)[0];
    pairs.push([a,b]);
  }
  return pairs;
}
function bestArrangement(parts){
  const n=parts.length;
  if(n<=2)return parts.slice();
  const pairs=firstRoundPairings(parts);
  let best=null,bestScore=Infinity;
  const tries=Math.min(4000,Math.max(400,n*180));
  for(let i=0;i<tries;i++){
    const order=randomShuffle(pairs).flatMap(pair=>Math.random()<.5?[pair[0],pair[1]]:[pair[1],pair[0]]);
    const s=arrangementScore(order);
    if(s<bestScore){bestScore=s;best=order;if(s===0)break}
  }
  return best||pairs.flat();
}
function makeMatch(a=null,b=null){return{id:uid(),slots:[a,b],scores:["",""],winner:null,played:false}}
function autoByes(round){round.forEach(m=>{const a=!!m.slots[0],b=!!m.slots[1];if(a&&!b){m.winner=0;m.played=true}else if(!a&&b){m.winner=1;m.played=true}})}
function buildKnockout(parts,third){
  if(!Array.isArray(parts)||parts.length<2)return null;
  let size=2;while(size<parts.length)size*=2;
  const ordered=bestArrangement(parts),slots=Array(size).fill(null);
  ordered.forEach((p,i)=>slots[i]=p);
  const rounds=[];let current=slots;
  while(current.length>=2){
    const matches=[];
    for(let i=0;i<current.length;i+=2)matches.push(makeMatch(current[i],current[i+1]));
    rounds.push(matches);current=Array(matches.length).fill(null);
  }
  autoByes(rounds[0]);
  const b={format:"knockout",thirdRule:third,participants:ordered,rounds,thirdMatch:third==="match"?makeMatch():null};
  propagate(b);
  return b;
}
function buildGroups(parts,third){
  if(!Array.isArray(parts)||parts.length<3)return null;
  const ordered=bestArrangement(parts),count=Math.ceil(ordered.length/4),groups=Array.from({length:count},(_,i)=>({name:String.fromCharCode(65+i),participants:[],matches:[]}));
  ordered.forEach((p,i)=>groups[i%count].participants.push(p.id));
  groups.forEach(g=>{for(let i=0;i<g.participants.length;i++)for(let j=i+1;j<g.participants.length;j++)g.matches.push({id:uid(),a:g.participants[i],b:g.participants[j],scores:["",""],winner:null,played:false})});
  return{format:"groups",thirdRule:third,participants:ordered,groups,qualifiersPerGroup:2,rounds:[],thirdMatch:third==="match"?makeMatch():null,knockoutStarted:false};
}
function findParticipant(b,id){return b.participants.find(p=>p.id===id)}
function matchWinner(m){if(m.winner===0||m.winner===1)return m.winner;return null}
function findMatch(b,id){for(const r of b.rounds||[]){const m=r.find(x=>x.id===id);if(m)return m}if(b.thirdMatch?.id===id)return b.thirdMatch;return null}
function propagate(b){for(let r=1;r<b.rounds.length;r++){b.rounds[r].forEach((m,i)=>{const a=b.rounds[r-1][i*2],bb=b.rounds[r-1][i*2+1];m.slots[0]=a&&matchWinner(a)!==null?a.slots[matchWinner(a)]:null;m.slots[1]=bb&&matchWinner(bb)!==null?bb.slots[matchWinner(bb)]:null;if(m.slots[0]&&m.slots[1]){if(m.winner!==0&&m.winner!==1){m.played=false;m.scores=["",""]}}else if(m.slots[0]||m.slots[1]){m.winner=m.slots[0]?0:1;m.played=true;m.scores=["",""]}else{m.winner=null;m.played=false;m.scores=["",""]}})}if(b.thirdMatch&&b.rounds.length>=2){const s=b.rounds[b.rounds.length-2];if(s.length===2)b.thirdMatch.slots=[s[0].winner!==null?s[0].slots[1-s[0].winner]:null,s[1].winner!==null?s[1].slots[1-s[1].winner]:null]}}
function roundName(n,i){if(i===n-1)return"Final";if(i===n-2)return"Semifinais";if(i===n-3)return"Quartas de final";return`Rodada ${i+1}`}
function slotHTML(p,match,i){
  if(!p)return`<div class="match-player bye"><div class="player-text">A definir</div><span class="print-score">—</span></div>`;
  const winner=match.winner===i;
  const score=match.scores?.[i]??"";
  return`<div class="match-player ${winner?"winner":""}"><div class="player-text">${esc(participantName(p))}<span class="player-team">${esc(participantTeam(p))}</span></div><input type="number" min="0" max="99" value="${esc(score)}" data-score-match="${match.id}" data-score-index="${i}"><span class="print-score">${score===""?"—":esc(score)}</span></div>`
}
function matchHTML(m,label,layout={}){
  const a=m.slots[0],b=m.slots[1],done=m.winner===0||m.winner===1;
  const style=layout.gridStart?`style="grid-row:${layout.gridStart} / span ${layout.gridSpan}"`:"";
  const connectorClass=`connector-${layout.side||"none"} connector-round-${layout.roundIndex??0} connector-match-${layout.matchIndex??0} connector-total-${layout.totalMatches??1}`;
  const incoming=(layout.roundIndex??0)>0?`<i class="connector-in" aria-hidden="true"></i>`:"";
  const outgoing=(layout.roundIndex??0)<(layout.totalRounds??1)-1?`<i class="connector-out" aria-hidden="true"></i>`:"";
  return`<div class="match-wrap ${connectorClass}" ${style}>${incoming}${outgoing}<i class="connector-vertical" aria-hidden="true"></i><div class="match-card ${done?"done":""}"><div class="match-card-header"><span>${esc(label)}</span><span>${done?"FINALIZADO":"JOGO"}</span></div>${slotHTML(a,m,0)}${slotHTML(b,m,1)}<div class="match-card-footer"><select data-winner="${m.id}"><option value="">Vencedor…</option>${a?`<option value="0" ${m.winner===0?"selected":""}>${esc(participantName(a))}</option>`:""}${b?`<option value="1" ${m.winner===1?"selected":""}>${esc(participantName(b))}</option>`:""}</select><button data-save-match="${m.id}">Salvar</button></div></div></div>`
}
function groupParticipant(b,id){return findParticipant(b,id)}
function groupMatchHTML(b,m){const a=groupParticipant(b,m.a),bb=groupParticipant(b,m.b);return`<div class="group-match"><div class="match-line"><label><span>${esc(participantName(a))}</span></label><input class="score-input" type="number" min="0" data-group-score="${m.id}" data-score-index="0" value="${esc(m.scores[0])}"></div><div class="match-line"><label><span>${esc(participantName(bb))}</span></label><input class="score-input" type="number" min="0" data-group-score="${m.id}" data-score-index="1" value="${esc(m.scores[1])}"></div><div class="match-save"><button class="text-button" data-save-group="${m.id}">Salvar jogo</button></div></div>`}
function renderBracketContent(){const e=currentEntry(),b=e.bracket,t=tournamentOf(),c=categoryOf();propagate(b);const logo="logo_transparente.png";let html=`<div class="print-header"><img src="${logo}" alt="Badminton Marília"><div><h1>${esc(t.name)}</h1><p>${esc(categoryLabel(c))} · ${dateBR(t.date)}${t.location?" · "+esc(t.location):""}</p><p class="good-game">Que todos tenham um bom jogo!</p></div></div>`;if(b.format==="groups")html+=renderGroups(b);else html+=renderKnockout(b);document.getElementById("bracketContent").innerHTML=html;wireBracketEvents()}
function renderGroups(b){let html=`<section class="bracket-section"><h2>Fase de grupos</h2><div class="groups-grid">`;b.groups.forEach(g=>{html+=`<article class="group-card"><h3>Grupo ${g.name}</h3><div class="group-participants">${g.participants.map(id=>`<div>• ${esc(participantName(groupParticipant(b,id)))}</div>`).join("")}</div>${g.matches.map(m=>groupMatchHTML(b,m)).join("")}</article>`});html+=`</div><div style="margin-top:15px;display:flex;justify-content:flex-end"><button class="btn btn-primary" id="advanceGroupsBtn">Classificar e gerar mata-mata →</button></div></section>`;if(b.knockoutStarted)html+=renderKnockout(b);return html}
function renderKnockout(b){
  const rounds=b.rounds||[];
  if(!rounds.length)return '<div class="empty-state"><strong>Chave ainda não disponível</strong>Gere o sorteio novamente.</div>';
  const final=rounds[rounds.length-1]?.[0]||null;
  let html="";
  if(final?.winner!==null&&final?.winner!==undefined)html+=`<div class="champion-banner"><span>🏆 CAMPEÃO</span><strong>${esc(participantName(final.slots[final.winner]))}</strong></div>`;
  if(b.thirdRule==="both"&&rounds.length>=2){const s=rounds[rounds.length-2];if(s.length>=2&&s.every(x=>x.winner!==null))html+=`<div class="third-place-banner"><strong>3º lugar:</strong>${esc(participantName(s[0].slots[1-s[0].winner]))} e ${esc(participantName(s[1].slots[1-s[1].winner]))}</div>`}
  const sideRounds=rounds.slice(0,-1);
  const half=(sideRounds[0]?.length||0)/2;
  html+=`<section class="bracket-section"><div class="bracket-section-title"><div><h2>Chave eliminatória</h2><p>Os atletas da mesma equipe são distribuídos para ficar o mais distante possível, principalmente na primeira rodada.</p></div><span class="bracket-badge">${b.participants.length} participantes</span></div><div class="bracket-board knockout-board"><div class="bracket-layout ${sideRounds.length?'':'single-final'}" style="--side-rounds:${Math.max(1,sideRounds.length)}">`;
  html+=renderBracketSide(sideRounds,'left',half);
  html+=`<div class="bracket-final"><div class="round-title">${roundName(rounds.length,rounds.length-1)}</div><div class="final-match">${matchHTML(final,"Final")}</div></div>`;
  html+=renderBracketSide(sideRounds,'right',half);
  html+=`</div>`;
  if(b.thirdRule==="match"&&b.thirdMatch)html+=`<div class="third-card"><div class="round-title">Disputa de 3º lugar</div>${matchHTML(b.thirdMatch,"3º lugar")}</div>`;
  html+=`</div></section>`;
  return html;
}
function renderBracketSide(rounds,side,half){
  if(!rounds.length)return `<div class="bracket-side bracket-${side} empty-side"></div>`;
  const firstCount=rounds[0]?.length||1;
  return `<div class="bracket-side bracket-${side}" style="--first-count:${firstCount}">${rounds.map((r,ri)=>{
    const all=r;
    const halfIndex=Math.ceil(all.length/2);
    const matches=side==='left'?all.slice(0,halfIndex):all.slice(halfIndex).reverse();
    const span=Math.max(1,firstCount/Math.max(1,matches.length));
    return `<div class="round-column"><div class="round-title">${roundName(rounds.length+1,ri)}</div><div class="round-matches" style="--round-span:${span}">${matches.map((m,mi)=>matchHTML(m,`Jogo ${mi+1}`,{gridStart:1+mi*span,gridSpan:span,side,roundIndex:ri,matchIndex:mi,totalMatches:matches.length,totalRounds:rounds.length})).join('')}</div></div>`
  }).join('')}</div>`;
}
function wireBracketEvents(){document.querySelectorAll("[data-save-match]").forEach(btn=>btn.onclick=()=>saveMatch(btn.dataset.saveMatch));document.querySelectorAll("[data-score-match]").forEach(inp=>inp.addEventListener("change",()=>{const m=findMatch(currentEntry().bracket,inp.dataset.scoreMatch);if(m)m.scores[Number(inp.dataset.scoreIndex)]=inp.value}));document.querySelectorAll("[data-winner]").forEach(sel=>sel.addEventListener("change",()=>{const m=findMatch(currentEntry().bracket,sel.dataset.winner);if(m)m.pendingWinner=sel.value===""?null:Number(sel.value)}));document.querySelectorAll("[data-group-score]").forEach(inp=>inp.addEventListener("change",()=>{const b=currentEntry().bracket,m=b.groups.flatMap(g=>g.matches).find(x=>x.id===inp.dataset.groupScore);if(m)m.scores[Number(inp.dataset.scoreIndex)]=inp.value}));document.querySelectorAll("[data-save-group]").forEach(btn=>btn.onclick=()=>saveGroupMatch(btn.dataset.saveGroup));const adv=document.getElementById("advanceGroupsBtn");if(adv)adv.onclick=advanceGroups}
function saveMatch(id){const b=currentEntry().bracket,m=findMatch(b,id);if(!m)return;if(!m.slots[0]||!m.slots[1]){notify("Esta partida ainda não tem dois participantes.");return}const inputs=[...document.querySelectorAll(`[data-score-match="${id}"]`)];m.scores=inputs.map(x=>x.value);let w=m.pendingWinner;if(w!==0&&w!==1&&m.scores[0]!==""&&m.scores[1]!==""&&Number(m.scores[0])!==Number(m.scores[1]))w=Number(m.scores[0])>Number(m.scores[1])?0:1;if(w!==0&&w!==1){notify("Informe os placares e selecione o vencedor.");return}m.winner=w;m.played=true;m.pendingWinner=null;propagate(b);save();renderBracketContent();notify("Resultado salvo e chave avançada.")}
function saveGroupMatch(id){const b=currentEntry().bracket,m=b.groups.flatMap(g=>g.matches).find(x=>x.id===id);if(!m)return;if(m.scores[0]===""||m.scores[1]===""||Number(m.scores[0])===Number(m.scores[1])){notify("Informe dois placares diferentes.");return}m.winner=Number(m.scores[0])>Number(m.scores[1])?0:1;m.played=true;save();renderBracketContent();notify("Resultado salvo.")}
function advanceGroups(){const b=currentEntry().bracket;for(const g of b.groups)if(g.matches.some(m=>!m.played)){notify("Finalize todos os jogos dos grupos.");return}const standings=b.groups.map(g=>{const rows=g.participants.map(id=>({id,wins:0,points:0,against:0}));g.matches.forEach(m=>{const a=rows.find(x=>x.id===m.a),bb=rows.find(x=>x.id===m.b);const s0=Number(m.scores[0]),s1=Number(m.scores[1]);a.points+=s0;a.against+=s1;bb.points+=s1;bb.against+=s0;if(m.winner===0)a.wins++;else bb.wins++});return rows.sort((x,y)=>y.wins-x.wins||(y.points-y.against)-(x.points-x.against)||y.points-x.points)});const q=standings.flatMap(x=>x.slice(0,b.qualifiersPerGroup).map(r=>findParticipant(b,r.id)));if(q.length<2){notify("Classificados insuficientes.");return}const k=buildKnockout(q,b.thirdRule);b.participants=q;b.rounds=k.rounds;b.thirdMatch=k.thirdMatch;b.knockoutStarted=true;save();renderBracketContent();notify("Mata-mata criado com os classificados.")}
function editParticipants(){const e=currentEntry();if(!confirm("Refazer a chave apagará os resultados atuais desta categoria. Continuar?"))return;e.bracket=null;save();renderBracket()}
function printBracket(){window.print()}
function exportJSON(){const data=JSON.stringify(state,null,2),blob=new Blob([data],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`backup-badminton-marilia-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);notify("Backup JSON exportado.")}
function importJSON(file){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.teams||!d.athletes||!d.categories||!d.tournaments)throw 0;if(!confirm("Importar substituirá os dados atuais. Continuar?"))return;state.teams=d.teams;state.athletes=d.athletes;state.categories=d.categories;state.tournaments=d.tournaments;save();go("dashboard");notify("Backup importado.")}catch{notify("JSON inválido ou incompatível.")}};r.readAsText(file)}

const menuToggle=document.getElementById("menuToggle"),sidebar=document.querySelector(".sidebar"),sidebarOverlay=document.getElementById("sidebarOverlay");
function closeMobileMenu(){sidebar?.classList.remove("open");sidebarOverlay?.classList.remove("show");menuToggle?.setAttribute("aria-expanded","false")}
function toggleMobileMenu(){const open=!sidebar?.classList.contains("open");sidebar?.classList.toggle("open",open);sidebarOverlay?.classList.toggle("show",open);menuToggle?.setAttribute("aria-expanded",String(open))}
menuToggle?.addEventListener("click",toggleMobileMenu);sidebarOverlay?.addEventListener("click",closeMobileMenu);
document.querySelectorAll(".nav-item").forEach(x=>x.addEventListener("click",()=>{go(x.dataset.view);closeMobileMenu()}));document.querySelectorAll("[data-goto]").forEach(x=>x.addEventListener("click",()=>go(x.dataset.goto)));
document.getElementById("newTournamentBtn").onclick=()=>newTournament();document.getElementById("newTournamentShortcut").onclick=()=>newTournament();document.getElementById("newCategoryBtn").onclick=newCategory;document.getElementById("newTeamBtn").onclick=newTeam;document.getElementById("newAthleteBtn").onclick=newAthlete;document.getElementById("addCategoryToTournament").onclick=addCategoryToTournament;document.getElementById("backTournaments").onclick=()=>go("tournaments");document.getElementById("backTournamentDetail").onclick=()=>{renderTournamentDetail();go("tournament-detail")};document.getElementById("editTournamentDetail").onclick=()=>newTournament(tournamentOf());document.getElementById("printBracketBtn").onclick=printBracket;document.getElementById("updatePrintBtn").onclick=printBracket;document.getElementById("editParticipantsBtn").onclick=editParticipants;document.getElementById("resetBracketBtn").onclick=editParticipants;document.getElementById("exportBtn").onclick=exportJSON;document.getElementById("importBtn").onclick=()=>document.getElementById("importFile").click();document.getElementById("importFile").onchange=e=>{if(e.target.files[0])importJSON(e.target.files[0]);e.target.value=""};document.getElementById("athleteSearch").addEventListener("input",renderAthletes);document.getElementById("athleteGenderFilter").addEventListener("change",renderAthletes);
renderAll();
