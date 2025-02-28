let chart;
let chartMods;

// Chart handling
function refresh_chart_time_to_kill() {
	let weaponData = gen_time_to_kill_data();
	let shieldRarity = Number(shieldSelect.value);
	let accuracy = Number(accuracySlider.value);
	
	sort_bar_data(weaponData);
	chart_update_time_to_kill(chart, weaponData, chartMods, shieldRarity, accuracy);
}

function refresh_chart_ttk_over_accuracy() {
	let weaponDatasets = gen_ttk_over_accuracy_data();
	let shieldRarity = Number(shieldSelect.value);
	
	chart_update_ttk_over_accuracy(chart, weaponDatasets, chartMods, shieldRarity);
}

function refresh_chart_damage_over_time() {
	let weaponDatasets = gen_damage_over_time_data();
	chart_update_damage_over_time(chart, weaponDatasets, chartMods);
}

function refresh_chart_dps_infinite_mag() {
	let weaponData = gen_dps_infinite_mag_data();
	
	sort_bar_data(weaponData);
	chart_update_dps_infinite_mag(chart, weaponData, chartMods);
}

function refresh_chart_dps_practical() {
	let weaponData = gen_dps_practical_data();
	
	sort_bar_data(weaponData);
	chart_update_dps_practical(chart, weaponData, chartMods);
}

function refresh_chart_damage_per_mag() {
	let weaponData = gen_damage_per_mag_data();
	
	sort_bar_data(weaponData);
	chart_update_damage_per_mag(chart, weaponData, chartMods, globalWeaponMods.magRarity);
}

function refresh_chart() {
	switch(chartMods.type) {
		case ChartType.TIME_TO_KILL:      { refresh_chart_time_to_kill(); } break;
		case ChartType.TTK_OVER_ACCURACY: { refresh_chart_ttk_over_accuracy(); } break;
		case ChartType.DAMAGE_OVER_TIME:  { refresh_chart_damage_over_time(); } break;
		case ChartType.DPS_INFINITE_MAG:  { refresh_chart_dps_infinite_mag(); } break;
		case ChartType.DPS_PRACTICAL:     { refresh_chart_dps_practical(); } break;
		case ChartType.DAMAGE_PER_MAG:    { refresh_chart_damage_per_mag(); } break;
	}
}

function change_chart_type(type) {
	chartMods.type = type;
	chart = chart_change_type(chart, chartMods);
	refresh_chart();
	show_and_hide();
}

function page_setup_charts() {
	// Populate chartSelect
	for(let chartIndex = 0; chartIndex < ChartType.COUNT; ++chartIndex) {
		let chartEntry = document.createElement('option');
		chartEntry.value = chartIndex;
		chartEntry.text = get_chart_title(chartIndex);
		chartSelect.add(chartEntry);
	}
	
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
