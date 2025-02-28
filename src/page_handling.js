// Global weapon mods
let globalMagSelect         = document.getElementById('input_globalMag');
let globalStockSelect       = document.getElementById('input_globalStock');
let globalBoltSelect        = document.getElementById('input_globalBolt');
let globalTacReloadCheckbox = document.getElementById('input_globalTacReload');

// Damage mods
let headshotSlider    = document.getElementById('input_headshot');
let legshotSlider     = document.getElementById('input_legshot'); 
let fortifiedCheckbox = document.getElementById('input_fortified');
let ampedCheckbox     = document.getElementById('input_amped');
let markedCheckbox    = document.getElementById('input_marked');

// Chart mods
let chartSelect = document.getElementById('input_chartType');
let shieldSelect      = document.getElementById('input_shield');
let secondsSlider = document.getElementById('input_seconds');
let showShieldsCheckbox = document.getElementById('input_showShields');
let accuracySlider    = document.getElementById('input_accuracy');
let minAccuracySlider = document.getElementById('input_minAccuracy');
let maxAccuracySlider = document.getElementById('input_maxAccuracy');
let distanceSlider = document.getElementById('input_distance');

// Divs
let activeWeaponDiv = document.getElementById('activeWeapons');
let weaponSelectDiv = document.getElementById('weaponSelect');
let awmDiv = document.getElementById('awmDiv');
let globalModsDiv = document.getElementById('globalModsDiv');
let chartModsContentDiv = document.getElementById('chartModsContentDiv');
let shieldDiv = document.getElementById('shieldDiv');
let showShieldsDiv = document.getElementById('showShieldsDiv');
let secondsDiv = document.getElementById('secondsDiv');
let accuracyDiv = document.getElementById('accuracyDiv');
let minAccuracyDiv = document.getElementById('minAccuracyDiv');
let maxAccuracyDiv = document.getElementById('maxAccuracyDiv');

// Misc
let chartModsButton = document.getElementById('input_chartModsButton');
let accuracyText = document.getElementById('accuracyText');
let headshotText = document.getElementById('headshotText');
let legshotText  = document.getElementById('legshotText');
let distanceText = document.getElementById('distanceText');
let secondsText = document.getElementById('secondsText');
let minAccuracyText = document.getElementById('minAccuracyText');
let maxAccuracyText = document.getElementById('maxAccuracyText');
let borderWidth = window.getComputedStyle(document.body).getPropertyValue('--borderWidth');

function update_slider_text(slider, text, postFix = '') {
	text.value = slider.value + postFix;
}

// Input handling
globalMagSelect.oninput = function() {
	globalWeaponMods.magRarity = Number(this.value);
	
	for(let aIndex = 0; aIndex < activeWeapons.length; ++aIndex) {
		if(activeWeapons[aIndex].weaponMods.followGlobal) {
			if(aIndex == selectedWeaponIndex) {
				sw_follow_global(true);
			} else {
				activeWeapons[aIndex].weaponMods.magRarity = globalWeaponMods.magRarity;
			}
		}
	}
	
	refresh_chart();
}

globalStockSelect.oninput = function() {
	globalWeaponMods.stockRarity = Number(this.value);
	
	for(let aIndex = 0; aIndex < activeWeapons.length; ++aIndex) {
		if(activeWeapons[aIndex].weaponMods.followGlobal) {
			if(aIndex == selectedWeaponIndex) {
				sw_follow_global(true);
			} else {
				activeWeapons[aIndex].weaponMods.stockRarity = globalWeaponMods.stockRarity;
			}
		}
	}
	
	refresh_chart();
}

globalBoltSelect.oninput = function() {
	globalWeaponMods.boltRarity = Number(this.value);
	
	for(let aIndex = 0; aIndex < activeWeapons.length; ++aIndex) {
		if(activeWeapons[aIndex].weaponMods.followGlobal) {
			if(aIndex == selectedWeaponIndex) {
				sw_follow_global(true);
			} else {
				activeWeapons[aIndex].weaponMods.boltRarity = globalWeaponMods.boltRarity;
			}
		}
	}
	
	refresh_chart();
}

globalTacReloadCheckbox.oninput = function() {
	globalWeaponMods.tacReload = this.checked;
	
	for(let aIndex = 0; aIndex < activeWeapons.length; ++aIndex) {
		if(activeWeapons[aIndex].weaponMods.followGlobal) {
			if(aIndex == selectedWeaponIndex) {
				sw_follow_global(true);
			} else {
				activeWeapons[aIndex].weaponMods.tacReload = globalWeaponMods.tacReload;
			}
		}
	}
	
	refresh_chart();
}

headshotSlider.oninput = function() {
	update_slider_text(this, headshotText, '%');
	damageMods.headshotRate = Number(this.value) / 100.0;
	
	if ((Number(this.value) + Number(legshotSlider.value)) > 100) {
		legshotSlider.value = 100 - Number(this.value);
		update_slider_text(legshotSlider, legshotText);
		damageMods.legshotRate = Number(legshotSlider.value) / 100.0;
	}
	
	refresh_chart();
}

