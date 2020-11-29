const { networkInterfaces } = require('os');
const qrcode = require('qrcode-terminal');
const http = require('http');
const fs = require('fs');

var port = 0003;
const fileName = process.argv[2]

const serve = (count = 0) => {
    var server = http.createServer(function (req, res) {
        logHandler.client_connected();
        try {
            res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
            var readStream = fs.createReadStream(filePath);
            readStream.on('open', () => {
                readStream.pipe(res);
            });
            readStream.on('error', (err) => {
                logHandler.server_file_error(res);
            });
        }
        catch (e) {
            logHandler.server_file_error(res);
        }
    })

    server.on("error", err => portUp(count));
    server.on('listening', err => printQr(server))

    server.listen(port);

    server.on('listening', err => printQr())

    function portUp(count) {
        if (port >= 10) {
            logHandler.port_error()
        } else {
            port++;
            logHandler.port_Up(port)
            serve(+count + 1);
        }
    }
}

const printQr = (server) => {
    ipv4Array().forEach(ip => {
        const netPath = `http://${ip}:${port}`
        console.log('path', netPath);
        qrcode.generate(netPath, { small: true });
    })

}
const ipv4Array = () => {
    let ipv4 = [];
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                if (ipv4.indexOf(net.address) == -1) {
                    ipv4.push(net.address);
                }
            }
        }
    }
    return ipv4;
}
const logHandler = {
    file_not_found: (fileName, filePath = '') => {
        console.warn(`file not found: ${fileName}: ${filePath}`)
        process.exit(1)
        return;
    },
    server_file_error: (res) => {
        res.end('file error')
        console.error("file error")
    },
    port_error: () => {
        console.log('port error');
    },
    port_Up: (port) => {
        console.log('portUp', port)
    },
    client_connected: () => {
        console.log('Client connected');
    }

}

//

if (fileName) {
    filePath = fileName;
    if (!fs.existsSync(filePath)) {
        filePath = `${process.cwd()}\\${fileName}`;
        if (!fs.existsSync(filePath)) {
            logHandler.file_not_found(fileName, filePath);
            return;
        }
    }
    console.log(fileName);
    serve(port);
} else {
    logHandler.file_not_found(fileName);
}