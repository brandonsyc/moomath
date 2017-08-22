module body() {
    //main body
    cylinder(40,21,20,$fn=70);
    cylinder(120,18,17,$fn=70);
    //nuts
    translate([0,0,25]) cylinder(14,21,21,$fn=15);
    intersection() {
        translate([0,0,39]) cylinder(10,21,21,$fn=15);
        translate([-20,-40,0]) cube([80,40,60]);
    }
    //top ring
    translate([0,0,110]) cylinder(10,17.5,17.5,$fn=70);
}

module flaps() {
    //connectors
    translate([-50,0,45]) rotate([0,90,0]) cylinder(100,1.5,1.5,$fn=20);
    //main flaps
    translate([29,0.5,10]) rotate([90,0,0]) cube([23,32,1]);
    translate([29,0.5,48]) rotate([90,0,0]) cube([23,32,1]);
    translate([-29-23,0.5,10]) rotate([90,0,0]) cube([23,32,1]);
    translate([-29-23,0.5,48]) rotate([90,0,0]) cube([23,32,1]);
    //tiny connectors
    translate([-29-19,0.25,40]) rotate([90,0,0]) cube([1,10,0.5]);
    translate([-29-16,0.25,40]) rotate([90,0,0]) cube([1,10,0.5]);
    translate([-29-8,0.25,40]) rotate([90,0,0]) cube([1,10,0.5]);
    translate([-29-5,0.25,40]) rotate([90,0,0]) cube([1,10,0.5]);
    translate([28+19,0.25,40]) rotate([90,0,0]) cube([1,10,0.5]);
    translate([28+16,0.25,40]) rotate([90,0,0]) cube([1,10,0.5]);
    translate([28+8,0.25,40]) rotate([90,0,0]) cube([1,10,0.5]);
    translate([28+5,0.25,40]) rotate([90,0,0]) cube([1,10,0.5]);
}

module cones() {
    //connectors
    translate([0,55,45]) rotate([90,0,0]) cylinder(110,0.5,0.5,$fn=10);
    //main cones
    translate([0,53,50]) rotate([180,0,0]) difference() {
        cylinder(6,9,0,$fn=40);
        translate([0,0,-0.5]) cylinder(6,9,0,$fn=40);
    }
    translate([-5,-53,45]) rotate([180,270,0]) difference() {
        cylinder(6,9,0,$fn=40);
        translate([0,0,-0.5]) cylinder(6,9,0,$fn=40);
    }
}

module lid() {
    //main lid
    translate([-50 * 0.3,22,150]) rotate([-100,0,0]) scale(0.3) linear_extrude(2) union() {
        square([100,100]);
        translate([25,-25,0]) square([50,125]);
        translate([25,0,0]) circle(25);
        translate([75,0,0]) circle(25);
    }
    //connectors
    translate([-50 * 0.3,22,150]) rotate([-100,0,0]) scale(0.3) linear_extrude(1) union() {
        translate([20,90,0]) square([10,30]);
        translate([70,90,0]) square([10,30]);
    }
}

module internal() {
    //main internal
    difference() {
        translate([0,0,30]) cylinder(10,20,20,$fn=15);
        translate([0,0,40.1]) mirror([0,0,1]) cylinder(2,18,0,$fn=15);
    }
    translate([-17,0,80]) rotate([0,90,0]) cylinder(34,0.5,0.5,$fn=10);
    rotate([0,0,90]) translate([-17,0,80]) rotate([0,90,0]) cylinder(34,0.5,0.5,$fn=10);
    translate([0,0,76]) cylinder(5,5,5);
}

difference() {
    union() {
        body();
        flaps();
        cones();
        lid();
    }
    //inside
    translate([0,0,15]) cylinder(130,16,16,$fn=70);
}
internal();