legshotSlider.oninput = function() {
	update_slider_text(this, legshotText, '%');
	damageMods.legshotRate = Number(this.value) / 100.0;
	
	if ((Number(headshotSlider.value) + Number(this.value)) > 100) {
		headshotSlider.value = 100 - Number(this.value);
		update_slider_text(headshotSlider, headshotText);
		damageMods.headshotRate = Number(headshotSlider.value) / 100.0;
	}
	
	refresh_chart();
}

distanceSlider.oninput = function() {
	update_slider_text(this, distanceText, 'm');
	damageMods.distance = Number(this.value);
	refresh_chart();
}

fortifiedCheckbox.oninput = function() {
	damageMods.fortified = this.checked;
	refresh_chart();
}

ampedCheckbox.oninput = function() {
	damageMods.amped = this.checked;
	refresh_chart();
}

markedCheckbox.oninput = function() {
	damageMods.marked = this.checked;
	refresh_chart();
}

chartSelect.oninput = function() {
	change_chart_type(Number(this.value));
}

shieldSelect.oninput = function() {
	damageMods.shield = get_shield_health(Number(this.value));
	refresh_chart();
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

accuracySlider.oninput = function() {
	update_slider_text(this, accuracyText, '%');
	damageMods.hitRate = Number(this.value) / 100.0;
	
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

function show_and_hide() {
	shieldDiv.style.display = 'none'; showShieldsDiv.style.display = 'none';
	secondsDiv.style.display = 'none'; accuracyDiv.style.display = 'none';
	minAccuracyDiv.style.display = 'none'; maxAccuracyDiv.style.display = 'none';
	
	switch(chartMods.type) {
		case ChartType.TIME_TO_KILL: {
			shieldDiv.style.display = 'initial'; accuracyDiv.style.display = 'initial';
		} break;
		
		case ChartType.TTK_OVER_ACCURACY: {
			shieldDiv.style.display = 'initial';
			minAccuracyDiv.style.display = 'initial'; maxAccuracyDiv.style.display = 'initial';
		} break;
		
		case ChartType.DAMAGE_OVER_TIME: {
			showShieldsDiv.style.display = 'initial'; secondsDiv.style.display = 'initial';
			accuracyDiv.style.display = 'initial';
		} break;
		
		case ChartType.DPS_INFINITE_MAG:
		case ChartType.DPS_PRACTICAL:
		case ChartType.DAMAGE_PER_MAG: {
			accuracyDiv.style.display = 'initial';
		} break;
	}
	
	if(chartModsButton.classList.contains('foldOpen')) {
		chartModsContentDiv.style.transition = '';
		chartModsContentDiv.style.maxHeight = chartModsContentDiv.scrollHeight + 'px';
	}
}

function folding() {
	this.classList.toggle('foldOpen');	
	let content = this.nextElementSibling;
	
	if (content.style.maxHeight) {
		content.style.transition = 'max-height 0.2s linear, border-width 0s 0.2s';
		content.style.maxHeight = null;
		content.style.borderWidth = '0px';
	} else {
		content.style.transition = 'max-height 0.2s linear';
		content.style.maxHeight =  content.scrollHeight + 'px';
		content.style.borderWidth = '0px ' + borderWidth + ' ' + borderWidth;
	}
}

function page_setup() {
	// Setup folding buttons
	let foldBtns = document.getElementsByClassName('foldBtn');
	for (let foldBtnIndex = 0; foldBtnIndex < foldBtns.length; ++foldBtnIndex) {
		foldBtns[foldBtnIndex].addEventListener('click', folding);
	}
	
	update_slider_text(accuracySlider, accuracyText, '%');
	update_slider_text(headshotSlider, headshotText, '%');
	update_slider_text(legshotSlider,  legshotText, '%');
	update_slider_text(distanceSlider, distanceText, 'm');
	update_slider_text(secondsSlider,  secondsText);
	update_slider_text(minAccuracySlider, minAccuracyText, '%');
	update_slider_text(maxAccuracySlider, maxAccuracyText, '%');
	
	// Damage mods
	let shield = get_shield_health(Number(shieldSelect.value));
	let health = 100;
	let hitRate = Number(accuracySlider.value) / 100.0;
	let headshotRate = Number(headshotSlider.value) / 100.0;
	let legshotRate = Number(legshotSlider.value) / 100.0;
	let distance = Number(distanceSlider.value);
	let fortified = fortifiedCheckbox.checked;
	let amped = ampedCheckbox.checked;
	let marked = markedCheckbox.checked;
	
	damageMods = new DamageModifiers(shield, health, hitRate, headshotRate, legshotRate, distance,
                                     fortified, amped, marked);
	
	// Global weapon mods
	let magRarity = Number(globalMagSelect.value);
	let stockRarity = Number(globalStockSelect.value);
	let boltRarity = Number(globalBoltSelect.value);
	let hopUp = 0;
	let tacReload = globalTacReloadCheckbox.checked;
	let ampReload = false;
	let traits = 0;
	
	globalWeaponMods = new WeaponModifiers(magRarity, stockRarity, boltRarity, hopUp, tacReload,
                                           ampReload, traits, true);
	
	page_setup_charts();
	page_setup_weapons();
	
	show_and_hide();
}

