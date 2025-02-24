let activeWeapons = []; // Contains ModdedWeapon objects
let selectedWeaponIndex = -1;
let colorNum = 0;

let globalWeaponMods;
let damageMods;

// Inputs
let deleteButton = document.getElementById('input_delete');
let followGlobalCheckbox = document.getElementById('input_followGlobal');
let magSelect = document.getElementById('input_mag');
let stockSelect = document.getElementById('input_stock');
let boltSelect = document.getElementById('input_bolt');
let tacReloadCheckbox = document.getElementById('input_tacReload');
let hopUpSelect = document.getElementById('input_hopUp');

// Misc
let awmHeader = document.getElementById('awmHeader');
let awmContent = document.getElementById('awmContent');
let awmMagDiv = document.getElementById('awmMagDiv');
let awmStockDiv = document.getElementById('awmStockDiv');
let awmBoltDiv = document.getElementById('awmBoltDiv');
let awmTacReloadDiv = document.getElementById('awmTacReloadDiv');
let awmHopUpDiv = document.getElementById('awmHopUpDiv');

// Weapon handling
function validate_index() {
	if(selectedWeaponIndex < 0) {
		console.warn('No weapon selected, this input should not be visible!');
		return false;
	}
	else if(selectedWeaponIndex >= activeWeapons.length) {
		console.warn('Weapon index out of range! ' + selectedWeaponIndex);
		return false;
	}
	
	return true;
}

function disable_element(element) {
	element.disabled = true;
	element.classList.add('inactive');
	
	const children = element.getElementsByTagName('*');
	for(let childIndex = 0; childIndex < children.length; ++childIndex) {
		let child = children[childIndex];
		child.disabled = true;
		child.classList.add('inactive');
	}
}

function enable_element(element) {
	element.disabled = false;
	element.classList.remove('inactive');
	
	const children = element.getElementsByTagName('*');
	for(let childIndex = 0; childIndex < children.length; ++childIndex) {
		let child = children[childIndex];
		child.disabled = false;
		child.classList.remove('inactive');
	}
}

function sw_follow_global(follow) {
	if(!validate_index()) { return; }
	
	let selectedWeapon = activeWeapons[selectedWeaponIndex];
	selectedWeapon.weaponMods.followGlobal = follow;
	
	if(selectedWeapon.weaponMods.followGlobal) {
		magSelect.value = selectedWeapon.weaponMods.magRarity = globalWeaponMods.magRarity;
		stockSelect.value = selectedWeapon.weaponMods.stockRarity = globalWeaponMods.stockRarity;
		boltSelect.value = selectedWeapon.weaponMods.boltRarity = globalWeaponMods.boltRarity;
		tacReloadCheckbox.checked = selectedWeapon.weaponMods.tacReload = globalWeaponMods.tacReload;
	}
	
	followGlobalCheckbox.checked = follow;
	
	if(follow) {
		disable_element(awmMagDiv); disable_element(awmStockDiv);
		disable_element(awmBoltDiv); disable_element(awmTacReloadDiv);
	} else {
		enable_element(awmMagDiv); enable_element(awmStockDiv);
		enable_element(awmBoltDiv); enable_element(awmTacReloadDiv);
	}
}

function add_weapon(weaponIndex) {
	if(weaponIndex >= weapons_S24.length) {
		console.warn('weaponIndex (' + weaponIndex + 'outside list (' + weapons_S24.length + ')');
		return;
	}
	
	let weapon = weapons_S24[weaponIndex];
	let activeIndex = activeWeapons.length;
	
	activeWeapons.push(new ModdedWeapon(weapon, globalWeaponMods, colorNum++));
	refresh_chart();
	
	let activeWeapon = activeWeapons[activeIndex];
	let html = '<button class=\'weaponBtn\' style=\'--borderClr: ' + activeWeapon.color + ';\' id=activeWeapon' + activeIndex + '  onclick=select_weapon(' + activeIndex + ')>';
	html +=			'<img class=\'weaponImg\' src=\'res/icons/' + weapon.name + '.svg\'/>';
	html +=			'<p class=\'weaponTxt\'>' + weapon.name + '</p>';
	html +=		'</button>\n';
	
	activeWeaponDiv.innerHTML += html;
	select_weapon(activeIndex);
}

