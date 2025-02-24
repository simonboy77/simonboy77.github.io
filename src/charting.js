const ChartTypes = {
	TTK_OVER_ACCURACY: 0,
	DAMAGE_OVER_TIME:  1,
	DAMAGE_PER_SECOND: 2,
	DAMAGE_PER_MAG:    3
};

function get_chart_title(type) {
	switch(type)
	{
		case ChartTypes.TTK_OVER_ACCURACY: { return 'TTK Over Accuracy'; } break;
		case ChartTypes.DAMAGE_OVER_TIME:  { return 'Damage Over Time'; } break;
		case ChartTypes.DAMAGE_PER_SECOND: { return 'Damage Per Second'; } break;
		case ChartTypes.DAMAGE_PER_MAG:    { return 'Damage Per Mag'; } break;
	}
	
	return 'Unknown Chart Type';
}

let baseOptions = {
	maintainAspectRatio: false,
	
	scales: {
		x: {
			min: 0,
			title: {
				display: true,
				text: 'X-Axis'
			}
		},
		y: {
			position: 'left',
			beginAtZero: true,
			title: {
				display: true,
				text: 'Y-Axis'
			}
		},
		yRight: {
			position: 'right',
			grid: {
				drawOnChartArea: false // don't draw the grid lines for this axis
			},
			afterDataLimits: function(axis) {
				const y = axis.chart.scales.y;
				y.determineDataLimits();
				axis.min = y.min;
				axis.max = y.max;
			}
		}
	},
	plugins: {
		title: {
			display: true,
			text: 'Base Chart'
		},
		legend: {
			display: true,
			labels: {
				filter: function(item, data) { return true; }
			}
		},
		tooltip: {
			enabled: false,
			animation: {
				duration: 0
			}
		}
	},
	elements: {
		line: {
			borderWidth: 2
		},
		point: {
			pointStyle: false
		}
	},
	animation: {
		duration: 0
	}
}

let ttkOverAccuracyOptions = cloneDeep(baseOptions);
ttkOverAccuracyOptions.scales.x.type = 'linear';
ttkOverAccuracyOptions.scales.x.title.text = 'Accuracy';
ttkOverAccuracyOptions.scales.y.beginAtZero = false;
ttkOverAccuracyOptions.scales.y.title.text = 'Seconds To Kill';
ttkOverAccuracyOptions.plugins.title.text = get_chart_title(ChartTypes.TTK_OVER_ACCURACY);

let damageOverTimeOptions = cloneDeep(baseOptions);
damageOverTimeOptions.scales.x.type = 'linear';
damageOverTimeOptions.scales.x.title.text = 'Seconds';
damageOverTimeOptions.scales.y.title.text = 'Damage';
damageOverTimeOptions.plugins.title.text = get_chart_title(ChartTypes.DAMAGE_OVER_TIME);
damageOverTimeOptions.plugins.legend.labels.filter = function(item, data) { return item.text; };

let damagePerSecondOptions = cloneDeep(baseOptions);
damagePerSecondOptions.scales.x.title.display = false;
damagePerSecondOptions.scales.y.title.text = 'Damage Per Second';
damagePerSecondOptions.plugins.title.text = get_chart_title(ChartTypes.DAMAGE_PER_SECOND);
damagePerSecondOptions.plugins.legend.display = false;
damagePerSecondOptions.plugins.tooltip.enabled = true;

let damagePerMagOptions = cloneDeep(damagePerSecondOptions);
damagePerMagOptions.scales.y.title.text = 'Damage';
damagePerMagOptions.plugins.title.text = get_chart_title(ChartTypes.DAMAGE_PER_MAG);

const shieldOverlayDataset = [
	{ // Common Shield
		data: [{x:0,y:150},{x:10,y:150}],
		borderColor: clrCommon,
		borderWidth: 1,
		borderDash: [5, 5]
	}, { // Rare Shield
		data: [{x:0,y:175},{x:10,y:175}],
		borderColor: clrRare,
		borderWidth: 1,
		borderDash: [5, 5]
	}, { // Epic Shield
		data: [{x:0,y:200},{x:10,y:200}],
		borderColor: clrEpic,
		borderWidth: 1,
		borderDash: [5, 5]
	}, { // Mythic Shield
		data: [{x:0,y:225},{x:10,y:225}],
		borderColor: clrMythic,
		borderWidth: 1,
		borderDash: [5, 5]
	}
];

