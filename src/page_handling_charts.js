let chart;
let chartMods;

// Chart handling
function refresh_chart_ttk_over_accuracy() {
	let weaponDatasets = gen_ttk_over_accuracy_data();
	let shieldRarity = Number(shieldSelect.value);
	
	chart_update_ttk_over_accuracy(chart, weaponDatasets, chartMods, shieldRarity);
}

function refresh_chart_damage_over_time() {
	let weaponDatasets = gen_damage_over_time_data();
	chart_update_damage_over_time(chart, weaponDatasets, chartMods);
}

function refresh_chart_damage_per_second() {
	let weaponData = gen_damage_per_second_data();
	
	sort_bar_data(weaponData);
	chart_update_damage_per_second(chart, weaponData, chartMods);
}

function refresh_chart_damage_per_mag() {
	let weaponData = gen_damage_per_mag_data();
	
	sort_bar_data(weaponData);
	chart_update_damage_per_mag(chart, weaponData, chartMods, globalWeaponMods.magRarity);
}

function refresh_chart() {
	switch(chartMods.type) {
		case ChartTypes.TTK_OVER_ACCURACY: { refresh_chart_ttk_over_accuracy(); } break;
		case ChartTypes.DAMAGE_OVER_TIME:  { refresh_chart_damage_over_time(); } break;
		case ChartTypes.DAMAGE_PER_SECOND: { refresh_chart_damage_per_second(); } break;
		case ChartTypes.DAMAGE_PER_MAG:    { refresh_chart_damage_per_mag(); } break;
	}
}

function change_chart_type(type) {
	chartMods.type = type;
	chart = chart_change_type(chart, chartMods);
	refresh_chart();
	show_and_hide();
}

function page_setup_charts() {
	// Chart mods
	let canvasId = 'statChart';
	let chartType = Number(chartSelect.value);
	let seconds = Number(secondsSlider.value);
	let showShields = showShieldsCheckbox.checked;
	let minAccuracy = Number(minAccuracySlider.value);
	let maxAccuracy = Number(maxAccuracySlider.value);
	
	chartMods = new ChartModifiers(canvasId, chartType, seconds, showShields, minAccuracy, maxAccuracy);
	
	chart = chart_create(chartMods);
	refresh_chart();
}
