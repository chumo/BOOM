async function saveFunc(){

    let contents = '';
    points.forEach(function(d) {
        if (d.value != undefined) {
            contents += d.ts + ',' + d.value + '\n'
        }
    });

    const blob = new Blob([contents], { type: 'text/csv;charset=utf-8;' });

    // create a new handle
    const newHandle = await window.showSaveFilePicker();

    // create a FileSystemWritableFileStream to write to
    const writableStream = await newHandle.createWritable();

    // write our file
    await writableStream.write(blob);

    // close the file and write the contents to disk.
    await writableStream.close();
}