function select_weapon(activeIndex) {
	if(activeIndex >= activeWeapons.length) {
		console.warn('activeIndex (' + activeIndex + 'outside list (' + activeWeapons.length + ')');
	} else if(activeIndex == selectedWeaponIndex) {
		for(let aIndex = 0; aIndex < activeWeapons.length; ++aIndex) {
			aButton = document.getElementById('activeWeapon' + aIndex);
			aButton.classList.remove('weaponSelected');
		}
		
		selectedWeaponIndex = -1;
		awmDiv.style.display = 'none';
	} else {
		selectedWeaponIndex = activeIndex;
		sw_follow_global(activeWeapons[selectedWeaponIndex].weaponMods.followGlobal);
		
		let activeWeapon = activeWeapons[activeIndex];
		let attachmentComp = activeWeapon.weapon.compatibleAttachments;
		let hopUpComp = activeWeapon.weapon.compatibleHopUps;
		
		hopUpSelect.value = activeWeapon.weaponMods.hopUp;
		
		awmHeader.innerHTML = activeWeapon.get_name() + ' Modifications';
		awmHeader.style.backgroundColor = activeWeapon.color;
		awmContent.style.borderColor = activeWeapon.color;
		
		awmMagDiv.style.display = (attachmentComp & Attachment.MAG) ? 'initial' : 'none';
		awmStockDiv.style.display = (attachmentComp & Attachment.STOCK) ? 'initial' : 'none';
		awmBoltDiv.style.display = (attachmentComp & Attachment.BOLT) ? 'initial' : 'none';
		awmHopUpDiv.style.display = (hopUpComp) ? 'initial' : 'none';
		
		for(let hopUpIndex = 0; hopUpIndex < HopUp.COUNT; ++hopUpIndex) {
			let hopUpFlag = 1 << hopUpIndex;
			let hopUpEntry = document.getElementById('input_hopUp' + hopUpFlag);
			
			hopUpEntry.style.display = (hopUpComp & hopUpFlag) ? 'initial' : 'none';
		}
		
		for(let aIndex = 0; aIndex < activeWeapons.length; ++aIndex) {
			aButton = document.getElementById('activeWeapon' + aIndex);
			if(aIndex == selectedWeaponIndex) {	aButton.classList.add('weaponSelected'); }
			else { aButton.classList.remove('weaponSelected'); }
		}
		
		awmDiv.style.display = 'initial';
	}
}

function unselect_weapon() {
	select_weapon(selectedWeaponIndex);
}

function remove_weapon(activeIndex) {
	if(activeIndex >= activeWeapons.length) {
		console.warn('activeIndex (' + activeIndex + 'outside list (' + activeWeapons.length + ')');
		return;
	}
	
	// Clear selected weapon
	selectedWeaponIndex = -1;
	awmDiv.style.display = 'none';
	
	// Remove button from html
	let weaponBtn = document.getElementById('activeWeapon' + activeIndex);
	weaponBtn.remove();
	
	// Decrement remaining buttons with id above removed id
	for(let aIndex = (activeIndex + 1); aIndex < activeWeapons.length; ++aIndex) {
		let otherBtn = document.getElementById('activeWeapon' + aIndex);
		
		otherBtn.setAttribute('onclick', 'select_weapon(' + (aIndex - 1) + ')');
		otherBtn.setAttribute('id', 'activeWeapon' + (aIndex - 1));
	}
	
	// Remove weapon from activeWeapons
	activeWeapons.splice(activeIndex, 1);
	refresh_chart();
}

// Input handling
awmHeader.onclick = function() {
	unselect_weapon();
}

deleteButton.onclick = function() {
	if(!validate_index()) { return; }
	remove_weapon(selectedWeaponIndex);
}

followGlobalCheckbox.oninput = function() {
	if(!validate_index()) { return; }
	sw_follow_global(this.checked);
	refresh_chart();
}

magSelect.oninput = function() {
	if(!validate_index()) { return; }
	
	let selectedWeapon = activeWeapons[selectedWeaponIndex];
	selectedWeapon.weaponMods.magRarity = Number(this.value);
	refresh_chart();
}

stockSelect.oninput = function() {
	if(!validate_index()) { return; }
	
	let selectedWeapon = activeWeapons[selectedWeaponIndex];
	selectedWeapon.weaponMods.stockRarity = Number(this.value);
	refresh_chart();
}

boltSelect.oninput = function() {
	if(!validate_index()) { return; }
	
	let selectedWeapon = activeWeapons[selectedWeaponIndex];
	selectedWeapon.weaponMods.boltRarity = Number(this.value);
	refresh_chart();
}

