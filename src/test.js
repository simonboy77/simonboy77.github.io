const clrBackground = 'BD313A';
const clrCommon = '9CACAD';
const clrRare = '51A8D6';
const clrEpic = 'B237C8';
const clrLegendary = 'CEAD21';
const clrMythic = 'FF4E1D';

const xValues = ["None", "Common", "Rare", "Epic"];
const yValues = [19, 23, 27, 29];
const barColors = ["gray", "white","blue","purple"];

const myData = {
  labels: ['test', 'test', 'test', 'test', 'test', 'test', 'test'],
  datasets: [{
    label: 'Flatline None',
    data: flatline.fire_for_time(10.0, Rarity.NONE),
    fill: false,
    borderColor: 'rgb(75, 192, 192)'
  }, {
  	label: 'Flatline Epic',
    data: flatline.fire_for_time(10.0, Rarity.EPIC),
    fill: false,
    borderColor: 'rgb(12, 102, 192)'
  }, {
  	label: 'Common Armour',
  	data: [{x:0,y:150},{x:10,y:150}],
  	borderColor: 'rgb(12, 102, 192)',
  	borderDash: [5, 5]
  }]
};

console.log(myData.datasets[0].data);

let chart = new Chart('myChart', {
	type: 'line',
	data: myData,
	
	options: {
		scales: {
			x: {
				min: 0,
				max: 10,
				type: 'linear'
			},
			y: {
				min: 0,
				max: 2000
			}
		},
		plugins: {
			title: {
				display: true,
				text: 'Damage over time'
				},
			legend: {
				display: false
			},
			tooltip: {
				enabled: false
			},
			annotation: {
				annotations: {
					common: {
						type: 'line',
						yMin: 150,
						yMax: 150,
						borderColor: 'rgb(0, 99, 132)',
						borderWidth: 20
					}
				}
			}
		},
		elements: {
			point: {
				pointStyle: false
			}
		}
	}
});

/*var testChart = new Chart("testChart", {
	type: "bar",
	data: {
		labels: xValues,
		datasets: [{
		backgroundColor: barColors,
		data: yValues
		}],
	},
	options: {
		scales: {
			y: {
				min: 0,
			}
		},
		plugins: {
			title: {
				display: true,
				text: "Flatline Mags"
				},
			legend: {
				display: false
			}
		}
	}
});*/

/*
var slider = document.getElementById("magTierCount");

slider.oninput = function() {
	chart.data.labels.push("Goofy");
	chart.update();
}*/

// Damage mods
let armourSelect = document.getElementById
let accuracySlider = document.getElementById("input_accuracy");
let headshotSlider = document.getElementById("input_headshot");
let legshotSlider = document.getElementById("input_legshot"); 

let accuracyText = document.getElementById("accuracyText");
let headshotText = document.getElementById("headshotText");
let legshotText = document.getElementById("legshotText");

function update_slider_text(slider, text)
{
	text.value = slider.value + "%";
}

function setup_page()
{
	update_slider_text(accuracySlider, accuracyText);
	update_slider_text(headshotSlider, headshotText);
	update_slider_text(legshotSlider, legshotText);
}

accuracySlider.oninput = function() { update_slider_text(this, accuracyText); }

headshotSlider.oninput = function()
{
	update_slider_text(this, headshotText);
	
	if ((Number(headshotSlider.value) + Number(legshotSlider.value)) > 100) {
		legshotSlider.value = 100 - Number(headshotSlider.value);
		update_slider_text(legshotSlider, legshotText);
	}
}

legshotSlider.oninput = function()
{
	update_slider_text(this, legshotText);
	
	if ((Number(headshotSlider.value) + Number(legshotSlider.value)) > 100) {
		headshotSlider.value = 100 - Number(legshotSlider.value);
		update_slider_text(headshotSlider, headshotText);
	}
}

