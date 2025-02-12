const xValues = ["None", "Common", "Rare", "Epic"];
const yValues = [19, 23, 27, 29];
const barColors = ["gray", "white","blue","purple"];

var chart = new Chart("myChart", {
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
});

var slider = document.getElementById("magTierCount");

slider.oninput = function() {
  chart.data.labels.push("Goofy");
  chart.update();
}