tacReloadCheckbox.oninput = function() {
	if(!validate_index()) { return; }
	
	let selectedWeapon = activeWeapons[selectedWeaponIndex];
	selectedWeapon.weaponMods.tacReload = this.checked;
	refresh_chart();
}

hopUpSelect.oninput = function() {
	if(!validate_index()) { return }
	
	let selectedWeapon = activeWeapons[selectedWeaponIndex];
	selectedWeapon.weaponMods.hopUp = Number(this.value);
	refresh_chart();
}

function gen_ttk_over_accuracy_data() {
	let weaponDatasets = [];
	let oldAccuracy = damageMods.accuracy;
	
	for (let aIndex = 0; aIndex < activeWeapons.length; ++aIndex) {
		let activeWeapon = activeWeapons[aIndex];
		let weaponData = [];
		
		for (let accuracy = chartMods.minAccuracy; accuracy <= chartMods.maxAccuracy; ++accuracy) {
			damageMods.hitRate = accuracy / 100.0;
			let ttk = activeWeapon.calc_ttk(damageMods);
			weaponData.push({x:accuracy,y:ttk});
		}
		
		weaponDatasets.push({
			label: activeWeapon.get_description(globalWeaponMods),
			data: weaponData,
			borderColor: activeWeapon.color
		});
	}
	
	damageMods.accuracy = oldAccuracy;
	return weaponDatasets;
}

function gen_damage_over_time_data() {
	let weaponDatasets = [];
	for(let aIndex = 0; aIndex < activeWeapons.length; ++aIndex) {
		let activeWeapon = activeWeapons[aIndex];
		weaponDatasets.push({
			label: activeWeapon.get_description(globalWeaponMods),
			data: activeWeapon.calc_dot(chartMods.seconds, damageMods),
			borderColor: activeWeapon.color
		});
	}
	
	return weaponDatasets;
}

function gen_damage_per_second_data() {
	let weaponData = {
		labels: [],
		datasets: [{
			label: 'Damage Per Second',
			data: [],
			backgroundColor: [],
		}]
	};
	
	for (let aIndex = 0; aIndex < activeWeapons.length; ++aIndex) {
		let activeWeapon = activeWeapons[aIndex];
		
		weaponData.labels.push(activeWeapon.get_description(globalWeaponMods));
		weaponData.datasets[0].data.push(activeWeapon.calc_dps(damageMods));
		weaponData.datasets[0].backgroundColor.push(activeWeapon.color);
	}
	
	return weaponData;
}

function gen_damage_per_mag_data() {
	let weaponData = {
		labels: [],
		datasets: [{
			label: 'Damage Per Mag',
			data: [],
			backgroundColor: [],
		}]
	};
	
	for (let aIndex = 0; aIndex < activeWeapons.length; ++aIndex) {
		let activeWeapon = activeWeapons[aIndex];
		
		weaponData.labels.push(activeWeapon.get_description(globalWeaponMods));
		weaponData.datasets[0].data.push(activeWeapon.calc_dpm(damageMods));
		weaponData.datasets[0].backgroundColor.push(activeWeapon.color);
	}
	
	return weaponData;
}

function page_setup_weapons() {
	// Populate weapon-select
	weaponSelectDiv.innerHTML = ''; // Clear
	for(let weaponIndex = 0; weaponIndex < weapons_S24.length; ++weaponIndex) {
		let weapon = weapons_S24[weaponIndex];
		
		let html = '<button class=\'weaponBtn\' style=\'--borderClr: ' + clrBorder + ';\'  onclick=add_weapon(' + weaponIndex + ')>';
		html +=			'<img class=\'weaponImg\' src=\'res/icons/' + weapon.name + '.svg\'/>';
		html +=			'<p class=\'weaponTxt\'>' + weapon.name + '</p>';
		html +=		'</button>\n';
		
		weaponSelectDiv.innerHTML += html;
	}
	
	// Populate Hop-Ups
	let noneEntry = document.createElement('option');
	noneEntry.value = 0;
	noneEntry.text = get_hop_up_name(0);
	hopUpSelect.add(noneEntry);
	
	for(let hopUpIndex = 0; hopUpIndex < HopUp.COUNT; ++hopUpIndex) {
		let hopUpFlag = 1 << hopUpIndex;
		let hopUpEntry = document.createElement('option');
		
		hopUpEntry.value = hopUpFlag;
		hopUpEntry.id = 'input_hopUp' + hopUpFlag;
		hopUpEntry.text = get_hop_up_name(hopUpFlag);
		hopUpSelect.add(hopUpEntry);
	}
}
