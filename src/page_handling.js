// Global weapon mods
let globalMagSelect         = document.getElementById('input_globalMag');
let globalStockSelect       = document.getElementById('input_globalStock');
let globalBoltSelect        = document.getElementById('input_globalBolt');
let globalTacReloadCheckbox = document.getElementById('input_globalTacReload');

// Damage mods
let shieldSelect      = document.getElementById('input_shield');
let accuracySlider    = document.getElementById('input_accuracy');
let headshotSlider    = document.getElementById('input_headshot');
let legshotSlider     = document.getElementById('input_legshot'); 
let fortifiedCheckbox = document.getElementById('input_fortified');
let ampedCheckbox     = document.getElementById('input_amped');
let markedCheckbox    = document.getElementById('input_marked');

// Chart mods
let chartSelect = document.getElementById('input_chartType');
let secondsSlider = document.getElementById('input_seconds');
let showShieldsCheckbox = document.getElementById('input_showShields');
let minAccuracySlider = document.getElementById('input_minAccuracy');
let maxAccuracySlider = document.getElementById('input_maxAccuracy');

// Misc
let accuracyText = document.getElementById('accuracyText');
let headshotText = document.getElementById('headshotText');
let legshotText  = document.getElementById('legshotText');
let secondsText = document.getElementById('secondsText');
let minAccuracyText = document.getElementById('minAccuracyText');
let maxAccuracyText = document.getElementById('maxAccuracyText');
let activeWeaponDiv = document.getElementById('activeWeapons');
let weaponSelectDiv = document.getElementById('weaponSelect');
let awmDiv = document.getElementById('awmDiv');
let globalModsDiv = document.getElementById('globalModsDiv');
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

shieldSelect.oninput = function() {
	damageMods.shield = get_shield_health(Number(this.value));
	refresh_chart();
}

accuracySlider.oninput = function() {
	update_slider_text(this, accuracyText, '%');
	damageMods.hitRate = Number(this.value) / 100.0;
	
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

function show_and_hide() {
	// TODO: show and hide elements based on the chart type
}

function folding() {
	this.classList.toggle('foldOpen');	
	let content = this.nextElementSibling;
	
	if (content.style.maxHeight) {
		content.style.transition = 'max-height 0.2s ease-out, border-width 0s 0.2s';
		content.style.maxHeight = null;
		content.style.borderWidth = '0px';
	} else {
		content.style.transition = 'max-height 0.2s ease-out';
		content.style.maxHeight =  content.scrollHeight + 'px';
		content.style.borderWidth = '0px ' + borderWidth + ' ' + borderWidth;
	}
}

function page_setup() {
	show_and_hide();
	
	// Setup folding buttons
	let foldBtns = document.getElementsByClassName('foldBtn');
	for (let foldBtnIndex = 0; foldBtnIndex < foldBtns.length; ++foldBtnIndex) {
		foldBtns[foldBtnIndex].addEventListener('click', folding);
	}
	
	update_slider_text(accuracySlider, accuracyText, '%');
	update_slider_text(headshotSlider, headshotText, '%');
	update_slider_text(legshotSlider,  legshotText, '%');
	update_slider_text(secondsSlider,  secondsText);
	update_slider_text(minAccuracySlider, minAccuracyText, '%');
	update_slider_text(maxAccuracySlider, maxAccuracyText, '%');
	
	// Damage mods
	let shield = get_shield_health(Number(shieldSelect.value));
	let health = 100;
	let hitRate = Number(accuracySlider.value) / 100.0;
	let headshotRate = Number(headshotSlider.value) / 100.0;
	let legshotRate = Number(legshotSlider.value) / 100.0;
	let fortified = fortifiedCheckbox.checked;
	let amped = ampedCheckbox.checked;
	let marked = markedCheckbox.checked;
	
	damageMods = new DamageModifiers(shield, health, hitRate, headshotRate, legshotRate, fortified, amped, marked);
	
	// Global weapon mods
	let magRarity = Number(globalMagSelect.value);
	let stockRarity = Number(globalStockSelect.value);
	let boltRarity = Number(globalBoltSelect.value);
	let hopUp = 0;
	let tacReload = globalTacReloadCheckbox.checked;
	let ampReload = false;
	
	globalWeaponMods = new WeaponModifiers(magRarity, stockRarity, boltRarity, hopUp, tacReload, ampReload, true);
	
	page_setup_charts();
	page_setup_weapons();
}

