function plotPoints(points) {
    var graphDiv = document.getElementById('plotId')

    var data = [{
      x: points.map(d => d.ts),
      y: points.map(d => d.value),
      type: 'scatter',
      mode: 'lines+markers',
    }];

    var layout = {
      title: 'Analog Read vs Time',
      xaxis: {
        title: 'Time (s)',
        showgrid: false,
        zeroline: false
      },
      yaxis: {
        title: 'Pression (MPa)',
        showline: false
      }
    };

    Plotly.react(
        graphDiv,
        data,
        layout,
        config={displaylogo: false, responsive: true},
    );
}

