let clicked = [undefined, undefined];

let selectedUnits = 'pressure [MPa]';
let graphDiv = document.getElementById('plotId');

///////////////////////////////////////////////////////////////////////////////
function initPlot() {
  // Create the plot for the first time (needed because the plot needs to be
  // created after the div element becomes visible)
  let layout = {
    title: 'Analog Read vs Time',
    xaxis: {
      title: 'time [s]',
      showgrid: false,
      zeroline: false,
      uirevision: true,
    },
    yaxis: {
      title: selectedUnits,
      showline: false,
      uirevision: true,
    },
    hovermode: 'x',
    showlegend: false,
  };

  Plotly.newPlot(
    graphDiv,
    [],
    layout,
    config={displaylogo: false, responsive: true},
  );

  // To read X click position (inspired by https://codepen.io/etpinard/pen/EyydEj)
  d3.select('#plotId').style('padding', 0);  // This is needed to avoid any offset in the mouse position
  d3.select('#plotId').select('.nsewdrag').on('click', function(evt) {
    var xaxis = graphDiv._fullLayout.xaxis;
    var l = graphDiv._fullLayout.margin.l;
    var xInDataCoord = xaxis.p2c(evt.x - l);
    clicked = [clicked.slice(-1)[0], xInDataCoord];
    // update plot
    Plotly.relayout(
      graphDiv,
      {shapes: [getVLine(clicked[0]), getVLine(clicked[1])]}
    )
    // update input value
    if (clicked[0] != undefined && clicked[1] != undefined) {
      let vmin = d3.min(clicked) * 1000;
      let vmax = d3.max(clicked) * 1000;
      document.getElementById("inputTInterval").value = `${vmax.toFixed(0)} - ${vmin.toFixed(0)} = ${(vmax - vmin).toFixed(0)} ms`;
    }
  });
}

///////////////////////////////////////////////////////////////////////////////
function getVLine(xPos) {
  if (xPos === undefined) {
    return;
  }
  return {
      type: 'line',
      xref: 'x',
      yref: 'paper',
      x0: xPos,
      x1: xPos,
      y0: 0,
      y1: 1,
      line: {width: 1, color: 'red'},
  }
}

///////////////////////////////////////////////////////////////////////////////
function plotPoints(points) {
    let limitMin = 0.69;
    let limitMax = 1.35;
    let displayText = '';

    if (points.length > 0) {

      let lastMeasure = points.slice(-1)[0][selectedUnits];
      if (lastMeasure == undefined) {
        // The last point can be undefined if the acquisition is stopped
        lastMeasure = points.slice(-2)[0][selectedUnits];
      }

      switch(selectedUnits) {
        case 'pressure [MPa]':
          displayText = `${lastMeasure.toFixed(5)} MPa`;
          break;
        case 'pressure [kPa]':
          limitMin *= 1000;
          limitMax *= 1000;
          displayText = `${lastMeasure.toFixed(2)} kPa`;
          break;
        case 'pressure [psi]':
          limitMin *= 145.038;
          limitMax *= 145.038;
          displayText = `${lastMeasure.toFixed(3)} psi`;
          break;
        case 'serial read':
          limitMin = getPressureMPa.invert(limitMin);
          limitMax = getPressureMPa.invert(limitMax);
          displayText = `${lastMeasure.toFixed(0)}`;
        default:
          break;
      }

    }

    // Update digit display
    d3.select("#digitDisplay").text(displayText);

    // Update plot
    var data = [];
    data.push({
      x: points.map(d => d['time [s]']),
      y: points.map(d => d[selectedUnits]),
      type: 'scatter',
      mode: 'lines+markers',
      fill: 'tozeroy',
      showlegend: false,
      name: '',
    });
    let checked = document.getElementById("switchLimits").checked;
    if (checked && points.length > 0) {
      data.push({
        x: [points[0]['time [s]'], points.slice(-1)[0]['time [s]']],
        y: [limitMin, limitMin],
        type: 'scatter',
        marker: {color: '#ff7f0e'},
        line: {width: 2},
        mode: 'lines',
        name: 'MIN',
      });
      data.push({
        x: [points[0]['time [s]'], points.slice(-1)[0]['time [s]']],
        y: [limitMax, limitMax],
        type: 'scatter',
        marker: {color: '#ff7f0e'},
        line: {width: 2},
        mode: 'lines',
        name: 'MAX',
      });
    }

    let layout = {
      title: 'Analog Read vs Time',
      xaxis: {
        title: 'time [s]',
        showgrid: false,
        zeroline: false,
        uirevision: true,
      },
      yaxis: {
        title: selectedUnits,
        showline: false,
        uirevision: true,
      },
      hovermode: 'x',
      showlegend: false,
      shapes: [getVLine(clicked[0]), getVLine(clicked[1])],
    };

    Plotly.react(
        graphDiv,
        data,
        layout,
    );

}