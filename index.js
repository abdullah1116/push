const { networkInterfaces } = require('os');
const qrcode = require('qrcode-terminal');
const http = require('http');
const fs = require('fs');

var port = 0003;
const filePath = process.argv[3]

const serve = (count = 0) => {

    var server = http.createServer(function (req, res) {
        console.log('connected')
        try {

            fs.readFile(filePath, function (err, data) {
                res.setHeader('Content-disposition', `attachment; filename=${filePath}`);
                // res.writeHead(200, { 'Content-Type': 'text' });
                res.write(data);
                return res.end();
            });
        }
        catch (e) {
            res.end('file error')
            console.error("file error")
        }
    })

    server.on("error", err => portUp(count));
    server.on('listening', err => printQr(server))

    server.listen(port);
    server.on('listening', err => printQr())
    function portUp(count) {
        if (port >= 10) {
            console.log('port error');
        } else {
            port++;
            console.log('portUp', port)
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

//
if (filePath) {
    console.log(filePath);
    serve(port);
} else {
    console.warn('file not found')
}




