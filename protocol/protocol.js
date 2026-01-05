const { execSync } = require('child_process');
const { readFile } = require('fs');
const fs = require('fs');

function HTTPProtocol(HTTPRequestType,Domain,Paylaod){
    IP = dnsResolution(Domain);
    ThreeWayHandshake(IP);
    
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

        IPKeyString = "AAAA Record . . . . . : ";
        IPStringIndex = DNSCachedIPs[i].indexOf(IPKeyString);
        if(IPStringIndex!=-1){
            IPWithTrailing = DNSCachedIPs[i].substring(IPStringIndex+IPKeyString.length);
            IP = IPWithTrailing.substring(0, IPWithTrailing.indexOf("\n")-1);
            DNSCacheMap.set(Domain,IP);
            continue;
        }

        
    }
    
    return DNSCacheMap;

}
function SYN(){
    let output = execSync(`sudo hping3 -S -p 80 ${IPAdress}`);
}
function ThreewayHandshake(IPAdress){
    SYN();
}
