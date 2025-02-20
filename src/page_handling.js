// Variables
let chart;
let activeWeapons = []; // Contains ModdedWeapon objects
let damageMods;
let weaponMods;
let chartMods;

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

// Chart mods
let chartSelect = document.getElementById('input_chartType');
let secondsSlider = document.getElementById('input_seconds');
let showShieldsCheckbox = document.getElementById('input_showShields');
let minAccuracySlider = document.getElementById('input_minAccuracy');
let maxAccuracySlider = document.getElementById('input_maxAccuracy');

// Misc
let damageRadioBtn = document.getElementById('input_damageMods');
let weaponRadioBtn = document.getElementById('input_weaponMods');
let chartRadioBtn = document.getElementById('input_chartMods');
let accuracyText = document.getElementById('accuracyText');
let headshotText = document.getElementById('headshotText');
let legshotText  = document.getElementById('legshotText');
let secondsText = document.getElementById('secondsText');
let minAccuracyText = document.getElementById('minAccuracyText');
let maxAccuracyText = document.getElementById('maxAccuracyText');
let activeWeaponDiv = document.getElementById('activeWeapons');
let weaponSelectDiv = document.getElementById('weaponSelect');
let damageModsDiv = document.getElementById('damageModsDiv');
let weaponModsDiv = document.getElementById('weaponModsDiv');
let chartModsDiv = document.getElementById('chartModsDiv');

function update_slider_text(slider, text, postFix = '') {
	text.value = slider.value + postFix;
}

function refresh_chart_damage_per_mag()
{
	let weaponData = {
		labels: [],
		datasets: [{
			label: 'Damage Per Mag',
			data: [],
			backgroundColor: [],
		}]
	};
	
	for (let weaponIndex = 0; weaponIndex < activeWeapons.length; ++weaponIndex) {
		let activeWeapon = activeWeapons[weaponIndex];
		let oldMagRarity = activeWeapon.weaponMods.magRarity;
		
		weaponData.labels.push(activeWeapon.get_name());
		weaponData.datasets[0].data.push(activeWeapon.get_damage_per_mag(damageMods));
		weaponData.datasets[0].backgroundColor.push(activeWeapon.color);
		
		activeWeapon.weaponMods.magRarity = oldMagRarity;
	}
	
	// Sort that shit
	let sorted = false;
	while(!sorted) {
		sorted = true;
		for (let weaponIndex = 0; weaponIndex < (weaponData.datasets[0].data.length - 1); ++weaponIndex) {
			let weaponDPM = weaponData.datasets[0].data[weaponIndex];
			let nextWeaponDPM = weaponData.datasets[0].data[weaponIndex + 1];
			
			if (weaponDPM < nextWeaponDPM) {
				weaponData.datasets[0].data[weaponIndex] = nextWeaponDPM;
				weaponData.datasets[0].data[weaponIndex + 1] = weaponDPM;
				
				let labelSwap = weaponData.labels[weaponIndex];
				weaponData.labels[weaponIndex] = weaponData.labels[weaponIndex + 1];
				weaponData.labels[weaponIndex + 1] = labelSwap;
				
				let colorSwap = weaponData.datasets[0].backgroundColor[weaponIndex];
				weaponData.datasets[0].backgroundColor[weaponIndex] = weaponData.datasets[0].backgroundColor[weaponIndex + 1];
				weaponData.datasets[0].backgroundColor[weaponIndex + 1] = colorSwap;
				
				sorted = false;
			}
		}
	}
	
	chart_update_damage_per_mag(chart, weaponData, chartMods, weaponMods.magRarity);
}

