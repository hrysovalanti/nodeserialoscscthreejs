s.boot();
(
SynthDef(\help_Control_DynKlank, { arg out=0, freq = 40;
    var klank, harm, amp, ring;

    // harmonics
    harm = Control.names(\harm).kr(Array.series(4, 1, 1));
    // amplitudes
    amp = Control.names(\amp).kr(Array.fill(4, 0.05));
    // ring times
    ring = Control.names(\ring).kr(Array.fill(4, 1));
	klank = DynKlank.ar(`[harm, amp, ring], {ClipNoise.ar(0.003)}.dup, freq);
    Out.ar(out, klank);
}).add;


a = Synth(\help_Control_DynKlank, [\freq, 600]);
b = Synth(\help_Control_DynKlank, [\freq, 70]);
c = Synth(\help_Control_DynKlank, [\freq, 120]);
d = Synth(\help_Control_DynKlank, [\freq, 360]);
OSCdef.new(
	\toplayasynth,
	{
		arg msg, time, addr, port;
		a.set(\freq,msg[1]);
		a.set(\mul,msg[1]*200);

		b.set(\mul,msg[1]*1/4);

		c.set(\freq, msg[1]/2);

		d.set(\freq, msg[1]*2);


		//msg[1].postln();
	},
	//here you put the path of the object that sends the play command to sc
	'\message'
);
 SynthDef( \drones2, {
	arg freqd= 10, atkd=0.05, reld=0.3, ampd=1, pand=0, outd=0;
	var sigd= Impulse.ar(freqd),
envd=EnvGen.kr(Env.new([0,1,0]), [atkd,reld], [1,-1], doneAction:2);
	sigd= Pan2.ar(sigd,ampd,pand);
	sigd = sigd * envd;
	Out.ar(outd,sigd);
}).add;

~myinstrument= Pdef(\droneslive,
	Pbind(
		\instrument, \drones2,
		\dur, Pseq([0.2,0.8,0.2,0.8,0.2], inf),
		\drone, Pseq([120,130,160,180,220,140],inf),
		\pand, Pwhite(-0.1, 0.1, inf),
		\harmonic, Pseq([120,130,160,180,220,140],inf).round,
		\ampd, Pkey(\harmonic).reciprocal *0.8,
		\atkd, Pseq([0.8,0.4, 0.8, 0.4,0.8], inf),
		\reld, Pwhite(-1.3,1.3,inf),
)).play;
)


