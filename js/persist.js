const dtFormat = d3.timeFormat("%Y-%m-%d_%H-%M-%S");

///////////////////////////////////////////////////////////////////////////////
function formatData(value, precision){
    return (value.toFixed(precision)).toString().replace('.', ',');
}

///////////////////////////////////////////////////////////////////////////////
async function saveData(){
    let dt = dtFormat(new Date());
    document.getElementById("inputDate").value = dt;
    let analyst = document.getElementById("inputAnalyst").value;
    let sampleNum = document.getElementById("inputSampleNumber").value;
    let timeInterval = document.getElementById("inputTInterval").value;

    let contents = '';
    contents += `# DATETIME: ${dt}\n`;
    contents += `# ANALYST: ${analyst}\n`;
    contents += `# SAMPLE: ${sampleNum}\n`;
    contents += `# CALIBRATION: pressure[MPa] = ${intercept} + ${slope} * serial_read\n`;
    contents += `# TIME INTERVAL: ${timeInterval}\n`;
    // column names
    contents += 'time[s]\tserial_read\tpressure[MPa]\tpressure[kPa]\tpressure[psi]\n'
    points.forEach(function(d) {
        if (d['serial read'] != undefined) {
            contents += formatData(d['time [s]'], 3) + '\t'
            contents += formatData(d['serial read'], 0) + '\t'
            contents += formatData(d['pressure [MPa]'], 5) + '\t'
            contents += formatData(d['pressure [kPa]'], 2) + '\t'
            contents += formatData(d['pressure [psi]'], 3) + '\n'
        }
    });

    const blob = new Blob([contents], { type: 'text/csv;charset=utf-8;' });

    // create a new handle
    const newHandle = await window.showSaveFilePicker({
        suggestedName: dt + '.tsv',
    });

    // create a FileSystemWritableFileStream to write to
    const writableStream = await newHandle.createWritable();

    // write our file
    await writableStream.write(blob);

    // close the file and write the contents to disk.
    await writableStream.close();

}

///////////////////////////////////////////////////////////////////////////////
function deleteData(){
    let confirmation = confirm(
        'Are you sure you want to delete all the data? This action CANNOT be undone.'
    );
    if (confirmation) {
        points = [];
        plotPoints(points);
    }
}