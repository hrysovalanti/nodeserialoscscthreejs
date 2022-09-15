//create a server
const express= require('express');
//create a websocket to serve a client or more
const ws = require ("ws");
const osc = require("osc");
const app = express();
const PORT = 3000;
app.use(express.static("public"));
// app.get('/', function(req,res){
//     console.log("somebody knocked")
//     res.send("hello world")
// })

const server = app.listen(PORT);

const wss = new ws.Server({server});
let connections = new Array;  
//event handling
wss.on("connection", function(client){
    console.log("I received a connection!")
    connections.push(client);

    client.on('message', sendToSerial);
   
    client.on('close', function() { // when a client closes its connection
        console.log("connection closed"); // print it out
        let position = connections.indexOf(client); // get the client's position in the array
        connections.splice(position, 1); // and delete it from the array
      });

})

function broadcast(data) {
    for (myConnection in connections) {   // iterate over the array of connections
      connections[myConnection].send(data); // send the data to each connection
    }
  }



const {SerialPort} = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline')
const portName = process.argv[2];


const port =new SerialPort({ path: '/dev/cu.usbmodem63242401', baudRate: 9600 })
//const Readline = SerialPort.parsers.Readline; // make instance of Readline parser
const parser = new ReadlineParser(); // make a new parser to read ASCII lines
port.pipe(parser); // pipe the serial stream to the parser

port.on('open', showPortOpen);
parser.on('data', readSerialData);
//parser.on('oscdata', udpsendfunc);
port.on('close', showPortClose);
port.on('error', showError);


//port.write("Robot power on");

function showPortOpen() {
    console.log('port open. Data rate: ' + port.baudRate);
  }
   
  function readSerialData(data) {
    console.log(data);
    if (connections.length > 0) {
        broadcast(data);
      }
  }
   
  function showPortClose() {
    console.log('port closed.');
  }
   
  function showError(error) {
    console.log('Serial port error: ' + error);
  }

  function sendToSerial(data){
    console.log("sending to serial: " +data);
   port.write(data)
  }  
 
 // ----------OSC
 const udpPort = new osc.UDPPort({
  // This is the port we're listening on.
  localAddress: "127.0.0.1",
  localPort: 57121,

  // This is where sclang is listening for OSC messages.
  remoteAddress: "127.0.0.1",
  remotePort: 57120
});
  
udpPort.open();

 function udpsendfunc() {

  var msg = {
      address: "/message",
      args: [Math.floor(Math.random()*100)]
  };
 // console.log(ws.data);
  console.log("Sending message", msg.address, msg.args, "to", udpPort.options.remoteAddress + ":" + udpPort.options.remotePort);
  udpPort.send(msg);
}
//udpPort.pipe(parser);
// Every second, send an OSC message to SuperCollider
setInterval(udpsendfunc, 6000);