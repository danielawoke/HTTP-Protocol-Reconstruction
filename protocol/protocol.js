const { execSync, exec, spawn } = require('child_process');
const { readFile } = require('fs');
const fs = require('fs');


//This is the Primary function for creating requests. 
//This function will provide a file for the HTTP 
//request and response locally when ran.

// Example inputs:
// HTTPProtocol("GET", "www.google.com",null,"password")
// HTTPProtocol("POST", "www.amazon.com",{load:2,blocks:"EMPTY"},"password")

function HTTPProtocol(HTTPRequestType,Domain,Paylaod,BashPassword){
    DomainAndEndPointArray = splitUrl(Domain);
    let AllIPAddresses = dnsResolution(DomainAndEndPointArray[0]);
    const IPv4Address = AllIPAddresses.filter(isValidIPv4);
    let connection = ThreeWayHandshake(IPv4Address[0], BashPassword);
    setTimeout(() => {
        connection.kill();
        console.log("kiiled");
        execSync("npx kill-port 80");
        let httpResponse = ["Null Response, check domain"];
        HTTPRequest(HTTPRequestType, DomainAndEndPointArray[1], Paylaod, IPv4Address[0], BashPassword);
    }, 1000);
    
}

function isValidIPv4(ip) {
    const ipv4Regex = /^(?:[1-9]?\d|1\d\d|2(?:[0-4]\d|5[0-5]))(?:\.(?:[1-9]?\d|1\d\d|2(?:[0-4]\d|5[0-5]))){3}$/;
    return ipv4Regex.test(ip);
}

function dnsResolution(domain){
    let outputBuffer = execSync('ipconfig /displaydns');
    const DNSCachedIPsString = outputBuffer.toString();
    const DNSCachedIPsMap = DNSCachedIPsStringToMap(DNSCachedIPsString);

    if(DNSCachedIPsMap.get(domain) != null){
        return [DNSCachedIPsMap.get(domain)];
    }
    
    outputBuffer = execSync(`nslookup ${domain}`);
    let LocalDNSQueryString = outputBuffer.toString()
    const IPAddresses  = LocalDNSQueryStringParse(LocalDNSQueryString);
    return IPAddresses;

}

function LocalDNSQueryStringParse(LocalDNSQueryString){

    const ipRegex =
    /\b(?:\d{1,3}\.){3}\d{1,3}\b|\b(?:[a-fA-F0-9]{1,4}:){2,7}[a-fA-F0-9]{0,4}\b/g;
    const ips = LocalDNSQueryString.match(ipRegex) || [];
    return ips;
}

function DNSCachedIPsStringToMap(DNSCachedIPsString){
    const DNSCacheMap = new Map();
    DNSCachedIPs = DNSCachedIPsString.split("----------------------------------------");
    for(let i = 0; i<DNSCachedIPs.length; i++){
        let DomainKeyString = "Record Name . . . . . : ";
        DomainStringIndex = DNSCachedIPs[i].indexOf(DomainKeyString);
        DomainWithTrailing = DNSCachedIPs[i].substring(DomainStringIndex+DomainKeyString.length);
        Domain = DomainWithTrailing.substring(0,DomainWithTrailing.indexOf("\n")-1);

        let IPKeyString = "A (Host) Record . . . : ";
        IPStringIndex = DNSCachedIPs[i].indexOf(IPKeyString);
        if(IPStringIndex!=-1){
            IPWithTrailing = DNSCachedIPs[i].substring(IPStringIndex+IPKeyString.length);
            IP = IPWithTrailing.substring(0, IPWithTrailing.indexOf("\n")-1);
            DNSCacheMap.set(Domain,IP);
        }

        // Ommitted since IPv6 is incompatible with hping3

        // IPKeyString = "AAAA Record . . . . . : ";
        // IPStringIndex = DNSCachedIPs[i].indexOf(IPKeyString);
        // if(IPStringIndex!=-1){
        //     IPWithTrailing = DNSCachedIPs[i].substring(IPStringIndex+IPKeyString.length);
        //     IP = IPWithTrailing.substring(0, IPWithTrailing.indexOf("\n")-1);
        //     DNSCacheMap.set(Domain,IP);
        //     continue;
        // }

    }
    
    return DNSCacheMap;

}

function ThreeWayHandshake(IPAdress, BashPassword){
    fileOfCommandsString = `bash\nsudo -S hping3 -S -p 80 --ack ${IPAdress}\n${BashPassword}\n`;
    try {
        fs.writeFileSync('commands.txt', fileOfCommandsString);
    } catch (err) {
        console.error(err);
    }
    const shellCommand = process.platform === 'win32' ? 'cmd.exe' : '/bin/sh';
    const connection = spawn(shellCommand, [], {
        stdio: ['pipe', process.stdout, process.stderr]
    });
    const commandStream = fs.createReadStream('commands.txt');
    commandStream.pipe(connection.stdin);
    return connection;
}

async function HTTPRequest(RequestType, URLEndPoint, Paylaod, IPAddress, BashPassword){
    HTTPRequestFileString = `${RequestType} ${URLEndPoint} HTTP/1.1 \r\nHost: ${IPAddress}\r\nUser-Agent: hping3-custom-client\r\nAccept: text/html\r\nConnection: close\r\n`;
    if(RequestType == "POST"){
        const StringifiedPayload = JSON.stringify(Paylaod); 
        const FormatedStringifiedPayload = JSON.stringify(StringifiedPayload, null, '\t');
        HTTPRequestFileString += "\r\n"+FormatedStringifiedPayload;
    }
    try {
        fs.writeFileSync('HTTPRequestFile.txt', HTTPRequestFileString);
    } catch (err) {
        console.error(err);
    }
    fileOfCommandsString = `socat - TCP:${IPAddress}:80 < HTTPRequestFile.txt\n`;
    try {
        fs.writeFileSync('commands.sh', fileOfCommandsString);
    } catch (err) {
        console.error(err);
    }
    setTimeout(() => {
        try {
            HTTPResponse = execSync(`bash -x commands.sh`);
            try {
                fs.writeFileSync('HTTPResponse.txt', HTTPResponse.toString());
            } catch (err) {
                console.error(err);
            }
            console.log('Script executed successfully.');
        } catch (error) {
            console.error(`Error executing script: ${error.message}`);
            process.exit(1);
        }
    },2000);
}

function getFileSizeSyncInBytes(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size; // Size in bytes
  } catch (err) {
    console.error(err.message);
    return -1; // Or handle the error as appropriate
  }
}

function splitUrl(url) {
  const u = new URL(url);
  return [u.hostname, u.pathname + u.search + u.hash];
}


