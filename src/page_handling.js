// Variables
let chart; // chart.update(); chart.destroy();
let damageMods;
let weaponMods;
let moddedWeapons = []; // { ModdedWeapon }

// Damage mods
let shieldSelect      = document.getElementById('input_shield');
let accuracySlider    = document.getElementById('input_accuracy');
let headshotSlider    = document.getElementById('input_headshot');
let legshotSlider     = document.getElementById('input_legshot'); 
let fortifiedCheckbox = document.getElementById('input_fortified');
let ampedCheckbox     = document.getElementById('input_amped');
let markedCheckbox    = document.getElementById('input_marked');

// Weapon mods
let magSelect              = document.getElementById('input_mag');
let stockSelect            = document.getElementById('input_stock');
let boltSelect             = document.getElementById('input_bolt');
let tacReloadCheckbox      = document.getElementById('input_tacReload');
let splatterRoundsCheckbox = document.getElementById('input_splatterRounds');

// Graph mods
let graphSelect;
let dotSeconds = 5.0;
let dotShowShields = true;

// Misc
let accuracyText = document.getElementById('accuracyText');
let headshotText = document.getElementById('headshotText');
let legshotText  = document.getElementById('legshotText');
let activeWeaponDiv = document.getElementById('activeWeapons');
let weaponSelectDiv = document.getElementById('weaponSelect');

function update_slider_text(slider, text)
{
	text.value = slider.value + '%';
}

function update_chart()
{
	let weaponDatasets = [];
	for(let weaponIndex = 0; weaponIndex < moddedWeapons.length; ++weaponIndex) {
		let moddedWeapon = moddedWeapons[weaponIndex];
		weaponDatasets.push({
			label: moddedWeapon.get_name(),
			data: moddedWeapon.fire_for_time(dotSeconds, damageMods),
			borderColor: moddedWeapon.color
		});
	}
	
	update_chart_damage_over_time(chart, weaponDatasets, dotSeconds, dotShowShields);
}

accuracySlider.oninput = function() {
	update_slider_text(this, accuracyText);
	damageMods.accuracy = Number(this.value) / 100.0;
	
	update_chart();
}

headshotSlider.oninput = function()
{
	update_slider_text(this, headshotText);
	damageMods.headshotRate = Number(this.value) / 100.0;
	
	if ((Number(headshotSlider.value) + Number(legshotSlider.value)) > 100) {
		legshotSlider.value = 100 - Number(headshotSlider.value);
		update_slider_text(legshotSlider, legshotText);
		damageMods.legshotRate = Number(legshotSlider.value) / 100.0;
	}
	
	update_chart();
}

legshotSlider.oninput = function()
{
	update_slider_text(this, legshotText);
	damageMods.legshotRate = Number(this.value) / 100.0;
	
	if ((Number(headshotSlider.value) + Number(legshotSlider.value)) > 100) {
		headshotSlider.value = 100 - Number(legshotSlider.value);
		update_slider_text(headshotSlider, headshotText);
		damageMods.headshotRate = Number(headshotSlider.value) / 100.0;
	}
	
	update_chart();
}

fortifiedCheckbox.oninput = function()
{
	damageMods.fortified = this.checked;
	update_chart();
}

ampedCheckbox.oninput = function()
{
	damageMods.amped = this.checked;
	update_chart();
}

markedCheckbox.oninput = function()
{
	damageMods.marked = this.checked;
	update_chart();
}

magSelect.oninput = function() {
	weaponMods.magRarity = Number(this.value);
	update_chart();
}

stockSelect.oninput = function() {
	weaponMods.stockRarity = Number(this.value);
	update_chart();
}

boltSelect.oninput = function() {
	weaponMods.shotgunBoltRarity = Number(this.value);
	update_chart();
}

tacReloadCheckbox.oninput = function() {
	weaponMods.tacReload = this.checked;
	update_chart();
}

function add_weapon(weaponIndex)
{
	if(weaponIndex >= weapons_S24.length) {
		console.warn('weaponIndex (' + weaponIndex + 'outside list (' + weapons_S24.length +')');
		return;
	}
	
	// TODO: copying is probably important here i think (Object.assign())
	let weapon = weapons_S24[weaponIndex];
	let moddedIndex = moddedWeapons.length;
	moddedWeapons.push(new ModdedWeapon(weapon, weaponMods));
	update_chart();
	
	let html = '<button class=\'weaponBtn\' id=activeWeapon' + moddedIndex + '  onclick=remove_weapon(' + moddedIndex + ')>';
	html +=			'<img class=\'weaponImg\' src=\'res/icons/' + weapon.name + '.svg\'/>';
	html +=			'<p class=\'weaponTxt\'>' + weapon.name + '</p>';
	html +=		'</button>\n';
	
	activeWeaponDiv.innerHTML += html;
}

function remove_weapon(moddedIndex)
{
	if(moddedIndex >= moddedWeapons.length) {
		console.warn('moddedIndex (' + moddedIndex + 'outside list (' + moddedWeapons.length +')');
		return;
	}
	
	// Remove button from html
	let weaponBtn = document.getElementById('activeWeapon' + moddedIndex);
	weaponBtn.remove();
	
	// Decrement remaining buttons with id above removed id
	for(let mIndex = (moddedIndex + 1); mIndex < moddedWeapons.length; ++mIndex) {
		let otherBtn = document.getElementById('activeWeapon' + mIndex);
		
		otherBtn.setAttribute('onclick', 'remove_weapon(' + (mIndex - 1) + ')');
		otherBtn.setAttribute('id', 'activeWeapon' + (mIndex - 1));
	}
	
	// Remove weapon from moddedWeapons
	moddedWeapons.splice(moddedIndex, 1);
	update_chart();
}

function setup_page()
{
	update_slider_text(accuracySlider, accuracyText);
	update_slider_text(headshotSlider, headshotText);
	update_slider_text(legshotSlider,  legshotText);
	
	let shield = 50;
	let health = 100;
	let accuracy = Number(accuracySlider.value) / 100.0;
	let headshotRate = Number(headshotSlider.value) / 100.0;
	let legshotRate = Number(legshotSlider.value) / 100.0;
	let fortified = fortifiedCheckbox.checked;
	let amped = ampedCheckbox.checked;
	let marked = markedCheckbox.checked;
	let magRarity = Number(magSelect.value);
	let stockRarity = Number(stockSelect.value);
	let shotgunBoltRarity = Number(boltSelect.value);
	let tacReload = tacReloadCheckbox.checked;
	let ampReload = false;
	let splatterRounds = splatterRoundsCheckbox.checked;
	
	damageMods = new DamageModifiers(shield, health, accuracy, headshotRate, legshotRate, fortified, amped, marked);
	weaponMods = new WeaponModifiers(magRarity, stockRarity, shotgunBoltRarity, tacReload, ampReload, splatterRounds);
	
	// Populate weapon-select
	weaponSelectDiv.innerHTML = ''; // Clear
	for(let weaponIndex = 0; weaponIndex < weapons_S24.length; ++weaponIndex) {
		let weapon = weapons_S24[weaponIndex];
		
		let html = '<button class=\'weaponBtn\' onclick=add_weapon(' + weaponIndex + ')>';
		html +=			'<img class=\'weaponImg\' src=\'res/icons/' + weapon.name + '.svg\'/>';
		html +=			'<p class=\'weaponTxt\'>' + weapon.name + '</p>';
		html +=		'</button>\n';
		
		weaponSelectDiv.innerHTML += html;
	}
	
	chart = create_chart_damage_over_time('statChart', dotSeconds, dotShowShields);
	update_chart();
}