function refresh_chart_ttk_over_accuracy()
{
	let weaponDatasets = [];
	let oldAccuracy = damageMods.accuracy;
	
	for (let weaponIndex = 0; weaponIndex < activeWeapons.length; ++weaponIndex) {
		let activeWeapon = activeWeapons[weaponIndex];
		let weaponData = [];
		
		for (let accuracy = chartMods.minAccuracy; accuracy <= chartMods.maxAccuracy; accuracy += 1) {
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
	let shieldRarity = Number(shieldSelect.value);
	
	chart_update_ttk_over_accuracy(chart, weaponDatasets, chartMods, shieldRarity);
}

function refresh_chart_damage_over_time()
{
	let weaponDatasets = [];
	for(let weaponIndex = 0; weaponIndex < activeWeapons.length; ++weaponIndex) {
		let activeWeapon = activeWeapons[weaponIndex];
		weaponDatasets.push({
			label: activeWeapon.get_name(),
			data: activeWeapon.fire_for_time(chartMods.seconds, damageMods),
			borderColor: activeWeapon.color
		});
	}
	
	chart_update_damage_over_time(chart, weaponDatasets, chartMods);
}

function refresh_chart()
{
	switch(chartMods.type)
	{
		case ChartTypes.TTK_OVER_ACCURACY: { refresh_chart_ttk_over_accuracy(); } break;
		case ChartTypes.DAMAGE_OVER_TIME: {	refresh_chart_damage_over_time(); } break;
		case ChartTypes.DPS_PER_MAG: {  } break;
		case ChartTypes.DAMAGE_PER_MAG: { refresh_chart_damage_per_mag(); } break;
	}
}

function refresh_mod_div() {
	damageModsDiv.hidden = !damageRadioBtn.checked;
	weaponModsDiv.hidden = !weaponRadioBtn.checked;
	chartModsDiv.hidden  = !chartRadioBtn.checked;
}

function show_and_hide() {
	// TODO: show and hide elements based on the chart type
}

function change_chart_type(type) {
	chartMods.type = type;
	chart = chart_change_type(chart, chartMods);
	refresh_chart();
	show_and_hide();
}

shieldSelect.oninput = function() {
	damageMods.shield = get_shield_health(Number(this.value));
	refresh_chart();
}

accuracySlider.oninput = function() {
	update_slider_text(this, accuracyText, '%');
	damageMods.hitRate = Number(this.value) / 100.0;
	
	refresh_chart();
}

headshotSlider.oninput = function()
{
	update_slider_text(this, headshotText, '%');
	damageMods.headshotRate = Number(this.value) / 100.0;
	
	if ((Number(this.value) + Number(legshotSlider.value)) > 100) {
		legshotSlider.value = 100 - Number(this.value);
		update_slider_text(legshotSlider, legshotText);
		damageMods.legshotRate = Number(legshotSlider.value) / 100.0;
	}
	
	refresh_chart();
}

legshotSlider.oninput = function()
{
	update_slider_text(this, legshotText, '%');
	damageMods.legshotRate = Number(this.value) / 100.0;
	
	if ((Number(headshotSlider.value) + Number(this.value)) > 100) {
		headshotSlider.value = 100 - Number(this.value);
		update_slider_text(headshotSlider, headshotText);
		damageMods.headshotRate = Number(headshotSlider.value) / 100.0;
	}
	
	refresh_chart();
}

fortifiedCheckbox.oninput = function()
{
	damageMods.fortified = this.checked;
	refresh_chart();
}

ampedCheckbox.oninput = function()
{
	damageMods.amped = this.checked;
	refresh_chart();
}

markedCheckbox.oninput = function()
{
	damageMods.marked = this.checked;
	refresh_chart();
}

magSelect.oninput = function() {
	weaponMods.magRarity = Number(this.value);
	refresh_chart();
}

stockSelect.oninput = function() {
	weaponMods.stockRarity = Number(this.value);
	refresh_chart();
}

boltSelect.oninput = function() {
	weaponMods.shotgunBoltRarity = Number(this.value);
	refresh_chart();
}

tacReloadCheckbox.oninput = function() {
	weaponMods.tacReload = this.checked;
	refresh_chart();
}

chartSelect.oninput = function() {
	change_chart_type(Number(this.value));
}

secondsSlider.oninput = function() {
	update_slider_text(this, secondsText);
	chartMods.seconds = Number(this.value);
	refresh_chart();
}

showShieldsCheckbox.oninput = function() {
	chartMods.showShields = this.checked;
	refresh_chart();
}

minAccuracySlider.oninput = function() {
	update_slider_text(this, minAccuracyText, '%');
	chartMods.minAccuracy = Number(this.value);

	if (Number(this.value) > Number(maxAccuracySlider.value)) {
		maxAccuracySlider.value = this.value;
		update_slider_text(maxAccuracySlider, maxAccuracyText, '%');
		chartMods.maxAccuracy = Number(maxAccuracySlider.value);
	}

	refresh_chart();
}

maxAccuracySlider.oninput = function() {
	update_slider_text(this, maxAccuracyText, '%');
	chartMods.maxAccuracy = Number(this.value);

	if (Number(this.value) < Number(minAccuracySlider.value)) {
		minAccuracySlider.value = this.value;
		update_slider_text(minAccuracySlider, minAccuracyText, '%');
		chartMods.minAccuracy = Number(minAccuracySlider.value);
	}

	refresh_chart();
}

damageRadioBtn.oninput = function() {
	refresh_mod_div();
}

weaponRadioBtn.oninput = function() {
	refresh_mod_div();
}

chartRadioBtn.oninput = function() {
	refresh_mod_div();
}

function add_weapon(weaponIndex)
{
	if(weaponIndex >= weapons_S24.length) {
		console.warn('weaponIndex (' + weaponIndex + 'outside list (' + weapons_S24.length +')');
		return;
	}
	
	// TODO: copying is probably important here i think (Object.assign())
	let weapon = weapons_S24[weaponIndex];
	let activeIndex = activeWeapons.length;
	activeWeapons.push(new ModdedWeapon(weapon, weaponMods));
	refresh_chart();
	
	let activeWeapon = activeWeapons[activeIndex];
	let html = '<button class=\'weaponBtn\' style=\'--borderClr: ' + activeWeapon.color + ';\' id=activeWeapon' + activeIndex + '  onclick=remove_weapon(' + activeIndex + ')>';
	html +=			'<img class=\'weaponImg\' src=\'res/icons/' + weapon.name + '.svg\'/>';
	html +=			'<p class=\'weaponTxt\'>' + weapon.name + '</p>';
	html +=		'</button>\n';
	
	activeWeaponDiv.innerHTML += html;
}

function remove_weapon(activeIndex)
{
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

function setup_page()
{
	refresh_mod_div();
	show_and_hide();
	
	update_slider_text(accuracySlider, accuracyText, '%');
	update_slider_text(headshotSlider, headshotText, '%');
	update_slider_text(legshotSlider,  legshotText, '%');
	update_slider_text(secondsSlider,  secondsText);
	update_slider_text(minAccuracySlider, minAccuracyText, '%');
	update_slider_text(maxAccuracySlider, maxAccuracyText, '%');
	
	// Damage mods
	let test = shieldSelect.value;
	
	let shield = get_shield_health(Number(shieldSelect.value));
	let health = 100;
	let hitRate = Number(accuracySlider.value) / 100.0;
	let headshotRate = Number(headshotSlider.value) / 100.0;
	let legshotRate = Number(legshotSlider.value) / 100.0;
	let fortified = fortifiedCheckbox.checked;
	let amped = ampedCheckbox.checked;
	let marked = markedCheckbox.checked;
	
	damageMods = new DamageModifiers(shield, health, hitRate, headshotRate, legshotRate, fortified, amped, marked);
	
	// Weapon mods
	let magRarity = Number(magSelect.value);
	let stockRarity = Number(stockSelect.value);
	let shotgunBoltRarity = Number(boltSelect.value);
	let tacReload = tacReloadCheckbox.checked;
	let ampReload = false;
	let splatterRounds = splatterRoundsCheckbox.checked;
	
	weaponMods = new WeaponModifiers(magRarity, stockRarity, shotgunBoltRarity, tacReload, ampReload, splatterRounds);
	
	// Chart mods
	let canvasId = 'statChart';
	let chartType = Number(chartSelect.value);
	let seconds = Number(secondsSlider.value);
	let showShields = showShieldsCheckbox.checked;
	let minAccuracy = Number(minAccuracySlider.value);
	let maxAccuracy = Number(maxAccuracySlider.value);
	
	chartMods = new ChartModifiers(canvasId, chartType, seconds, showShields, minAccuracy, maxAccuracy);
	
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
	
	chart = chart_create(chartMods);
	refresh_chart();
}


