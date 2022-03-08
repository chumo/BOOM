// Inspired by https://web.dev/serial/

let SAMPLING_MILISECONDS = 100;

let points = [];
let lineBuffer = '';
let latestValue = 0;

// Calibration PressureMPa = SerialRead * slope + intercept
const slope = 0.0035096962149913954;
const intercept = -0.6122271401533294;
const getPressureMPa = d3.scaleLinear()
               .domain([0, 1])
               .range([intercept, slope + intercept]);

// FUNCTION TO START THE SERIAL PORT AND THE CONTINUOUS UPDATE OF latestValue
async function getReader() {
    // Inspired by https://github.com/svendahlstrand/web-serial-api

    // Filter on devices with the Arduino Uno USB Vendor/Product IDs.
    const filters = [
        { usbVendorId: 0x2341, usbProductId: 0x0043 },
        { usbVendorId: 0x2341, usbProductId: 0x0001 }
    ];

    // Prompt user to select an Arduino Uno device.
    const port = await navigator.serial.requestPort({ filters });

    // Wait for the serial port to open.
    await port.open({ baudRate:  9600});

    // Remove the button so that user cannot open the port twice.
    d3.select('#button').remove();
    d3.select('#layoutUI').style('display', 'inline');
    initPlot();

    const appendStream = new WritableStream({
      write(chunk) {
        lineBuffer += chunk;

        let lines = lineBuffer.split('\n');

        if (lines.length > 1) {
          lineBuffer = lines.pop();
          latestValue = parseInt(lines.pop().trim());
        }
      }
    });

    port.readable
      .pipeThrough(new TextDecoderStream())
      .pipeTo(appendStream);

}

// FUNCTION TO FETCH PERIODICALLY AND PLOT THE latestValue
function acquire(elapsed) {
    let checked = document.getElementById("switch").checked;
    if (checked) {
        let pressureMPa = getPressureMPa(latestValue);
        points.push(
            {
                'time [s]': elapsed / 1000,
                'serial read': latestValue,
                'pressure [MPa]': pressureMPa,
                'pressure [kPa]': pressureMPa * 1000,
                'pressure [psi]': pressureMPa * 145.038,
            }
        );
        plotPoints(points);
    } else if (!checked && points.length > 1) {
        if (points.slice(-1)[0]['serial read'] != undefined) {
            points.push(
                {
                    'time [s]': elapsed / 1000,
                    'serial read': undefined,
                    'pressure [MPa]': undefined,
                    'pressure [kPa]': undefined,
                    'pressure [psi]': undefined,
                }
            );
        }
    }
}

// EXECUTE THE ACQUISITION IN REGULAR INTERVALS
const interval = d3.interval(acquire, SAMPLING_MILISECONDS);
