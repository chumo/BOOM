// Inspired by https://web.dev/serial/

let points = [];
let temp = [];

let scale = d3.scaleLinear([0, 1023], [0, 5])


function getPression(d) {
    let voltage = scale(d);
    return -0.62236269841434355 + 0.72494179984120621 * voltage;
}

document.querySelector('button').addEventListener('click', async () => {
    // Filter on devices with the Arduino Uno USB Vendor/Product IDs.
    const filters = [
        { usbVendorId: 0x2341, usbProductId: 0x0043 },
        { usbVendorId: 0x2341, usbProductId: 0x0001 }
    ];

    // Prompt user to select an Arduino Uno device.
    const port = await navigator.serial.requestPort({ filters });

    // const { usbProductId, usbVendorId } = port.getInfo();
    // console.log(usbProductId, usbVendorId)

    // Wait for the serial port to open.
    await port.open({ baudRate:  57600});  // 57600  9600

    // Remove the button so that user cannot open the port twice.
    d3.select('#button').remove();
    d3.select('#layout').style('display', 'inline');


    // Start the counter
    let ini = new Date();
    let iniMilisec = ini.getTime();

    const reader = port.readable.getReader();

    // Listen to data coming from the serial device.
    while (port.readable) {

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              // Allow the serial port to be closed later.
              reader.releaseLock();
              break;
            }
            let checked = document.getElementById("switch").checked;
            let ts = (new Date().getTime() - iniMilisec) / 1000;
            if (value && checked) {
                if ((new Date() - ini) < 1000) {
                    temp.push(...value);
                } else {
                    let pression = getPression(d3.mean(temp));
                    points.push(
                        {
                            'ts': ts,
                            'value': pression,
                        }
                    );
                    plotPoints(points);
                    ini = new Date();
                    temp = [];
                }
            } else if (value && !checked && points.slice(-1)[0].value != undefined) {
                points.push(
                    {
                        'ts': ts,
                        'value': undefined,
                    }
                );
            }
          }
        } catch (error) {
          // TODO: Handle non-fatal read error.
          console.log(error)
        }
      }
});