function sort_bar_data(barData) {
	let sorted = false;
	while(!sorted) {
		sorted = true;
		for (let dataIndex = 0; dataIndex < (barData.datasets[0].data.length - 1); ++dataIndex) {
			let value = barData.datasets[0].data[dataIndex];
			let nextValue = barData.datasets[0].data[dataIndex + 1];
			
			if (value < nextValue) {
				barData.datasets[0].data[dataIndex] = nextValue;
				barData.datasets[0].data[dataIndex + 1] = value;
				
				let labelSwap = barData.labels[dataIndex];
				barData.labels[dataIndex] = barData.labels[dataIndex + 1];
				barData.labels[dataIndex + 1] = labelSwap;
				
				let colorSwap = barData.datasets[0].backgroundColor[dataIndex];
				barData.datasets[0].backgroundColor[dataIndex] = barData.datasets[0].backgroundColor[dataIndex + 1];
				barData.datasets[0].backgroundColor[dataIndex + 1] = colorSwap;
				
				sorted = false;
			}
		}
	}
}

function chart_update_ttk_over_accuracy(chart, datasets, graphMods, shieldRarity) {
	chart.data.datasets = datasets;
	
	ttkOverAccuracyOptions.scales.x.min = graphMods.minAccuracy;
	ttkOverAccuracyOptions.scales.x.max = graphMods.maxAccuracy;
	
	let title = get_chart_title(ChartTypes.TTK_OVER_ACCURACY);
	title += ' (' + get_rarity_name(shieldRarity) + ' Shield)';
	ttkOverAccuracyOptions.plugins.title.text = title;
	
	chart.update();
}

function chart_update_damage_over_time(chart, datasets, graphMods) {
	// todo: destroy previous dataset?
	chart.data.datasets = datasets;
	if(graphMods.showShields) {
		for(let shieldIndex = 0; shieldIndex < shieldOverlayDataset.length; ++shieldIndex) {
			shieldOverlayDataset[shieldIndex].data[1].x = graphMods.seconds;
		}
		
		chart.data.datasets = chart.data.datasets.concat(shieldOverlayDataset);
	}
	
	damageOverTimeOptions.scales.x.max = graphMods.seconds
	chart.update();
}

function chart_update_damage_per_second(chart, data, graphMods) {
	chart.data = data;
	chart.update();
}

function chart_update_damage_per_mag(chart, data, graphMods, magRarity) {
	chart.data = data;
	
	let title = get_chart_title(ChartTypes.DAMAGE_PER_MAG);
	title += ' (Default Mag: ' + get_rarity_name(magRarity) + ')';
	damagePerMagOptions.plugins.title.text = title;
	
	chart.update();
}

function chart_create(chartMods) {
	switch(chartMods.type)
	{
		case ChartTypes.TTK_OVER_ACCURACY: {
			const chart = new Chart(chartMods.canvasId, {
				type: 'line',
				data: {
					datasets: []
				},
				options: ttkOverAccuracyOptions
			});
			
			chart_update_ttk_over_accuracy(chart, [], chartMods);
			return chart;
		} break;
		
		case ChartTypes.DAMAGE_OVER_TIME: {
			const chart = new Chart(chartMods.canvasId, {
				type: 'line',
				data: {
					datasets: []
				},
				options: damageOverTimeOptions
			});
			
			chart_update_damage_over_time(chart, [], chartMods);
			return chart;
		} break;
		
		case ChartTypes.DAMAGE_PER_SECOND: {
			const chart = new Chart(chartMods.canvasId, {
				type: 'bar',
				data: {
					datasets: []
				},
				options: damagePerSecondOptions
			});
			
			chart_update_damage_per_second(chart, [], chartMods);
			return chart;
		} break;
		
		case ChartTypes.DAMAGE_PER_MAG: {
			const chart = new Chart(chartMods.canvasId, {
				type: 'bar',
				data: {
					datasets: []
				},
				options: damagePerMagOptions
			});
			
			chart_update_damage_per_mag(chart, [], chartMods);
			return chart;
		} break;
	}
	
	return 0;
}

function chart_change_type(chart, chartMods) {
	chart.destroy();
	return chart_create(chartMods);
}

