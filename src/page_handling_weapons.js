let activeWeapons = []; // Contains ModdedWeapon objects
let selectedWeaponIndex = -1;
let colorNum = 0;

let globalWeaponMods;
let damageMods;

// Inputs
let followGlobalCheckbox = document.getElementById('input_followGlobal');
let magSelect = document.getElementById('input_mag');
let stockSelect = document.getElementById('input_stock');
let boltSelect = document.getElementById('input_bolt');

// Misc
let awmHeader = document.getElementById('awmHeader');
let awmContent = document.getElementById('awmContent');

// Input handling
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

function sw_follow_global(follow) {
	if(!validate_index()) { return; }
	
	let selectedWeapon = activeWeapons[selectedWeaponIndex];
	selectedWeapon.weaponMods.followGlobal = follow;
	
	if(selectedWeapon.weaponMods.followGlobal) {
		selectedWeapon.weaponMods.magRarity = globalWeaponMods.magRarity;
		selectedWeapon.weaponMods.stockRarity = globalWeaponMods.stockRarity;
		selectedWeapon.weaponMods.boltRarity = globalWeaponMods.boltRarity;
	}
	
	followGlobalCheckbox.checked = follow;
	magSelect.disabled = follow; magSelect.value = selectedWeapon.weaponMods.magRarity;
	stockSelect.disabled = follow; stockSelect.value = selectedWeapon.weaponMods.stockRarity;
	boltSelect.disabled = follow; boltSelect.value = selectedWeapon.weaponMods.boltRarity;
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

// Weapon handling
function add_weapon(weaponIndex) {
	if(weaponIndex >= weapons_S24.length) {
		console.warn('weaponIndex (' + weaponIndex + 'outside list (' + weapons_S24.length +')');
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
		console.warn('activeIndex (' + activeIndex + 'outside list (' + activeWeapons.length +')');
	} else if(activeIndex == selectedWeaponIndex) {
		selectedWeaponIndex = -1;
		awmDiv.style.display = 'none';
	} else {
		let activeWeapon = activeWeapons[activeIndex];
		followGlobalCheckbox.checked = activeWeapon.weaponMods.followGlobal;
		magSelect.value = activeWeapon.weaponMods.magRarity;
		stockSelect.value = activeWeapon.weaponMods.stockRarity;
		boltSelect.value = activeWeapon.weaponMods.boltRarity;
		
		if(activeWeapon.weaponMods.followGlobal) {
			magSelect.disabled = true; stockSelect.disabled = true; boltSelect.disabled = true;
		}
		else {
			magSelect.disabled = false; stockSelect.disabled = false; boltSelect.disabled = false;
		}
		
		selectedWeaponIndex = activeIndex;
		awmDiv.style.display = 'initial';
		
		awmHeader.innerHTML = activeWeapon.get_name() + ' Modifications';
		awmHeader.style.backgroundColor = activeWeapon.color;
		awmContent.style.borderColor = activeWeapon.color;
	}
}

function remove_weapon(activeIndex) {
	if(activeIndex >= activeWeapons.length) {
		console.warn('activeIndex (' + activeIndex + 'outside list (' + activeWeapons.length +')');
		return;
	}
	
	// Remove button from html
	let weaponBtn = document.getElementById('activeWeapon' + activeIndex);
	weaponBtn.remove();
	
	// Decrement remaining buttons with id above removed id
	for(let aIndex = (activeIndex + 1); aIndex < activeWeapons.length; ++aIndex) {
		let otherBtn = document.getElementById('activeWeapon' + aIndex);
		
		otherBtn.setAttribute('onclick', 'remove_weapon(' + (aIndex - 1) + ')');
		otherBtn.setAttribute('id', 'activeWeapon' + (aIndex - 1));
	}
	
	// Remove weapon from activeWeapons
	activeWeapons.splice(activeIndex, 1);
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
			label: activeWeapon.get_name(),
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
			label: activeWeapon.get_name(),
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
		
		weaponData.labels.push(activeWeapon.get_name());
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
		
		weaponData.labels.push(activeWeapon.get_name(true));
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
}
